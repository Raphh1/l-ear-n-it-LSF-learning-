using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LsfApi.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSignMeanings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SignMeanings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SignId = table.Column<Guid>(type: "uuid", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsPrimary = table.Column<bool>(type: "boolean", nullable: false),
                    Definition = table.Column<string>(type: "text", nullable: true),
                    DefinitionVideoUrl = table.Column<string>(type: "text", nullable: true),
                    DefinitionThumbnailUrl = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SignMeanings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SignMeanings_Signs_SignId",
                        column: x => x.SignId,
                        principalTable: "Signs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SignMeaningVideos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MeaningId = table.Column<Guid>(type: "uuid", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    VideoUrl = table.Column<string>(type: "text", nullable: false),
                    ThumbnailUrl = table.Column<string>(type: "text", nullable: true),
                    Author = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SignMeaningVideos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SignMeaningVideos_SignMeanings_MeaningId",
                        column: x => x.MeaningId,
                        principalTable: "SignMeanings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SignMeanings_SignId_SortOrder",
                table: "SignMeanings",
                columns: new[] { "SignId", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_SignMeaningVideos_MeaningId_SortOrder",
                table: "SignMeaningVideos",
                columns: new[] { "MeaningId", "SortOrder" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SignMeaningVideos");

            migrationBuilder.DropTable(
                name: "SignMeanings");
        }
    }
}
