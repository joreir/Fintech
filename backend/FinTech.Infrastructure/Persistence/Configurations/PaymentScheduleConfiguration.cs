using FinTech.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinTech.Infrastructure.Persistence.Configurations;

public class PaymentScheduleConfiguration : IEntityTypeConfiguration<PaymentSchedule>
{
    public void Configure(EntityTypeBuilder<PaymentSchedule> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.TotalPayment)
            .HasPrecision(18, 2);
            
        builder.Property(x => x.Principal)
            .HasPrecision(18, 2);
            
        builder.Property(x => x.Interest)
            .HasPrecision(18, 2);
            
        builder.Property(x => x.RemainingBalance)
            .HasPrecision(18, 2);
            
        builder.Property(x => x.Status)
            .HasConversion<string>();

        builder.HasOne(x => x.Loan)
            .WithMany(x => x.PaymentSchedules)
            .HasForeignKey(x => x.LoanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.ToTable("PaymentSchedules");
    }
}
