import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { IncomingHttpHeaders } from 'http';
import type { Request } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { getAuth } from '../../modules/auth/auth.config';

function headersToWebHeaders(nodeHeaders: IncomingHttpHeaders): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(nodeHeaders)) {
    if (value === undefined) continue;
    headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }
  return headers;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user: unknown }>();

    const auth = getAuth();

    let sessionData: Awaited<ReturnType<typeof auth.api.getSession>>;
    try {
      sessionData = await auth.api.getSession({
        headers: headersToWebHeaders(request.headers),
      });
    } catch {
      throw new UnauthorizedException('Authentication required');
    }

    if (!sessionData?.user?.id) {
      throw new UnauthorizedException('Authentication required');
    }

    // Fetch full user record including role from our DB
    const user = await this.prisma.user.findUnique({
      where: { id: sessionData.user.id },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    request.user = user;
    return true;
  }
}
