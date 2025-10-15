using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DuoStackDemo.Migrations
{
    /// <inheritdoc />
    public partial class AddSuperuserSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "AvatarUrl", "Bio", "CreatedAt", "DeletedAt", "Email", "EmailConfirmed", "FirstName", "LastName", "PasswordHash", "PhoneNumber", "Role", "UpdatedAt", "Username" },
                values: new object[] { new Guid("00000000-0000-0000-0000-000000000001"), null, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "superuser@example.com", true, "Super", "User", "$2b$10$6RukQKCKOZUu0Dn/uICmc.kYh9a3vN4DO6OO4Vuslmq2YNqqULkfG", null, "Superuser", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "superuser" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"));
        }
    }
}
