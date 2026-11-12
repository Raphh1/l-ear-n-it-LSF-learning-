using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LsfApi.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSrsQuestsHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "NextReviewAt",
                table: "UserSignStats",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "SrsEaseFactor",
                table: "UserSignStats",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<int>(
                name: "SrsInterval",
                table: "UserSignStats",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SrsRepetitions",
                table: "UserSignStats",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CorrectCount",
                table: "GameScores",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DurationSeconds",
                table: "GameScores",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WrongCount",
                table: "GameScores",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "UserDailyQuests",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    QuestType = table.Column<string>(type: "text", nullable: false),
                    TargetValue = table.Column<int>(type: "integer", nullable: false),
                    CurrentValue = table.Column<int>(type: "integer", nullable: false),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    XpReward = table.Column<int>(type: "integer", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserDailyQuests", x => new { x.UserId, x.Date, x.QuestType });
                    table.ForeignKey(
                        name: "FK_UserDailyQuests_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserDailyQuests");

            migrationBuilder.DropColumn(
                name: "NextReviewAt",
                table: "UserSignStats");

            migrationBuilder.DropColumn(
                name: "SrsEaseFactor",
                table: "UserSignStats");

            migrationBuilder.DropColumn(
                name: "SrsInterval",
                table: "UserSignStats");

            migrationBuilder.DropColumn(
                name: "SrsRepetitions",
                table: "UserSignStats");

            migrationBuilder.DropColumn(
                name: "CorrectCount",
                table: "GameScores");

            migrationBuilder.DropColumn(
                name: "DurationSeconds",
                table: "GameScores");

            migrationBuilder.DropColumn(
                name: "WrongCount",
                table: "GameScores");
        }
    }
}
