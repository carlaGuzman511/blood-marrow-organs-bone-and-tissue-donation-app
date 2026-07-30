using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Umss.BloodOrgansDonationApp.Repository.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDonationCenterFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "DonationCenters",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OpeningHours",
                table: "DonationCenters",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "DonationCenters",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Email",
                table: "DonationCenters");

            migrationBuilder.DropColumn(
                name: "OpeningHours",
                table: "DonationCenters");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "DonationCenters");
        }
    }
}
