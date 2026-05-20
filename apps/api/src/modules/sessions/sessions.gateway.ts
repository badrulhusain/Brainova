import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { getAuth } from '../auth/auth.config';
import { SessionsService } from './sessions.service';

interface AuthenticatedSocket extends Socket {
  data: { userId: string };
}

function headersFromSocket(socket: Socket): Headers {
  const headers = new Headers();
  const token =
    (socket.handshake.auth as Record<string, string | undefined>)['token'] ??
    socket.handshake.headers['authorization']?.replace(/^Bearer\s+/i, '');
  if (token) headers.set('authorization', `Bearer ${token}`);
  // Forward cookie header so cookie-based sessions also work
  const cookie = socket.handshake.headers['cookie'];
  if (cookie) headers.set('cookie', cookie);
  return headers;
}

@WebSocketGateway({
  namespace: '/session',
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  },
})
export class SessionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server!: Server;

  private readonly logger = new Logger(SessionsGateway.name);

  constructor(private readonly sessionsService: SessionsService) {}

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  async handleConnection(client: Socket): Promise<void> {
    try {
      const auth = getAuth();
      const session = await auth.api.getSession({ headers: headersFromSocket(client) });

      if (!session?.user?.id) {
        client.disconnect();
        return;
      }

      (client as AuthenticatedSocket).data.userId = session.user.id;
      this.logger.debug(`Client connected: ${client.id} (user ${session.user.id})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  // ── Events ────────────────────────────────────────────────────────────────

  /**
   * Client joins a session room. Must be called before any other events.
   * Emits `joined` on success or `error` on failure.
   */
  @SubscribeMessage('join_session')
  async handleJoinSession(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ): Promise<void> {
    const { sessionId } = data;
    try {
      await this.sessionsService.verifyOwnership(sessionId, client.data.userId);
      await client.join(`session:${sessionId}`);
      client.emit('joined', { sessionId });
    } catch (err) {
      client.emit('error', { message: err instanceof Error ? err.message : 'Access denied' });
    }
  }

  /**
   * Saves a single answer. Debounce / throttle should be handled on the client side.
   * Emits `answer_saved` with the saved questionId and answer.
   */
  @SubscribeMessage('save_answer')
  async handleSaveAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string; questionId: string; answer: string },
  ): Promise<void> {
    const { sessionId, questionId, answer } = data;
    try {
      await this.sessionsService.verifyOwnership(sessionId, client.data.userId);
      await this.sessionsService.saveAnswer(sessionId, questionId, answer);
      client.emit('answer_saved', { questionId, answer });
    } catch (err) {
      client.emit('error', { message: err instanceof Error ? err.message : 'Save failed' });
    }
  }

  /**
   * Toggles the "marked for review" flag on a question.
   * Emits `review_toggled` with the new flag value.
   */
  @SubscribeMessage('toggle_review')
  async handleToggleReview(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string; questionId: string },
  ): Promise<void> {
    const { sessionId, questionId } = data;
    try {
      await this.sessionsService.verifyOwnership(sessionId, client.data.userId);
      const marked = await this.sessionsService.toggleReview(sessionId, questionId);
      client.emit('review_toggled', { questionId, marked });
    } catch (err) {
      client.emit('error', { message: err instanceof Error ? err.message : 'Toggle failed' });
    }
  }

  /**
   * Records a tab-switch / focus-loss event.
   * Increments tabSwitchCount, writes a SessionEvent, and emits `tab_warned`
   * to ALL sockets in the session room (including any other open tabs).
   */
  @SubscribeMessage('tab_switch')
  async handleTabSwitch(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ): Promise<void> {
    const { sessionId } = data;
    try {
      await this.sessionsService.verifyOwnership(sessionId, client.data.userId);
      const tabSwitchCount = await this.sessionsService.recordTabSwitch(sessionId);
      this.server.to(`session:${sessionId}`).emit('tab_warned', { tabSwitchCount });
    } catch (err) {
      client.emit('error', { message: err instanceof Error ? err.message : 'Event failed' });
    }
  }
}
