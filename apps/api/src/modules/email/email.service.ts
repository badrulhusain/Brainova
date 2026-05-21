import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Resend } from 'resend';

export interface ResultSummary {
  percentageScore: number;
  scoredMarks: number;
  totalMarks: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  totalQuestions: number;
  accuracy: number;
  testName?: string;
  domainName?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly from: string;
  private readonly frontendUrl: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY!);
    this.from =
      process.env.EMAIL_FROM ?? 'Aptitude Connect <noreply@aptitudeconnect.app>';
    this.frontendUrl =
      process.env.FRONTEND_URL ?? 'http://localhost:4173';
  }

  // ── Public API ────────────────────────────────────────────────────────────

  async sendVerificationEmail(to: string, name: string, url: string): Promise<void> {
    await this.send({
      to,
      subject: 'Verify your email — Aptitude Connect',
      html: this.verificationTemplate(name, url),
    });
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    await this.send({
      to,
      subject: 'Welcome to Aptitude Connect!',
      html: this.welcomeTemplate(name),
    });
  }

  async sendResultEmail(to: string, name: string, result: ResultSummary): Promise<void> {
    await this.send({
      to,
      subject: `Your results are ready — ${result.testName ?? 'Aptitude Test'}`,
      html: this.resultTemplate(name, result),
    });
  }

  // ── Private: Resend wrapper ───────────────────────────────────────────────

  private async send(opts: { to: string; subject: string; html: string }): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });

    if (error) {
      this.logger.error(`Failed to send "${opts.subject}" to ${opts.to}:`, error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  // ── Templates ─────────────────────────────────────────────────────────────

  private verificationTemplate(name: string, url: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
      <tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px">
        <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-.3px">Aptitude Connect</h1>
      </td></tr>
      <tr><td style="padding:40px">
        <h2 style="margin:0 0 16px;color:#1e293b;font-size:20px;font-weight:600">Verify your email address</h2>
        <p style="margin:0 0 12px;color:#475569;line-height:1.6">Hi <strong>${this.esc(name)}</strong>,</p>
        <p style="margin:0 0 28px;color:#475569;line-height:1.6">
          Thanks for signing up! Click the button below to verify your email address and activate your account.
        </p>
        <table cellpadding="0" cellspacing="0"><tr><td>
          <a href="${this.esc(url)}"
             style="display:inline-block;background:#6366f1;color:#fff;font-size:15px;font-weight:600;
                    text-decoration:none;padding:14px 28px;border-radius:8px;letter-spacing:-.2px">
            Verify Email Address
          </a>
        </td></tr></table>
        <p style="margin:28px 0 0;color:#94a3b8;font-size:13px;line-height:1.6">
          This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.
        </p>
      </td></tr>
      <tr><td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0">
        <p style="margin:0;color:#94a3b8;font-size:12px">
          If the button doesn't work, copy and paste this URL into your browser:<br>
          <a href="${this.esc(url)}" style="color:#6366f1;word-break:break-all">${this.esc(url)}</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
  }

  private welcomeTemplate(name: string): string {
    const dashboardUrl = `${this.frontendUrl}/dashboard`;
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
      <tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px">
        <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-.3px">Aptitude Connect</h1>
      </td></tr>
      <tr><td style="padding:40px">
        <h2 style="margin:0 0 16px;color:#1e293b;font-size:22px;font-weight:700">Welcome aboard, ${this.esc(name)}! 🎉</h2>
        <p style="margin:0 0 16px;color:#475569;line-height:1.6">
          Your account is all set. You now have access to thousands of practice questions across
          Quantitative Aptitude, Verbal Reasoning, Logical Reasoning, and more.
        </p>
        <p style="margin:0 0 28px;color:#475569;line-height:1.6">Here's what you can do:</p>
        <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px">
          ${this.featureRow('📊', 'Take timed tests', 'Simulate real exam conditions with configurable difficulty.')}
          ${this.featureRow('📈', 'Track your progress', 'Detailed analytics show your strengths and weak areas.')}
          ${this.featureRow('🔍', 'Review answers', 'Every question comes with a full explanation.')}
        </table>
        <table cellpadding="0" cellspacing="0"><tr><td>
          <a href="${this.esc(dashboardUrl)}"
             style="display:inline-block;background:#6366f1;color:#fff;font-size:15px;font-weight:600;
                    text-decoration:none;padding:14px 28px;border-radius:8px;letter-spacing:-.2px">
            Go to Dashboard
          </a>
        </td></tr></table>
      </td></tr>
      <tr><td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center">
        <p style="margin:0;color:#94a3b8;font-size:12px">
          © ${new Date().getFullYear()} Aptitude Connect. All rights reserved.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
  }

  private resultTemplate(name: string, result: ResultSummary): string {
    const scoreColor =
      result.percentageScore >= 75
        ? '#16a34a'
        : result.percentageScore >= 50
          ? '#d97706'
          : '#dc2626';

    const resultUrl = `${this.frontendUrl}/dashboard`;

    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
      <tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px">
        <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-.3px">Aptitude Connect</h1>
      </td></tr>
      <tr><td style="padding:40px">
        <h2 style="margin:0 0 4px;color:#1e293b;font-size:20px;font-weight:600">Your results are in!</h2>
        <p style="margin:0 0 28px;color:#64748b;font-size:14px">
          ${result.testName ? this.esc(result.testName) : 'Aptitude Test'}
          ${result.domainName ? ' · ' + this.esc(result.domainName) : ''}
        </p>

        <!-- Score badge -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;margin-bottom:28px">
          <tr>
            <td style="padding:24px;text-align:center">
              <p style="margin:0 0 4px;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:.8px;font-weight:600">Score</p>
              <p style="margin:0 0 4px;font-size:48px;font-weight:800;color:${scoreColor};line-height:1">
                ${result.percentageScore.toFixed(1)}%
              </p>
              <p style="margin:0;color:#64748b;font-size:14px">${result.scoredMarks} / ${result.totalMarks} marks</p>
            </td>
          </tr>
        </table>

        <!-- Stats grid -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
          <tr>
            ${this.statCell('✅ Correct', String(result.correctCount), '#16a34a')}
            ${this.statCell('❌ Wrong', String(result.incorrectCount), '#dc2626')}
            ${this.statCell('⏭ Skipped', String(result.skippedCount), '#64748b')}
            ${this.statCell('🎯 Accuracy', result.accuracy.toFixed(1) + '%', '#6366f1')}
          </tr>
        </table>

        <table cellpadding="0" cellspacing="0"><tr><td>
          <a href="${this.esc(resultUrl)}"
             style="display:inline-block;background:#6366f1;color:#fff;font-size:15px;font-weight:600;
                    text-decoration:none;padding:14px 28px;border-radius:8px;letter-spacing:-.2px">
            View Full Review
          </a>
        </td></tr></table>

        <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;line-height:1.6">
          Keep practising — every test brings you closer to your goal.
        </p>
      </td></tr>
      <tr><td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center">
        <p style="margin:0;color:#94a3b8;font-size:12px">
          © ${new Date().getFullYear()} Aptitude Connect. All rights reserved.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
  }

  // ── Template helpers ──────────────────────────────────────────────────────

  private esc(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private featureRow(icon: string, title: string, desc: string): string {
    return `<tr>
      <td style="padding:8px 0;vertical-align:top;width:36px;font-size:20px">${icon}</td>
      <td style="padding:8px 0 8px 12px;vertical-align:top">
        <strong style="color:#1e293b;font-size:14px">${this.esc(title)}</strong><br>
        <span style="color:#64748b;font-size:13px">${this.esc(desc)}</span>
      </td>
    </tr>`;
  }

  private statCell(label: string, value: string, color: string): string {
    return `<td style="padding:16px 8px;text-align:center;border:1px solid #e2e8f0;border-radius:8px;margin:4px">
      <p style="margin:0 0 2px;font-size:20px;font-weight:700;color:${color}">${this.esc(value)}</p>
      <p style="margin:0;font-size:11px;color:#64748b;font-weight:500">${this.esc(label)}</p>
    </td>`;
  }
}
