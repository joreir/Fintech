using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinTech.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLoanMonthlyIncome : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "MonthlyIncome",
                table: "Loans",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MonthlyIncome",
                table: "Loans");
        }
    }
}
