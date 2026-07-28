using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Umss.BloodOrgansDonationApp.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddDonationPostTitle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "DonationPosts",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Title",
                table: "DonationPosts");
        }
    }
}
