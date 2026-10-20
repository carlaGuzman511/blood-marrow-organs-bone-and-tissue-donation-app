using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Umss.BloodOrgansDonationApp.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddUserKeycloakSubjectAndCity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "AspNetUsers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "KeycloakSubject",
                table: "AspNetUsers",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_KeycloakSubject",
                table: "AspNetUsers",
                column: "KeycloakSubject",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_KeycloakSubject",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "City",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "KeycloakSubject",
                table: "AspNetUsers");
        }
    }
}
