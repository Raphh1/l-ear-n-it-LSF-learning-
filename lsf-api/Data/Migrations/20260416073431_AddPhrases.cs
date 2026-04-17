using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LsfApi.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPhrases : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LessonType",
                table: "Lessons",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "Phrases",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TextFr = table.Column<string>(type: "text", nullable: false),
                    TextLsf = table.Column<string>(type: "text", nullable: false),
                    VideoUrl = table.Column<string>(type: "text", nullable: true),
                    GifUrl = table.Column<string>(type: "text", nullable: true),
                    Difficulty = table.Column<short>(type: "smallint", nullable: false),
                    Tags = table.Column<string[]>(type: "text[]", nullable: false),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Phrases", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LessonPhrases",
                columns: table => new
                {
                    LessonId = table.Column<Guid>(type: "uuid", nullable: false),
                    PhraseId = table.Column<Guid>(type: "uuid", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LessonPhrases", x => new { x.LessonId, x.PhraseId });
                    table.ForeignKey(
                        name: "FK_LessonPhrases_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LessonPhrases_Phrases_PhraseId",
                        column: x => x.PhraseId,
                        principalTable: "Phrases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PhraseSigns",
                columns: table => new
                {
                    PhraseId = table.Column<Guid>(type: "uuid", nullable: false),
                    SignId = table.Column<Guid>(type: "uuid", nullable: false),
                    Position = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhraseSigns", x => new { x.PhraseId, x.SignId });
                    table.ForeignKey(
                        name: "FK_PhraseSigns_Phrases_PhraseId",
                        column: x => x.PhraseId,
                        principalTable: "Phrases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PhraseSigns_Signs_SignId",
                        column: x => x.SignId,
                        principalTable: "Signs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LessonPhrases_PhraseId",
                table: "LessonPhrases",
                column: "PhraseId");

            migrationBuilder.CreateIndex(
                name: "IX_PhraseSigns_SignId",
                table: "PhraseSigns",
                column: "SignId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LessonPhrases");

            migrationBuilder.DropTable(
                name: "PhraseSigns");

            migrationBuilder.DropTable(
                name: "Phrases");

            migrationBuilder.DropColumn(
                name: "LessonType",
                table: "Lessons");
        }
    }
}
