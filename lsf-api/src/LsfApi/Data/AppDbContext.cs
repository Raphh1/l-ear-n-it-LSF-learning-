using LsfApi.Domain;
using Microsoft.EntityFrameworkCore;

namespace LsfApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Sign> Signs => Set<Sign>();
    public DbSet<Module> Modules => Set<Module>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<LessonSign> LessonSigns => Set<LessonSign>();
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<QuizQuestion> QuizQuestions => Set<QuizQuestion>();
    public DbSet<QuizAttempt> QuizAttempts => Set<QuizAttempt>();
    public DbSet<UserProgress> UserProgress => Set<UserProgress>();
    public DbSet<UserLessonCompletion> UserLessonCompletions => Set<UserLessonCompletion>();
    public DbSet<UserFavorite> UserFavorites => Set<UserFavorite>();
    public DbSet<Badge> Badges => Set<Badge>();
    public DbSet<UserBadge> UserBadges => Set<UserBadge>();
    public DbSet<GameScore> GameScores => Set<GameScore>();
    public DbSet<UserSignStat> UserSignStats => Set<UserSignStat>();
    public DbSet<UserDailyAttempt> UserDailyAttempts => Set<UserDailyAttempt>();
    public DbSet<Phrase> Phrases => Set<Phrase>();
    public DbSet<PhraseSign> PhraseSigns => Set<PhraseSign>();
    public DbSet<LessonPhrase> LessonPhrases => Set<LessonPhrase>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Email).IsUnique();
            e.HasIndex(u => u.Username).IsUnique();
        });

        // Category
        modelBuilder.Entity<Category>(e =>
        {
            e.HasKey(c => c.Id);
            e.HasIndex(c => c.Slug).IsUnique();
        });

        // Sign
        modelBuilder.Entity<Sign>(e =>
        {
            e.HasKey(s => s.Id);
            e.HasIndex(s => s.Slug).IsUnique();
            e.Property(s => s.Tags).HasColumnType("text[]");
            e.HasOne(s => s.Category)
             .WithMany(c => c.Signs)
             .HasForeignKey(s => s.CategoryId);
        });

        // Module
        modelBuilder.Entity<Module>(e =>
        {
            e.HasKey(m => m.Id);
        });

        // Lesson
        modelBuilder.Entity<Lesson>(e =>
        {
            e.HasKey(l => l.Id);
            e.HasOne(l => l.Module)
             .WithMany(m => m.Lessons)
             .HasForeignKey(l => l.ModuleId);
        });

        // LessonSign (clé composite)
        modelBuilder.Entity<LessonSign>(e =>
        {
            e.HasKey(ls => new { ls.LessonId, ls.SignId });
            e.HasOne(ls => ls.Lesson)
             .WithMany(l => l.LessonSigns)
             .HasForeignKey(ls => ls.LessonId);
            e.HasOne(ls => ls.Sign)
             .WithMany(s => s.LessonSigns)
             .HasForeignKey(ls => ls.SignId);
        });

        // Quiz
        modelBuilder.Entity<Quiz>(e =>
        {
            e.HasKey(q => q.Id);
            e.HasOne(q => q.Lesson)
             .WithMany(l => l.Quizzes)
             .HasForeignKey(q => q.LessonId)
             .IsRequired(false);
        });

        // QuizQuestion
        modelBuilder.Entity<QuizQuestion>(e =>
        {
            e.HasKey(qq => qq.Id);
            e.HasOne(qq => qq.Quiz)
             .WithMany(q => q.Questions)
             .HasForeignKey(qq => qq.QuizId);
            e.HasOne(qq => qq.Sign)
             .WithMany(s => s.QuizQuestions)
             .HasForeignKey(qq => qq.SignId);
        });

        // QuizAttempt
        modelBuilder.Entity<QuizAttempt>(e =>
        {
            e.HasKey(qa => qa.Id);
            e.HasOne(qa => qa.User)
             .WithMany(u => u.QuizAttempts)
             .HasForeignKey(qa => qa.UserId);
            e.HasOne(qa => qa.Quiz)
             .WithMany(q => q.Attempts)
             .HasForeignKey(qa => qa.QuizId);
        });

        // UserProgress (clé = UserId)
        modelBuilder.Entity<UserProgress>(e =>
        {
            e.HasKey(up => up.UserId);
            e.HasOne(up => up.User)
             .WithOne(u => u.Progress)
             .HasForeignKey<UserProgress>(up => up.UserId);
        });

        // UserLessonCompletion (clé composite)
        modelBuilder.Entity<UserLessonCompletion>(e =>
        {
            e.HasKey(ulc => new { ulc.UserId, ulc.LessonId });
            e.HasOne(ulc => ulc.User)
             .WithMany(u => u.LessonCompletions)
             .HasForeignKey(ulc => ulc.UserId);
            e.HasOne(ulc => ulc.Lesson)
             .WithMany(l => l.UserCompletions)
             .HasForeignKey(ulc => ulc.LessonId);
        });

        // UserFavorite (clé composite)
        modelBuilder.Entity<UserFavorite>(e =>
        {
            e.HasKey(f => new { f.UserId, f.SignId });
            e.HasOne(f => f.User)
             .WithMany(u => u.Favorites)
             .HasForeignKey(f => f.UserId);
            e.HasOne(f => f.Sign)
             .WithMany()
             .HasForeignKey(f => f.SignId);
        });

        // Badge
        modelBuilder.Entity<Badge>(e =>
        {
            e.HasKey(b => b.Id);
            e.HasIndex(b => b.Slug).IsUnique();
        });

        // UserBadge (clé composite)
        modelBuilder.Entity<UserBadge>(e =>
        {
            e.HasKey(ub => new { ub.UserId, ub.BadgeId });
            e.HasOne(ub => ub.User)
             .WithMany(u => u.Badges)
             .HasForeignKey(ub => ub.UserId);
            e.HasOne(ub => ub.Badge)
             .WithMany(b => b.UserBadges)
             .HasForeignKey(ub => ub.BadgeId);
        });

        // GameScore
        modelBuilder.Entity<GameScore>(e =>
        {
            e.HasKey(gs => gs.Id);
            e.HasOne(gs => gs.User)
             .WithMany(u => u.GameScores)
             .HasForeignKey(gs => gs.UserId);
            e.HasOne(gs => gs.Lesson)
             .WithMany()
             .HasForeignKey(gs => gs.LessonId);
            e.HasIndex(gs => new { gs.GameType, gs.LessonId });
        });

        // UserDailyAttempt (clé composite UserId + Date)
        modelBuilder.Entity<UserDailyAttempt>(e =>
        {
            e.HasKey(a => new { a.UserId, a.Date });
            e.HasOne(a => a.User)
             .WithMany(u => u.DailyAttempts)
             .HasForeignKey(a => a.UserId);
            e.HasOne(a => a.Sign)
             .WithMany()
             .HasForeignKey(a => a.SignId);
        });

        // Phrase
        modelBuilder.Entity<Phrase>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Tags).HasColumnType("text[]");
        });

        // PhraseSign (clé composite)
        modelBuilder.Entity<PhraseSign>(e =>
        {
            e.HasKey(ps => new { ps.PhraseId, ps.SignId });
            e.HasOne(ps => ps.Phrase)
             .WithMany(p => p.PhraseSigns)
             .HasForeignKey(ps => ps.PhraseId);
            e.HasOne(ps => ps.Sign)
             .WithMany()
             .HasForeignKey(ps => ps.SignId);
        });

        // LessonPhrase (clé composite)
        modelBuilder.Entity<LessonPhrase>(e =>
        {
            e.HasKey(lp => new { lp.LessonId, lp.PhraseId });
            e.HasOne(lp => lp.Lesson)
             .WithMany(l => l.LessonPhrases)
             .HasForeignKey(lp => lp.LessonId);
            e.HasOne(lp => lp.Phrase)
             .WithMany(p => p.LessonPhrases)
             .HasForeignKey(lp => lp.PhraseId);
        });

        // UserSignStat (clé composite)
        modelBuilder.Entity<UserSignStat>(e =>
        {
            e.HasKey(uss => new { uss.UserId, uss.SignId });
            e.HasOne(uss => uss.User)
             .WithMany(u => u.SignStats)
             .HasForeignKey(uss => uss.UserId);
            e.HasOne(uss => uss.Sign)
             .WithMany()
             .HasForeignKey(uss => uss.SignId);
        });
    }
}
