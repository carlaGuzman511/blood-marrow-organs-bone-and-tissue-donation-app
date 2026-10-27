using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Umss.BloodOrgansDonationApp.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddDonationRequestClinicalFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Bed",
                table: "DonationPosts",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Component",
                table: "DonationPosts",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CoordinationPhone",
                table: "DonationPosts",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Deadline",
                table: "DonationPosts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Diagnosis",
                table: "DonationPosts",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Folio",
                table: "DonationPosts",
                type: "integer",
                nullable: false)
                .Annotation("Npgsql:IdentitySequenceOptions", "'1000', '1', '', '', 'False', '1'")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<string>(
                name: "MedicalRecord",
                table: "DonationPosts",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PatientAge",
                table: "DonationPosts",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PatientCode",
                table: "DonationPosts",
                type: "character varying(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Service",
                table: "DonationPosts",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "DonationPosts",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "StatusChangedAt",
                table: "DonationPosts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "StatusChangedById",
                table: "DonationPosts",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UnitsCovered",
                table: "DonationPosts",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UnitsRequired",
                table: "DonationPosts",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Urgency",
                table: "DonationPosts",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Standard");

            // The old flag becomes an urgency level before it is dropped (US-API-01).
            migrationBuilder.Sql(@"UPDATE ""DonationPosts"" SET ""Urgency"" = 'Priority' WHERE ""Priority"" = TRUE;");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "DonationPosts");

            migrationBuilder.CreateTable(
                name: "DonationRequestStatusChanges",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DonationPostId = table.Column<Guid>(type: "uuid", nullable: false),
                    FromStatus = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    ToStatus = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ChangedById = table.Column<Guid>(type: "uuid", nullable: true),
                    ChangedBySubject = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Reason = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DonationRequestStatusChanges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DonationRequestStatusChanges_AspNetUsers_ChangedById",
                        column: x => x.ChangedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DonationRequestStatusChanges_DonationPosts_DonationPostId",
                        column: x => x.DonationPostId,
                        principalTable: "DonationPosts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DonationPosts_Folio",
                table: "DonationPosts",
                column: "Folio",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DonationPosts_Status_Urgency_Deadline",
                table: "DonationPosts",
                columns: new[] { "Status", "Urgency", "Deadline" });

            migrationBuilder.CreateIndex(
                name: "IX_DonationPosts_StatusChangedById",
                table: "DonationPosts",
                column: "StatusChangedById");

            migrationBuilder.CreateIndex(
                name: "IX_DonationRequestStatusChanges_ChangedById",
                table: "DonationRequestStatusChanges",
                column: "ChangedById");

            migrationBuilder.CreateIndex(
                name: "IX_DonationRequestStatusChanges_DonationPostId_ChangedAt",
                table: "DonationRequestStatusChanges",
                columns: new[] { "DonationPostId", "ChangedAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_DonationPosts_AspNetUsers_StatusChangedById",
                table: "DonationPosts",
                column: "StatusChangedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DonationPosts_AspNetUsers_StatusChangedById",
                table: "DonationPosts");

            migrationBuilder.DropTable(
                name: "DonationRequestStatusChanges");

            migrationBuilder.DropIndex(
                name: "IX_DonationPosts_Folio",
                table: "DonationPosts");

            migrationBuilder.DropIndex(
                name: "IX_DonationPosts_Status_Urgency_Deadline",
                table: "DonationPosts");

            migrationBuilder.DropIndex(
                name: "IX_DonationPosts_StatusChangedById",
                table: "DonationPosts");

            migrationBuilder.AddColumn<bool>(
                name: "Priority",
                table: "DonationPosts",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql(@"UPDATE ""DonationPosts"" SET ""Priority"" = TRUE WHERE ""Urgency"" <> 'Standard';");

            migrationBuilder.DropColumn(
                name: "Bed",
                table: "DonationPosts");

            migrationBuilder.DropColumn(
                name: "Component",
                table: "DonationPosts");

            migrationBuilder.DropColumn(
                name: "CoordinationPhone",
                table: "DonationPosts");

            migrationBuilder.DropColumn(
                name: "Deadline",
                table: "DonationPosts");

            migrationBuilder.DropColumn(
                name: "Diagnosis",
                table: "DonationPosts");

            migrationBuilder.DropColumn(
                name: "Folio",
                table: "DonationPosts");

            migrationBuilder.DropColumn(
                name: "MedicalRecord",
                table: "DonationPosts");

            migrationBuilder.DropColumn(
                name: "PatientAge",
                table: "DonationPosts");

            migrationBuilder.DropColumn(
                name: "PatientCode",
                table: "DonationPosts");

            migrationBuilder.DropColumn(
                name: "Service",
                table: "DonationPosts");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "DonationPosts");

            migrationBuilder.DropColumn(
                name: "StatusChangedAt",
                table: "DonationPosts");

            migrationBuilder.DropColumn(
                name: "StatusChangedById",
                table: "DonationPosts");

            migrationBuilder.DropColumn(
                name: "UnitsCovered",
                table: "DonationPosts");

            migrationBuilder.DropColumn(
                name: "UnitsRequired",
                table: "DonationPosts");

            migrationBuilder.DropColumn(
                name: "Urgency",
                table: "DonationPosts");
        }
    }
}
