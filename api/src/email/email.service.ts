import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false, // true pour 465, false pour les autres ports
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  /**
   * Envoie un email avec le code de réinitialisation du mot de passe
   */
  async sendPasswordResetEmail(email: string, code: string, userName: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"Myo Fitness" <${this.configService.get<string>('SMTP_USER')}>`,
        to: email,
        subject: 'Réinitialisation de votre mot de passe - Myo Fitness',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #121214;
                color: #ffffff;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 40px 20px;
              }
              .header {
                text-align: center;
                padding-bottom: 30px;
              }
              .logo {
                font-size: 32px;
                font-weight: bold;
                background: linear-gradient(to right, #94fbdd, #6dd4b8);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
              }
              .content {
                background-color: #252527;
                border-radius: 16px;
                padding: 40px;
                border: 1px solid rgba(148, 251, 221, 0.2);
              }
              .greeting {
                font-size: 24px;
                margin-bottom: 20px;
                color: #ffffff;
              }
              .message {
                color: #a0a0a0;
                line-height: 1.6;
                margin-bottom: 30px;
              }
              .code-container {
                background: linear-gradient(to right, rgba(148, 251, 221, 0.1), rgba(109, 212, 184, 0.1));
                border: 2px solid #94fbdd;
                border-radius: 12px;
                padding: 20px;
                text-align: center;
                margin: 30px 0;
              }
              .code {
                font-size: 36px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #94fbdd;
                font-family: 'Courier New', monospace;
              }
              .validity {
                color: #a0a0a0;
                font-size: 14px;
                margin-top: 10px;
              }
              .warning {
                background-color: rgba(255, 193, 7, 0.1);
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin-top: 30px;
                border-radius: 4px;
              }
              .warning-text {
                color: #ffc107;
                font-size: 14px;
                margin: 0;
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">MYO FITNESS</div>
              </div>
              <div class="content">
                <h1 class="greeting">Salut ${userName} 👋</h1>
                <p class="message">
                  Vous avez demandé à réinitialiser votre mot de passe. Utilisez le code ci-dessous pour continuer :
                </p>
                
                <div class="code-container">
                  <div class="code">${code}</div>
                  <div class="validity">Valide pendant 15 minutes</div>
                </div>

                <p class="message">
                  Entrez ce code sur la page de réinitialisation pour définir un nouveau mot de passe.
                </p>

                <div class="warning">
                  <p class="warning-text">
                    ⚠️ Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. 
                    Votre mot de passe actuel reste inchangé.
                  </p>
                </div>
              </div>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} Myo Fitness. Tous droits réservés.</p>
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error: any) {
      this.logger.error(`Failed to send password reset email to ${email}: ${error.message}`);
      throw new Error('Impossible d\'envoyer l\'email de réinitialisation');
    }
  }

  /**
   * Envoie un email de confirmation après changement de mot de passe
   */
  async sendPasswordChangedEmail(email: string, userName: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"Myo Fitness" <${this.configService.get<string>('SMTP_USER')}>`,
        to: email,
        subject: 'Votre mot de passe a été modifié - Myo Fitness',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #121214;
                color: #ffffff;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 40px 20px;
              }
              .header {
                text-align: center;
                padding-bottom: 30px;
              }
              .logo {
                font-size: 32px;
                font-weight: bold;
                background: linear-gradient(to right, #94fbdd, #6dd4b8);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
              }
              .content {
                background-color: #252527;
                border-radius: 16px;
                padding: 40px;
                border: 1px solid rgba(148, 251, 221, 0.2);
              }
              .greeting {
                font-size: 24px;
                margin-bottom: 20px;
                color: #ffffff;
              }
              .message {
                color: #a0a0a0;
                line-height: 1.6;
                margin-bottom: 20px;
              }
              .success-icon {
                text-align: center;
                font-size: 64px;
                margin: 30px 0;
              }
              .success-message {
                background: linear-gradient(to right, rgba(148, 251, 221, 0.1), rgba(109, 212, 184, 0.1));
                border: 2px solid #94fbdd;
                border-radius: 12px;
                padding: 20px;
                text-align: center;
                margin: 30px 0;
              }
              .success-text {
                font-size: 18px;
                font-weight: bold;
                color: #94fbdd;
                margin: 0;
              }
              .info-box {
                background-color: rgba(148, 251, 221, 0.05);
                border-left: 4px solid #94fbdd;
                padding: 15px;
                margin-top: 30px;
                border-radius: 4px;
              }
              .info-text {
                color: #a0a0a0;
                font-size: 14px;
                margin: 0;
              }
              .warning {
                background-color: rgba(255, 193, 7, 0.1);
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin-top: 20px;
                border-radius: 4px;
              }
              .warning-text {
                color: #ffc107;
                font-size: 14px;
                margin: 0;
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">MYO FITNESS</div>
              </div>
              <div class="content">
                <h1 class="greeting">Salut ${userName} 👋</h1>
                
                <div class="success-icon">✅</div>
                
                <div class="success-message">
                  <p class="success-text">Ton mot de passe a été modifié avec succès !</p>
                </div>

                <p class="message">
                  Cette modification a été effectuée le ${new Date().toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}.
                </p>

                <div class="info-box">
                  <p class="info-text">
                    ✨ Tu peux maintenant te connecter à ton compte Myo Fitness avec ton nouveau mot de passe.
                  </p>
                </div>

                <div class="warning">
                  <p class="warning-text">
                    ⚠️ Si tu n'es pas à l'origine de cette modification, contacte immédiatement notre support. 
                    Quelqu'un d'autre pourrait avoir accès à ton compte.
                  </p>
                </div>
              </div>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} Myo Fitness. Tous droits réservés.</p>
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password changed confirmation email sent to ${email}`);
    } catch (error: any) {
      this.logger.error(`Failed to send password changed email to ${email}: ${error.message}`);
      // On ne lance pas d'erreur ici car le mot de passe a déjà été changé
      // On log juste l'erreur
    }
  }
}
