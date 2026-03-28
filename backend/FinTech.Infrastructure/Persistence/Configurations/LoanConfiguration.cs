using FinTech.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinTech.Infrastructure.Persistence.Configurations;

public class LoanConfiguration : IEntityTypeConfiguration<Loan>
{
    public void Configure(EntityTypeBuilder<Loan> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .ValueGeneratedOnAdd();

        builder.Property(x => x.UserId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Amount)
            .HasPrecision(18, 2);

        builder.Property(x => x.InterestRate)
            .HasPrecision(18, 4); 

        builder.Property(x => x.MonthlyPayment)
            .HasPrecision(18, 2);

        builder.Property(x => x.MonthlyIncome)
            .HasPrecision(18, 2);

        builder.Property(x => x.LoanType)
            .HasConversion<string>(); 
            
        builder.Property(x => x.Status)
            .HasConversion<string>();

        builder.ToTable("Loans");
    }
}
