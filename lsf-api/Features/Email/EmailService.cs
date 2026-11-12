using SendGrid;
using SendGrid.Helpers.Mail;
using Microsoft.Extensions.Options;

namespace LsfApi.Features.Email;

/// <summary>
/// Configuration pour le service d'email SendGrid
/// </summary>
public class EmailSettings
{
    public string SendGridApiKey { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = "Learn-It LSF";
    public string? BaseUrl { get; set; }
}

/// <summary>
/// Service pour envoyer des emails via SendGrid
/// </summary>
public class EmailService : IEmailService
{
    private readonly SendGridClient _sendGridClient;
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger)
    {
        _settings = settings.Value;
        _sendGridClient = new SendGridClient(_settings.SendGridApiKey);
        _logger = logger;
    }

    /// <summary>
    /// Envoie un email de réinitialisation de mot de passe
    /// </summary>
    public async Task<bool> SendPasswordResetEmailAsync(string toEmail, string userName, string token)
    {
        try
        {
            var baseUrl = _settings.BaseUrl ?? "https://learn-it-lsf.com";
            var resetLink = $"{baseUrl}/reset-password?email={Uri.EscapeDataString(toEmail)}&token={Uri.EscapeDataString(token)}";

            var subject = "Réinitialisation de votre mot de passe Learn-It LSF";
            var htmlContent = GetPasswordResetEmailTemplate(userName, resetLink);

            var message = new SendGridMessage()
            {
                From = new EmailAddress(_settings.FromEmail, _settings.FromName),
                Subject = subject,
                HtmlContent = htmlContent
            };

            message.AddTo(new EmailAddress(toEmail));

            var response = await _sendGridClient.SendEmailAsync(message);

            if (response.StatusCode == System.Net.HttpStatusCode.Accepted)
            {
                _logger.LogInformation($"Password reset email sent to {toEmail}");
                return true;
            }

            _logger.LogError($"Failed to send password reset email to {toEmail}. Status: {response.StatusCode}");
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error sending password reset email to {toEmail}");
            return false;
        }
    }

    /// <summary>
    /// Envoie un email de confirmation de suppression de compte
    /// </summary>
    public async Task<bool> SendAccountDeletionConfirmationAsync(string toEmail, string userName)
    {
        try
        {
            var subject = "Confirmation : Votre compte Learn-It LSF a été supprimé";
            var htmlContent = GetAccountDeletionEmailTemplate(userName);

            var message = new SendGridMessage()
            {
                From = new EmailAddress(_settings.FromEmail, _settings.FromName),
                Subject = subject,
                HtmlContent = htmlContent
            };

            message.AddTo(new EmailAddress(toEmail));

            var response = await _sendGridClient.SendEmailAsync(message);

            if (response.StatusCode == System.Net.HttpStatusCode.Accepted)
            {
                _logger.LogInformation($"Account deletion confirmation email sent to {toEmail}");
                return true;
            }

            _logger.LogError($"Failed to send deletion confirmation email to {toEmail}");
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error sending deletion confirmation email to {toEmail}");
            return false;
        }
    }

