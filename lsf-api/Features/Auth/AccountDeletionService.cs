using LsfApi.Data;
using LsfApi.Features.Email;

namespace LsfApi.Features.Auth;

/// <summary>
/// Service pour la suppression de compte utilisateur
/// </summary>
public class AccountDeletionService
{
    private readonly AppDbContext _context;
    private readonly EmailService _emailService;
    private readonly ILogger<AccountDeletionService> _logger;

    public AccountDeletionService(
        AppDbContext context, 
        EmailService emailService,
        ILogger<AccountDeletionService> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    /// <summary>
    /// Supprime complètement le compte et toutes les données associées
    /// </summary>
    public async Task<(bool Success, string Message)> DeleteAccountAsync(Guid userId)
    {
        using (var transaction = await _context.Database.BeginTransactionAsync())
        {
            try
            {
                var user = _context.Users.FirstOrDefault(u => u.Id == userId);
                if (user == null)
                    return (false, "Utilisateur non trouvé");

                // Supprimer toutes les données associées à l'utilisateur
                // Ordre important : respecter les dépendances étrangères

                // 1. Supprimer les tokens de réinitialisation
                var resetTokens = _context.PasswordResetTokens.Where(t => t.UserId == userId);
                _context.PasswordResetTokens.RemoveRange(resetTokens);

                // 2. Supprimer les statistiques de signes
                var signStats = _context.UserSignStats.Where(s => s.UserId == userId);
                _context.UserSignStats.RemoveRange(signStats);

                // 3. Supprimer les tentatives quotidiennes
                var dailyAttempts = _context.UserDailyAttempts.Where(d => d.UserId == userId);
                _context.UserDailyAttempts.RemoveRange(dailyAttempts);

                // 4. Supprimer les scores du jeu
                var gameScores = _context.GameScores.Where(g => g.UserId == userId);
                _context.GameScores.RemoveRange(gameScores);

                // 5. Supprimer les badges
                var userBadges = _context.UserBadges.Where(b => b.UserId == userId);
                _context.UserBadges.RemoveRange(userBadges);

                // 6. Supprimer les tentatives de quiz
                var quizAttempts = _context.QuizAttempts.Where(q => q.UserId == userId);
                _context.QuizAttempts.RemoveRange(quizAttempts);

                // 7. Supprimer les complétions de leçon
                var lessonCompletions = _context.UserLessonCompletions.Where(l => l.UserId == userId);
                _context.UserLessonCompletions.RemoveRange(lessonCompletions);

                // 8. Supprimer les favoris
                var favorites = _context.UserFavorites.Where(f => f.UserId == userId);
                _context.UserFavorites.RemoveRange(favorites);

                // 9. Supprimer la progression
                var progress = _context.UserProgress.FirstOrDefault(p => p.UserId == userId);
                if (progress != null)
                    _context.UserProgress.Remove(progress);

                // 10. Finalement, supprimer l'utilisateur
                _context.Users.Remove(user);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Envoyer email de confirmation
                var userEmail = user.Email;
                var userName = user.Username;
                _ = _emailService.SendAccountDeletionConfirmationAsync(userEmail, userName);

                _logger.LogInformation($"Account successfully deleted for user: {userId}");
                return (true, "Compte supprimé avec succès");

            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, $"Error deleting account for user: {userId}");
                return (false, "Erreur lors de la suppression du compte");
            }
        }
    }

    /// <summary>
    /// Exporte les données de l'utilisateur avant suppression
    /// </summary>
    public async Task<(bool Success, string? JsonData, string Message)> ExportUserDataAsync(Guid userId)
    {
        try
        {
            var user = _context.Users
                .Where(u => u.Id == userId)
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.Username,
                    u.CreatedAt,
                    Progress = u.Progress,
                    LessonCompletions = u.LessonCompletions,
                    Badges = u.Badges,
                    GameScores = u.GameScores
                })
                .FirstOrDefault();

            if (user == null)
                return (false, null, "Utilisateur non trouvé");

            var json = System.Text.Json.JsonSerializer.Serialize(user, 
                new System.Text.Json.JsonSerializerOptions { WriteIndented = true });

            _logger.LogInformation($"User data exported for user: {userId}");
            return (true, json, "Données exportées avec succès");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting user data");
            return (false, null, "Erreur lors de l'export des données");
        }
    }
}
