using FinTech.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinTech.Infrastructure.Persistence.Configurations;

public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.IdempotencyKey)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.HasIndex(x => x.IdempotencyKey)
            .IsUnique();
            
        builder.Property(x => x.Amount)
            .HasPrecision(18, 2);
            
        builder.Property(x => x.Type)
            .HasConversion<string>();
            
        builder.Property(x => x.Status)
            .HasConversion<string>();

        builder.HasOne(x => x.Loan)
            .WithMany(x => x.Transactions)
            .HasForeignKey(x => x.LoanId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.ToTable("Transactions");
    }
}