    /// <summary>
    /// Envoie un email de bienvenue
    /// </summary>
    public async Task<bool> SendWelcomeEmailAsync(string toEmail, string userName)
    {
        try
        {
            var subject = "Bienvenue sur Learn-It LSF !";
            var htmlContent = GetWelcomeEmailTemplate(userName);

            var message = new SendGridMessage()
            {
                From = new EmailAddress(_settings.FromEmail, _settings.FromName),
                Subject = subject,
                HtmlContent = htmlContent
            };

            message.AddTo(new EmailAddress(toEmail));

            var response = await _sendGridClient.SendEmailAsync(message);

            if (response.StatusCode == System.Net.HttpStatusCode.Accepted)
            {
                _logger.LogInformation($"Welcome email sent to {toEmail}");
                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error sending welcome email to {toEmail}");
            return false;
        }
    }

    /// <summary>
    /// Envoie un email de rappel pour revenir à l'application
    /// </summary>
    public async Task<bool> SendRemindEmailAsync(string toEmail, string userName, int daysInactive)
    {
        try
        {
            var baseUrl = _settings.BaseUrl ?? "https://learn-it-lsf.com";
            var subject = $"Reviens apprendre la LSF ! On t'a manqué";
            var htmlContent = GetRemindEmailTemplate(userName, daysInactive, baseUrl);

            var message = new SendGridMessage()
            {
                From = new EmailAddress(_settings.FromEmail, _settings.FromName),
                Subject = subject,
                HtmlContent = htmlContent
            };

            message.AddTo(new EmailAddress(toEmail));

            var response = await _sendGridClient.SendEmailAsync(message);

            if (response.StatusCode == System.Net.HttpStatusCode.Accepted)
            {
                _logger.LogInformation($"Remind email sent to {toEmail}");
                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error sending remind email to {toEmail}");
            return false;
        }
    }

    // ─────────────────────────────────── Templates HTML ───────────────────────────────────

    private string GetPasswordResetEmailTemplate(string userName, string resetLink)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
        .header h1 {{ margin: 0; font-size: 28px; }}
        .content {{ background: white; padding: 30px; border-radius: 0 0 8px 8px; }}
        .button {{ background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #999; }}
        .warning {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Réinitialisation de mot de passe</h1>
        </div>
        <div class='content'>
            <p>Bonjour <strong>{userName}</strong>,</p>
            
            <p>Vous avez demandé la réinitialisation de votre mot de passe Learn-It LSF.</p>
            
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            
            <a href='{resetLink}' class='button'>Réinitialiser mon mot de passe</a>
            
            <div class='warning'>
                <strong>Important :</strong> Ce lien expire dans 24 heures.
            </div>
            
            <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email. Votre compte restera sécurisé.</p>
            
            <p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
            <small><code>{resetLink}</code></small></p>
            
            <p>Cordialement,<br>
            <strong>L'équipe Learn-It LSF</strong></p>
        </div>
        <div class='footer'>
            <p>© 2026 Learn-It LSF. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>";
    }

    private string GetAccountDeletionEmailTemplate(string userName)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }}
        .header {{ background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
        .header h1 {{ margin: 0; font-size: 28px; }}
        .content {{ background: white; padding: 30px; border-radius: 0 0 8px 8px; }}
        .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #999; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Compte supprimé</h1>
        </div>
        <div class='content'>
            <p>Bonjour {userName},</p>
            
            <p>Ceci confirme que votre compte Learn-It LSF a été <strong>définitivement supprimé</strong>.</p>
            
            <p>Toutes vos données personnelles, y compris :</p>
            <ul>
                <li>Votre profil et informations personnelles</li>
                <li>Votre historique de progression</li>
                <li>Vos badges et scores</li>
                <li>Vos favoris</li>
            </ul>
            <p>...ont été supprimées de nos serveurs.</p>
            
            <p>Si vous souhaitez réouvrir un compte, vous pouvez vous inscrire à nouveau.</p>
            
            <p>Merci d'avoir utilisé Learn-It LSF !</p>
            
            <p>Cordialement,<br>
            <strong>L'équipe Learn-It LSF</strong></p>
        </div>
        <div class='footer'>
            <p>© 2026 Learn-It LSF. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>";
    }

    private string GetWelcomeEmailTemplate(string userName)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
        .header h1 {{ margin: 0; font-size: 28px; }}
        .content {{ background: white; padding: 30px; border-radius: 0 0 8px 8px; }}
        .button {{ background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }}
        .tips {{ background: #e8f4f8; padding: 15px; border-radius: 4px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #999; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Bienvenue sur Learn-It LSF !</h1>
        </div>
        <div class='content'>
            <p>Salut <strong>{userName}</strong>,</p>
            
            <p>Bienvenue sur <strong>Learn-It LSF</strong> ! Nous sommes ravis de vous avoir avec nous.</p>
            
            <p>Notre plateforme est conçue pour vous aider à apprendre la Langue des Signes Française de manière progressive et ludique.</p>
            
            <div class='tips'>
                <h3>Pour bien commencer :</h3>
                <ul>
                    <li><strong>Explorez les modules</strong> - Commencez par les bases et progressez à votre rythme</li>
                    <li><strong>Complétez les leçons</strong> - Regardez les vidéos de signes et pratiquez</li>
                    <li><strong>Défi quotidien</strong> - Relevez le défi du jour pour gagner des points XP</li>
                    <li><strong>Collectionnez les badges</strong> - Débloquez des achievements en progressant</li>
                </ul>
            </div>
            
            <a href='https://learn-it-lsf.com' class='button'>Commencer à apprendre</a>
            
            <p>Des questions ? Consultez notre <strong>FAQ</strong> ou <strong>contactez-nous</strong>.</p>
            
            <p>Bonne chance et amusez-vous bien en apprenant !</p>
            
            <p>Cordialement,<br>
            <strong>L'équipe Learn-It LSF</strong></p>
        </div>
        <div class='footer'>
            <p>© 2026 Learn-It LSF. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>";
    }

    private string GetRemindEmailTemplate(string userName, int daysInactive, string baseUrl)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }}
        .header {{ background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
        .header h1 {{ margin: 0; font-size: 28px; }}
        .content {{ background: white; padding: 30px; border-radius: 0 0 8px 8px; }}
        .button {{ background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }}
        .stats {{ background: #f0f7ff; padding: 15px; border-radius: 4px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #999; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>On t'a manqué, {userName} !</h1>
        </div>
        <div class='content'>
            <p>Ça fait <strong>{daysInactive} jours</strong> qu'on ne t'a pas vu sur Learn-It LSF !</p>
            
            <p>On sait que la LSF, c'est pas facile, mais tu faisais tellement de progrès avant !</p>
            
            <div class='stats'>
                <p><strong>Reviens relever le défi du jour !</strong></p>
                <p>Chaque jour, un nouveau défi t'attend avec des points XP à gagner.</p>
            </div>
            
            <a href='{baseUrl}/daily' class='button'>Relancer le défi</a>
            
            <p>Ou commence simplement par ta prochaine leçon</p>
            
            <a href='{baseUrl}/lessons' class='button'>Voir mes leçons</a>
            
            <p>À bientôt sur Learn-It LSF !</p>
            
            <p>Cordialement,<br>
            <strong>L'équipe Learn-It LSF</strong></p>
        </div>
        <div class='footer'>
            <p>© 2026 Learn-It LSF. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>";
    }
}
