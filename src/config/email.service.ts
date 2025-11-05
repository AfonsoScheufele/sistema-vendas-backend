import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendResetPasswordEmail(to: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http:

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Sistema de Vendas <noreply@axora.com>',
      to,
      subject: 'Recuperação de Senha - Sistema de Vendas',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 15px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Recuperação de Senha</h1>
          </div>
          <div class="content">
            <p>Olá,</p>
            <p>Você solicitou a recuperação de senha do seu cadastro no Sistema de Vendas.</p>
            <p>Clique no botão abaixo para redefinir sua senha:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Redefinir Senha</a>
            </p>
            <p><strong>Este link expira em 1 hora.</strong></p>
            <p>Se você não solicitou esta recuperação, ignore este e-mail.</p>
            <p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
          </div>
          <div class="footer">
            <p>Este é um e-mail automático, não responda.</p>
            <p>&copy; ${new Date().getFullYear()} Sistema de Vendas - Todos os direitos reservados</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Recuperação de Senha - Sistema de Vendas

        Você solicitou a recuperação de senha do seu cadastro.

        Clique no link abaixo para redefinir sua senha:
        ${resetUrl}

        Este link expira em 1 hora.

        Se você não solicitou esta recuperação, ignore este e-mail.

        Este é um e-mail automático, não responda.
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ E-mail de recuperação enviado para: ${to}`);
    } catch (error) {
      console.error('❌ Erro ao enviar e-mail:', error);
      throw new Error('Falha ao enviar e-mail de recuperação');
    }
  }
}
