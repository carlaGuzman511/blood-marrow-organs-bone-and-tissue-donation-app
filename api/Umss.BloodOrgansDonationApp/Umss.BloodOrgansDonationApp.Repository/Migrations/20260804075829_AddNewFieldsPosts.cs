using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Umss.BloodOrgansDonationApp.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddNewFieldsPosts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Priority",
                table: "DonationPosts",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Priority",
                table: "DonationPosts");
        }
    }
}
