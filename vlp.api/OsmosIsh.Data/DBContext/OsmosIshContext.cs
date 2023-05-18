using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using OsmosIsh.Data.DBEntities;

namespace OsmosIsh.Data.DBContext
{

    public partial class OsmosIshContext : DbContext
    {
        public OsmosIshContext()
        {
        }

        public OsmosIshContext(DbContextOptions<OsmosIshContext> options)
            : base(options)
        {
        }

        public virtual DbSet<AffiliatePayoutDetails> AffiliatePayoutDetails { get; set; }
        public virtual DbSet<Affiliates> Affiliates { get; set; }
        public virtual DbSet<Apilogs> Apilogs { get; set; }
        public virtual DbSet<CancelledSeriesRequest> CancelledSeriesRequest { get; set; }
        public virtual DbSet<Company> Company { get; set; }
        public virtual DbSet<Countries> Countries { get; set; }
        public virtual DbSet<Coupons> Coupons { get; set; }
        public virtual DbSet<Disputes> Disputes { get; set; }
        public virtual DbSet<Enrollments> Enrollments { get; set; }
        public virtual DbSet<ErrorLogs> ErrorLogs { get; set; }
        public virtual DbSet<Favorites> Favorites { get; set; }
        public virtual DbSet<GlobalCodeCategories> GlobalCodeCategories { get; set; }
        public virtual DbSet<GlobalCodes> GlobalCodes { get; set; }
        public virtual DbSet<Images> Images { get; set; }
        public virtual DbSet<MeetingAttendees> MeetingAttendees { get; set; }
        public virtual DbSet<Meetings> Meetings { get; set; }
        public virtual DbSet<Messages> Messages { get; set; }
        public virtual DbSet<Notifications> Notifications { get; set; }
        public virtual DbSet<Packages> Packages { get; set; }
        public virtual DbSet<PayoutDetail> PayoutDetail { get; set; }
        public virtual DbSet<PrivatSessionAvailableDaySlots> PrivatSessionAvailableDaySlots { get; set; }
        public virtual DbSet<PrivatSessionAvailableDays> PrivatSessionAvailableDays { get; set; }
        public virtual DbSet<PrivateSessionLog> PrivateSessionLog { get; set; }
        public virtual DbSet<Rating> Rating { get; set; }
        public virtual DbSet<Reviews> Reviews { get; set; }
        public virtual DbSet<Schedule> Schedule { get; set; }
        public virtual DbSet<SchemaVersions> SchemaVersions { get; set; }
        public virtual DbSet<Series> Series { get; set; }
        public virtual DbSet<SeriesDetail> SeriesDetail { get; set; }
        public virtual DbSet<Session> Session { get; set; }
        public virtual DbSet<SessionCategories> SessionCategories { get; set; }
        public virtual DbSet<SessionDetail> SessionDetail { get; set; }
        public virtual DbSet<Students> Students { get; set; }
        public virtual DbSet<Subscriptions> Subscriptions { get; set; }
        public virtual DbSet<TeacherAffiliateCode> TeacherAffiliateCode { get; set; }
        public virtual DbSet<Teachers> Teachers { get; set; }
        public virtual DbSet<TransactionDetail> TransactionDetail { get; set; }
        public virtual DbSet<Transactions> Transactions { get; set; }
        public virtual DbSet<UserActivities> UserActivities { get; set; }
        public virtual DbSet<UserCouponLogs> UserCouponLogs { get; set; }
        public virtual DbSet<UserRefreshToken> UserRefreshToken { get; set; }
        public virtual DbSet<Users> Users { get; set; }
        public virtual DbSet<ViewLogs> ViewLogs { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                // #warning To protect potentially sensitive information in your connection string, you should move it out of source code. See http://go.microsoft.com/fwlink/?LinkId=723263 for guidance on storing connection strings.
                //               9 optionsBuilder.UseSqlServer("Data Source=.\\SQLEXPRESS;Initial Catalog=OsmosIsh;user id=sa;Password=techie!@#;Max Pool Size=10;Pooling=True");
                optionsBuilder.UseSqlServer("name=ApplicationContext");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AffiliatePayoutDetails>(entity =>
            {
                entity.HasKey(e => e.AffiliatePayoutDeatilId);

                entity.Property(e => e.AffiliatePayoutJson).IsUnicode(false);

                entity.Property(e => e.Amount)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.BatchStatus)
                    .HasColumnName("Batch_status")
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate).HasColumnType("datetime");

                entity.Property(e => e.Errors)
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.Fee)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.PayoutBatchId)
                    .HasColumnName("Payout_batch_id")
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.PayoutSucceeded)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.PaypalAccount)
                    .IsRequired()
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.PaypalAccountType)
                    .IsRequired()
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.SenderBatchId)
                    .HasColumnName("Sender_batch_id")
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.TimeCompleted)
                    .HasColumnName("Time_completed")
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.TimeCreated)
                    .HasColumnName("Time_created")
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.HasOne(d => d.Payout)
                    .WithMany(p => p.AffiliatePayoutDetails)
                    .HasForeignKey(d => d.PayoutId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_AffiliatePayoutDetails_Affiliates");
            });

            modelBuilder.Entity<Affiliates>(entity =>
            {
                entity.HasKey(e => e.AffiliateId)
                    .HasName("PK_AffiliateCodes");

                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('Y')");

                entity.Property(e => e.AffiliateCode)
                    .IsRequired()
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.AffiliateEarningPercentage).HasColumnType("decimal(18, 2)");

                entity.Property(e => e.BlockAffiliate)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.CreatedBy)
                    .IsRequired()
                    .HasMaxLength(250)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.ExpirationDate).HasColumnType("date");

                entity.Property(e => e.FirstName)
                    .IsRequired()
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.LastName)
                    .IsRequired()
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedBy)
                    .HasMaxLength(250)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedDate).HasColumnType("datetime");

                entity.Property(e => e.PaypalAccount)
                    .IsRequired()
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.PaypalAccountType)
                    .IsRequired()
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.PhoneNumber)
                    .IsRequired()
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.TeacherEarningPercentage).HasColumnType("decimal(18, 2)");
            });

            modelBuilder.Entity<Apilogs>(entity =>
            {
                entity.HasKey(e => e.ApilogId)
                    .HasName("PK_APILog");

                entity.ToTable("APILogs");

                entity.Property(e => e.ApilogId).HasColumnName("APILogId");

                entity.Property(e => e.Apiparams)
                    .HasColumnName("APIParams")
                    .IsUnicode(false);

                entity.Property(e => e.Apiurl)
                    .HasColumnName("APIUrl")
                    .HasMaxLength(500)
                    .IsUnicode(false);

                entity.Property(e => e.EndDateTime).HasColumnType("datetime");

                entity.Property(e => e.Headers).IsUnicode(false);

                entity.Property(e => e.Method)
                    .HasMaxLength(10)
                    .IsUnicode(false);

                entity.Property(e => e.StartDateTime).HasColumnType("datetime");

                entity.HasOne(d => d.ErrorLog)
                    .WithMany(p => p.Apilogs)
                    .HasForeignKey(d => d.ErrorLogId)
                    .HasConstraintName("FK_APILogs_PK_ErrorLogs_ErrorId");
            });

            modelBuilder.Entity<CancelledSeriesRequest>(entity =>
            {
                entity.HasKey(e => e.CancelledSeriesId);

                entity.Property(e => e.AdminComments)
                    .HasMaxLength(8000)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.IsCancelledSeriesResoved)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.ModifiedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedDate).HasColumnType("datetime");

                entity.HasOne(d => d.Series)
                    .WithMany(p => p.CancelledSeriesRequest)
                    .HasForeignKey(d => d.SeriesId)
                    .OnDelete(DeleteBehavior.ClientSetNull);

                entity.HasOne(d => d.Student)
                    .WithMany(p => p.CancelledSeriesRequest)
                    .HasForeignKey(d => d.StudentId)
                    .OnDelete(DeleteBehavior.ClientSetNull);

                entity.HasOne(d => d.Teacher)
                    .WithMany(p => p.CancelledSeriesRequest)
                    .HasForeignKey(d => d.TeacherId)
                    .OnDelete(DeleteBehavior.ClientSetNull);
            });

            modelBuilder.Entity<Company>(entity =>
            {
                entity.Property(e => e.CompanyName)
                    .IsRequired()
                    .HasMaxLength(255)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<Countries>(entity =>
            {
                entity.HasKey(e => e.CountryId);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.Iso)
                    .IsRequired()
                    .HasColumnName("ISO")
                    .HasMaxLength(5)
                    .IsUnicode(false);

                entity.Property(e => e.Iso3)
                    .IsRequired()
                    .HasColumnName("ISO3")
                    .HasMaxLength(3)
                    .IsUnicode(false)
                    .IsFixedLength();

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(80)
                    .IsUnicode(false);

                entity.Property(e => e.NiceName)
                    .IsRequired()
                    .HasMaxLength(80)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<Coupons>(entity =>
            {
                entity.HasKey(e => e.CouponId);

                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('Y')");

                entity.Property(e => e.BlockCoupon)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.CouponCode)
                    .IsRequired()
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedBy)
                    .IsRequired()
                    .HasMaxLength(250)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.Discount).HasColumnType("decimal(18, 2)");

                entity.Property(e => e.DiscountType)
                    .IsRequired()
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.EndDate).HasColumnType("date");

                entity.Property(e => e.ModifiedBy)
                    .HasMaxLength(250)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedDate).HasColumnType("datetime");

                entity.Property(e => e.NoExpiration)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.StartDate).HasColumnType("date");

                entity.HasOne(d => d.CouponTypeNavigation)
                    .WithMany(p => p.Coupons)
                    .HasForeignKey(d => d.CouponType)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Coupons_GlobalCodes");
            });

            modelBuilder.Entity<Disputes>(entity =>
            {
                entity.HasKey(e => e.DisputeId);

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.ModifiedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedDate).HasColumnType("datetime");

                entity.Property(e => e.Reason)
                    .HasMaxLength(8000)
                    .IsUnicode(false);

                entity.Property(e => e.TutorResponse)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.HasOne(d => d.DisputeReasonNavigation)
                    .WithMany(p => p.DisputesDisputeReasonNavigation)
                    .HasForeignKey(d => d.DisputeReason)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Disputes_Disputes_DisputeReason");

                entity.HasOne(d => d.DisputeStatusNavigation)
                    .WithMany(p => p.DisputesDisputeStatusNavigation)
                    .HasForeignKey(d => d.DisputeStatus)
                    .OnDelete(DeleteBehavior.ClientSetNull);

                entity.HasOne(d => d.Student)
                    .WithMany(p => p.Disputes)
                    .HasForeignKey(d => d.StudentId)
                    .OnDelete(DeleteBehavior.ClientSetNull);

                entity.HasOne(d => d.Teacher)
                    .WithMany(p => p.Disputes)
                    .HasForeignKey(d => d.TeacherId)
                    .OnDelete(DeleteBehavior.ClientSetNull);
            });

            modelBuilder.Entity<Enrollments>(entity =>
            {
                entity.HasKey(e => e.EnrollmentId);

                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('Y')");

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.DeletedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.DeletedDate).HasColumnType("datetime");

                entity.Property(e => e.DiscountedFee).HasColumnType("decimal(18, 2)");

                entity.Property(e => e.EnrollmentDate).HasColumnType("datetime");

                entity.Property(e => e.IsSavedForLater)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.ModifiedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedDate).HasColumnType("datetime");

                entity.Property(e => e.PaidSubscription)
                    .HasMaxLength(10)
                    .IsFixedLength();

                entity.Property(e => e.RecordDeleted)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.HasOne(d => d.RefrenceTypeNavigation)
                    .WithMany(p => p.Enrollments)
                    .HasForeignKey(d => d.RefrenceType)
                    .OnDelete(DeleteBehavior.ClientSetNull);

                entity.HasOne(d => d.Student)
                    .WithMany(p => p.Enrollments)
                    .HasForeignKey(d => d.StudentId)
                    .OnDelete(DeleteBehavior.ClientSetNull);
            });

            modelBuilder.Entity<ErrorLogs>(entity =>
            {
                entity.HasKey(e => e.ErrorLogId)
                    .HasName("PK_ErrorLogId");

                entity.Property(e => e.ExceptionMsg).IsUnicode(false);

                entity.Property(e => e.ExceptionSource).IsUnicode(false);

                entity.Property(e => e.ExceptionType).IsUnicode(false);

                entity.Property(e => e.LogDateTime).HasColumnType("datetime");
            });

            modelBuilder.Entity<Favorites>(entity =>
            {
                entity.HasKey(e => e.FavoriteId);

                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('Y')");

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.DeletedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.DeletedDate).HasColumnType("datetime");

                entity.Property(e => e.ModifiedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedDate).HasColumnType("datetime");

                entity.Property(e => e.RecordDeleted)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.HasOne(d => d.RefrenceTypeNavigation)
                    .WithMany(p => p.Favorites)
                    .HasForeignKey(d => d.RefrenceType)
                    .OnDelete(DeleteBehavior.ClientSetNull);

                entity.HasOne(d => d.Student)
                    .WithMany(p => p.Favorites)
                    .HasForeignKey(d => d.StudentId)
                    .OnDelete(DeleteBehavior.ClientSetNull);
            });

            modelBuilder.Entity<GlobalCodeCategories>(entity =>
            {
                entity.HasKey(e => e.CategoryId)
                    .HasName("PK__GlobalCo__19093A0B88FE2C5C");

                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('Y')");

                entity.Property(e => e.AllowAddDelete)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength();

                entity.Property(e => e.AllowCodeNameEdit)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength();

                entity.Property(e => e.AllowSortOrderEdit)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength();

                entity.Property(e => e.CategoryName)
                    .IsRequired()
                    .HasMaxLength(250)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.DeletedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.DeletedDate).HasColumnType("datetime");

                entity.Property(e => e.Description)
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedDate).HasColumnType("datetime");

                entity.Property(e => e.RecordDeleted)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");
            });

            modelBuilder.Entity<GlobalCodes>(entity =>
            {
                entity.HasKey(e => e.GlobalCodeId)
                    .HasName("PK__GlobalCo__5A5DFE9E06BB293B");

                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('Y')");

                entity.Property(e => e.CannotModifyNameOrDelete)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength();

                entity.Property(e => e.CodeName)
                    .IsRequired()
                    .HasMaxLength(250)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.DeletedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.DeletedDate).HasColumnType("datetime");

                entity.Property(e => e.Description)
                    .IsRequired()
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedDate).HasColumnType("datetime");

                entity.Property(e => e.RecordDeleted)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.HasOne(d => d.Category)
                    .WithMany(p => p.GlobalCodes)
                    .HasForeignKey(d => d.CategoryId)
                    .HasConstraintName("GlobalCodes_GlobalCodeCategories_FK");
            });

            modelBuilder.Entity<Images>(entity =>
            {
                entity.HasKey(e => e.ImageId);

                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('Y')");

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.DeletedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.DeletedDate).HasColumnType("datetime");

                entity.Property(e => e.ImageFile)
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedDate).HasColumnType("datetime");

                entity.Property(e => e.RecordDeleted)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.HasOne(d => d.ImageType)
                    .WithMany(p => p.Images)
                    .HasForeignKey(d => d.ImageTypeId)
                    .OnDelete(DeleteBehavior.ClientSetNull);
            });

            modelBuilder.Entity<MeetingAttendees>(entity =>
            {
                entity.HasKey(e => e.MeetingAttendeeId)
                    .HasName("PK_MeetingJoinees");

                entity.Property(e => e.AmazonChimeAttendeeId)
                    .IsRequired()
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.EndDateTime).HasColumnType("datetime");

                entity.Property(e => e.StartDateTime).HasColumnType("datetime");

                entity.HasOne(d => d.Meeting)
                    .WithMany(p => p.MeetingAttendees)
                    .HasForeignKey(d => d.MeetingId)
                    .OnDelete(DeleteBehavior.ClientSetNull);

                entity.HasOne(d => d.Student)
                    .WithMany(p => p.MeetingAttendees)
                    .HasForeignKey(d => d.StudentId)
                    .OnDelete(DeleteBehavior.ClientSetNull);
            });

            modelBuilder.Entity<Meetings>(entity =>
            {
                entity.HasKey(e => e.MeetingId);

                entity.Property(e => e.AmazonChimeAttendeeId)
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.AmazonChimeMeetingId)
                    .IsRequired()
                    .HasMaxLength(500)
                    .IsUnicode(false);

                entity.Property(e => e.AmazonChimeMeetingTitle)
                    .IsRequired()
                    .HasMaxLength(1000)
                    .IsUnicode(false);

                entity.Property(e => e.Amount)
                    .HasColumnName("amount")
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.BatchStatus)
                    .HasColumnName("batch_status")
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.EndDateTime).HasColumnType("datetime");

                entity.Property(e => e.Errors)
                    .HasColumnName("errors")
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.Fee)
                    .HasColumnName("fee")
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.IsMeetingEnded)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.PayoutBatchId)
                    .HasColumnName("payout_batch_id")
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.Payoutsucceeded)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.SenderBatchId)
                    .HasColumnName("sender_batch_id")
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.StartDateTime).HasColumnType("datetime");

                entity.Property(e => e.TimeCompleted)
                    .HasColumnName("time_completed")
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.TimeCreated)
                    .HasColumnName("time_created")
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.HasOne(d => d.Session)
                    .WithMany(p => p.Meetings)
                    .HasForeignKey(d => d.SessionId)
                    .OnDelete(DeleteBehavior.ClientSetNull);
            });

            modelBuilder.Entity<Messages>(entity =>
            {
                entity.HasKey(e => e.MessageId);

                entity.Property(e => e.CreatedBy)
                    .IsRequired()
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.IsSeen)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.Message)
                    .IsRequired()
                    .IsUnicode(false);

                entity.HasOne(d => d.RecipientTypeNavigation)
                    .WithMany(p => p.MessagesRecipientTypeNavigation)
                    .HasForeignKey(d => d.RecipientType)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_RecipientType_GlobalCode");

                entity.HasOne(d => d.SenderTypeNavigation)
                    .WithMany(p => p.MessagesSenderTypeNavigation)
                    .HasForeignKey(d => d.SenderType)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_SenderType_GlobalCode");
            });

            modelBuilder.Entity<Notifications>(entity =>
            {
                entity.HasKey(e => e.NotificationId);

                entity.Property(e => e.Comment)
                    .IsRequired()
                    .HasMaxLength(250)
                    .IsUnicode(false);

                entity.Property(e => e.IsSeen)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.ModifiedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.TableName)
                    .IsRequired()
                    .HasMaxLength(50)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<Packages>(entity =>
            {
                entity.HasKey(e => e.PackageId);

                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('Y')");

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.DeletedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.DeletedDate).HasColumnType("datetime");

                entity.Property(e => e.Description).IsUnicode(false);

                entity.Property(e => e.ModifiedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedDate).HasColumnType("datetime");

                entity.Property(e => e.PackageName)
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.Percentage).HasColumnType("decimal(18, 0)");

                entity.Property(e => e.RecordDeleted)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");
            });

            modelBuilder.Entity<PayoutDetail>(entity =>
            {
                entity.HasKey(e => e.PayoutId);

                entity.Property(e => e.AffiliateShare).HasColumnType("decimal(18, 2)");

                entity.Property(e => e.Amount)
                    .HasColumnName("amount")
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.BatchStatus)
                    .HasColumnName("batch_status")
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.Errors)
                    .HasColumnName("errors")
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.Fee)
                    .HasColumnName("fee")
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.PayoutBatchId)
                    .HasColumnName("payout_batch_id")
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.PayoutSucceeded)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.PayoutType)
                    .HasMaxLength(250)
                    .IsUnicode(false);

                entity.Property(e => e.PaypalAccount)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.PaypalAccountType)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.SenderBatchId)
                    .HasColumnName("sender_batch_id")
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.ServiceFee).HasColumnType("decimal(18, 2)");

                entity.Property(e => e.SessionFee).HasColumnType("decimal(18, 2)");

                entity.Property(e => e.TimeCompleted)
                    .HasColumnName("time_completed")
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.TimeCreated)
                    .HasColumnName("time_created")
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.TutorAffiliatePayBack).HasColumnType("decimal(18, 2)");

                entity.HasOne(d => d.Student)
                    .WithMany(p => p.PayoutDetail)
                    .HasForeignKey(d => d.StudentId)
                    .OnDelete(DeleteBehavior.ClientSetNull);

                entity.HasOne(d => d.Teacher)
                    .WithMany(p => p.PayoutDetail)
                    .HasForeignKey(d => d.TeacherId)
                    .OnDelete(DeleteBehavior.ClientSetNull);
            });

            modelBuilder.Entity<PrivatSessionAvailableDaySlots>(entity =>
            {
                entity.HasKey(e => e.PrivatSessionAvailableDaySlotId)
                    .HasName("PK_PrivatSessionScheduleSlots");

                entity.HasOne(d => d.PrivatSessionAvailableDay)
                    .WithMany(p => p.PrivatSessionAvailableDaySlots)
                    .HasForeignKey(d => d.PrivatSessionAvailableDayId)
                    .OnDelete(DeleteBehavior.ClientSetNull);
            });

            modelBuilder.Entity<PrivatSessionAvailableDays>(entity =>
            {
                entity.HasKey(e => e.PrivatSessionAvailableDayId)
                    .HasName("PK_Schedules");

                entity.Property(e => e.Day)
                    .IsRequired()
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.HasOne(d => d.Teacher)
                    .WithMany(p => p.PrivatSessionAvailableDays)
                    .HasForeignKey(d => d.TeacherId)
                    .OnDelete(DeleteBehavior.ClientSetNull);
            });

            modelBuilder.Entity<PrivateSessionLog>(entity =>
            {
                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('Y')");

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.DeletedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.DeletedDate).HasColumnType("datetime");

                entity.Property(e => e.EndTime).HasColumnType("datetime");

                entity.Property(e => e.IsAccept)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.ModifiedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedDate).HasColumnType("datetime");

                entity.Property(e => e.Notes)
                    .HasMaxLength(500)
                    .IsUnicode(false);

                entity.Property(e => e.RecordDeleted)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.SessionTitle)
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.StartTime).HasColumnType("datetime");

                entity.HasOne(d => d.SessionCategory)
                    .WithMany(p => p.PrivateSessionLog)
                    .HasForeignKey(d => d.SessionCategoryId);

                entity.HasOne(d => d.Student)
                    .WithMany(p => p.PrivateSessionLog)
                    .HasForeignKey(d => d.StudentId)
                    .OnDelete(DeleteBehavior.ClientSetNull);

                entity.HasOne(d => d.Teacher)
                    .WithMany(p => p.PrivateSessionLog)
                    .HasForeignKey(d => d.TeacherId)
                    .OnDelete(DeleteBehavior.ClientSetNull);
            });

            modelBuilder.Entity<Rating>(entity =>
            {
                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('Y')");

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.DeletedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.DeletedDate).HasColumnType("datetime");

                entity.Property(e => e.ModifiedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedDate).HasColumnType("datetime");

                entity.Property(e => e.Rating1).HasColumnName("Rating");

                entity.Property(e => e.RecordDeleted)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.HasOne(d => d.RatingType)
                    .WithMany(p => p.Rating)
                    .HasForeignKey(d => d.RatingTypeId)
                    .OnDelete(DeleteBehavior.ClientSetNull);

                entity.HasOne(d => d.Student)
                    .WithMany(p => p.Rating)
                    .HasForeignKey(d => d.StudentId)
                    .HasConstraintName("FK_Rating_Students");
            });

            modelBuilder.Entity<Reviews>(entity =>
            {
                entity.HasKey(e => e.ReviewId);

                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('Y')");

                entity.Property(e => e.Comments).IsUnicode(false);

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.DeletedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.DeletedDate).HasColumnType("datetime");

                entity.Property(e => e.ModifiedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedDate).HasColumnType("datetime");

                entity.Property(e => e.RecordDeleted)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.HasOne(d => d.RefrenceTypeNavigation)
                    .WithMany(p => p.Reviews)
                    .HasForeignKey(d => d.RefrenceType)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Reviews_RefrenceType_GlobalCodeId");

                entity.HasOne(d => d.Student)
                    .WithMany(p => p.Reviews)
                    .HasForeignKey(d => d.StudentId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Reviews_Students");
            });

            modelBuilder.Entity<Schedule>(entity =>
            {
                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('Y')");

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.DeletedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.DeletedDate).HasColumnType("datetime");

                entity.Property(e => e.ModifiedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedDate).HasColumnType("datetime");

                entity.Property(e => e.RecordDeleted)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.HasOne(d => d.PaymentStatusNavigation)
                    .WithMany(p => p.Schedule)
                    .HasForeignKey(d => d.PaymentStatus);
            });

            modelBuilder.Entity<SchemaVersions>(entity =>
            {
                entity.Property(e => e.Applied).HasColumnType("datetime");

                entity.Property(e => e.ScriptName)
                    .IsRequired()
                    .HasMaxLength(255);
            });

            modelBuilder.Entity<Series>(entity =>
            {
                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('Y')");

                entity.Property(e => e.BlockSeries)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.DeletedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.DeletedDate).HasColumnType("datetime");

                entity.Property(e => e.Enddate).HasColumnType("datetime");

                entity.Property(e => e.FeaturedSeries)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.ModifiedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedDate).HasColumnType("datetime");

                entity.Property(e => e.RecordDeleted)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.StartDate).HasColumnType("datetime");

                entity.HasOne(d => d.Teacher)
                    .WithMany(p => p.Series)
                    .HasForeignKey(d => d.TeacherId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Series_Teachers_teacherId");
            });

            modelBuilder.Entity<SeriesDetail>(entity =>
            {
                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('Y')");

                entity.Property(e => e.Agenda).IsUnicode(false);

                entity.Property(e => e.CanBeSubscribedAnyTime)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.DeletedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.DeletedDate).HasColumnType("datetime");

                entity.Property(e => e.Description).IsUnicode(false);

                entity.Property(e => e.Language)
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedDate).HasColumnType("datetime");

                entity.Property(e => e.NumberOfJoineesAllowed).HasDefaultValueSql("((5))");

                entity.Property(e => e.RecordDeleted)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.SeriesFee).HasColumnType("decimal(18, 2)");

                entity.Property(e => e.SeriesTags)
                    .HasMaxLength(1000)
                    .IsUnicode(false);

                entity.Property(e => e.SeriesTitle)
                    .IsRequired()
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.TimeZone)
                    .HasMaxLength(8000)
                    .IsUnicode(false);

                entity.HasOne(d => d.SeriesCategory)
                    .WithMany(p => p.SeriesDetail)
                    .HasForeignKey(d => d.SeriesCategoryId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_SeriesDetail_SeriesCategoryId_SessionCategories_SessionCategoryId");

                entity.HasOne(d => d.Series)
                    .WithMany(p => p.SeriesDetail)
                    .HasForeignKey(d => d.SeriesId)
                    .OnDelete(DeleteBehavior.ClientSetNull);
            });

            modelBuilder.Entity<Session>(entity =>
            {
                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('Y')");

                entity.Property(e => e.BlockSession)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.DeletedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.DeletedDate).HasColumnType("datetime");

                entity.Property(e => e.EndTime).HasColumnType("datetime");

                entity.Property(e => e.FeaturedSession)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.ModifiedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedDate).HasColumnType("datetime");

                entity.Property(e => e.RecordDeleted)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.StartTime).HasColumnType("datetime");

                entity.HasOne(d => d.Series)
                    .WithMany(p => p.Session)
                    .HasForeignKey(d => d.SeriesId);

                entity.HasOne(d => d.Teacher)
                    .WithMany(p => p.Session)
                    .HasForeignKey(d => d.TeacherId)
                    .OnDelete(DeleteBehavior.ClientSetNull);
            });

            modelBuilder.Entity<SessionCategories>(entity =>
            {
                entity.HasKey(e => e.SessionCategoryId);

                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('Y')");

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.SessionCategoryName)
                    .HasMaxLength(50)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<SessionDetail>(entity =>
            {
                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('Y')");

                entity.Property(e => e.Agenda).IsUnicode(false);

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.DeletedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.DeletedDate).HasColumnType("datetime");

                entity.Property(e => e.Description).IsUnicode(false);

                entity.Property(e => e.Language)
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedDate).HasColumnType("datetime");

                entity.Property(e => e.NumberOfJoineesAllowed).HasDefaultValueSql("((5))");

                entity.Property(e => e.PrivateSession)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.RecordDeleted)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.SessionFee).HasColumnType("decimal(18, 2)");

                entity.Property(e => e.SessionTags)
                    .HasMaxLength(1000)
                    .IsUnicode(false);

                entity.Property(e => e.SessionTitle)
                    .IsRequired()
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.TimeZone)
                    .HasMaxLength(8000)
                    .IsUnicode(false);

                entity.HasOne(d => d.Session)
                    .WithMany(p => p.SessionDetail)
                    .HasForeignKey(d => d.SessionId)
                    .OnDelete(DeleteBehavior.ClientSetNull);

                entity.HasOne(d => d.StatusNavigation)
                    .WithMany(p => p.SessionDetail)
                    .HasForeignKey(d => d.Status);
            });

            modelBuilder.Entity<Students>(entity =>
            {
                entity.HasKey(e => e.StudentId);

                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('Y')");

                entity.Property(e => e.Blocked)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.DeletedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.DeletedDate).HasColumnType("datetime");

                entity.Property(e => e.Description)
                    .HasMaxLength(1000)
                    .IsUnicode(false);

                entity.Property(e => e.Interest)
                    .HasMaxLength(1000)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedDate).HasColumnType("datetime");

                entity.Property(e => e.RecordDeleted)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.Students)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull);
            });

            modelBuilder.Entity<Subscriptions>(entity =>
            {
                entity.HasKey(e => e.SubscriptionId);

                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('Y')");

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.FirstName)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.LastName)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.SubscriptionDate)
                    .HasColumnType("date")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.UnSubscriptionDate).HasColumnType("date");

                entity.HasOne(d => d.UserType)
                    .WithMany(p => p.Subscriptions)
                    .HasForeignKey(d => d.UserTypeId);
            });

            modelBuilder.Entity<TeacherAffiliateCode>(entity =>
            {
                entity.Property(e => e.AffiliateCode)
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.DeletedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.DeletedDate).HasColumnType("datetime");

                entity.Property(e => e.IsDeleted)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.HasOne(d => d.Teacher)
                    .WithMany(p => p.TeacherAffiliateCode)
                    .HasForeignKey(d => d.TeacherId)
                    .HasConstraintName("FK_TeacherReferralCode_Teachers");
            });

            modelBuilder.Entity<Teachers>(entity =>
            {
                entity.HasKey(e => e.TeacherId);

                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('Y')");

                entity.Property(e => e.Awards)
                    .HasMaxLength(1000)
                    .IsUnicode(false);

                entity.Property(e => e.Blocked)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.DeletedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.DeletedDate).HasColumnType("datetime");

                entity.Property(e => e.Description).IsUnicode(false);

                entity.Property(e => e.FeaturedTeacher)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.FeePerHours)
                    .HasColumnType("decimal(8, 2)")
                    .HasDefaultValueSql("((0.00))");

                entity.Property(e => e.Interest)
                    .HasMaxLength(1000)
                    .IsUnicode(false);

                entity.Property(e => e.IsProfileUpdated)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.ModifiedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedDate).HasColumnType("datetime");

                entity.Property(e => e.OwnReferralCode)
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.PaypalAccount)
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.PaypalAccountType)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.AffiliateCode)
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.PrivateSession)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.PrivateSessionCategories)
                    .HasMaxLength(500)
                    .IsUnicode(false);

                entity.Property(e => e.PrivateSessionTimeZone)
                    .HasMaxLength(1000)
                    .IsUnicode(false);

                entity.Property(e => e.RecordDeleted)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.Specialization)
                    .HasMaxLength(1000)
                    .IsUnicode(false);

                entity.HasOne(d => d.User)
                    .WithMany(p => p.Teachers)
                    .HasForeignKey(d => d.UserId);
            });

            modelBuilder.Entity<TransactionDetail>(entity =>
            {
                entity.Property(e => e.Active)
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('Y')");

                entity.Property(e => e.Charity).HasColumnType("decimal(18, 2)");

                entity.Property(e => e.CreateTime)
                    .HasColumnName("create_time")
                    .HasColumnType("datetime");

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.Currency)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Description)
                    .HasMaxLength(1000)
                    .IsUnicode(false);

                entity.Property(e => e.Isrefunded)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.RecordDeleted)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.Refund)
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.RefundAmount)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.RefundState)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ServiceFee).HasColumnType("decimal(18, 2)");

                entity.Property(e => e.SubTotal).HasColumnType("decimal(18, 2)");

                entity.Property(e => e.TotalAmount).HasColumnType("decimal(18, 2)");

                entity.Property(e => e.UpdateTime)
                    .HasColumnName("update_time")
                    .HasColumnType("datetime");

                entity.HasOne(d => d.Enrollment)
                    .WithMany(p => p.TransactionDetail)
                    .HasForeignKey(d => d.EnrollmentId)
                    .OnDelete(DeleteBehavior.ClientSetNull);

                entity.HasOne(d => d.Transaction)
                    .WithMany(p => p.TransactionDetail)
                    .HasForeignKey(d => d.TransactionId)
                    .OnDelete(DeleteBehavior.ClientSetNull);
            });

            modelBuilder.Entity<Transactions>(entity =>
            {
                entity.HasKey(e => e.TransactionId)
                    .HasName("PK_Transactions_1");

                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('Y')");

                entity.Property(e => e.AmountPaid).HasColumnType("decimal(18, 2)");

                entity.Property(e => e.AuthorizationCreateTime).HasColumnType("datetime");

                entity.Property(e => e.AuthorizationId)
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.AuthorizationUpdateTime).HasColumnType("datetime");

                entity.Property(e => e.CaptureId)
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.Charity).HasColumnType("decimal(18, 2)");

                entity.Property(e => e.CreateTime)
                    .HasColumnName("Create_Time")
                    .HasColumnType("datetime");

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.DeletedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.DeletedDate).HasColumnType("datetime");

                entity.Property(e => e.Description).IsUnicode(false);

                entity.Property(e => e.IsPaymentSuccess)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.ModifiedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedDate).HasColumnType("datetime");

                entity.Property(e => e.PayerId)
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.PaymentId)
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.PaymentMode)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.RecordDeleted)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.State)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.TotalAmount)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.TransactionFee)
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.UpdateTime)
                    .HasColumnName("update_time")
                    .HasColumnType("datetime");

                entity.Property(e => e.ValidUntill)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.HasOne(d => d.StatusNavigation)
                    .WithMany(p => p.Transactions)
                    .HasForeignKey(d => d.Status);

                entity.HasOne(d => d.UserCouponLog)
                    .WithMany(p => p.Transactions)
                    .HasForeignKey(d => d.UserCouponLogId)
                    .HasConstraintName("FK_Transactions_UserCouponLogs");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.Transactions)
                    .HasForeignKey(d => d.UserId);
            });

            modelBuilder.Entity<UserActivities>(entity =>
            {
                entity.HasKey(e => e.UserActivityLogId);

                entity.Property(e => e.Activity)
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.ActivityDate)
                    .HasColumnType("date")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.ActivityDescription).IsUnicode(false);

                entity.HasOne(d => d.User)
                    .WithMany(p => p.UserActivities)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull);
            });

            modelBuilder.Entity<UserCouponLogs>(entity =>
            {
                entity.HasKey(e => e.UserCouponLogId);

                entity.Property(e => e.Availed)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.CreatedDate).HasColumnType("date");

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(500)
                    .IsUnicode(false);

                entity.Property(e => e.ExpirationDate).HasColumnType("date");

                entity.HasOne(d => d.Coupon)
                    .WithMany(p => p.UserCouponLogs)
                    .HasForeignKey(d => d.CouponId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_UserCouponLogs_UserCouponLogs_CouponId");
            });

            modelBuilder.Entity<UserRefreshToken>(entity =>
            {
                entity.HasKey(e => e.UserRefershTokenId);

                entity.Property(e => e.CreatedByIp)
                    .IsRequired()
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.ExpiryDate).HasColumnType("datetime");

                entity.Property(e => e.RefershToken)
                    .IsRequired()
                    .HasMaxLength(500)
                    .IsUnicode(false);

                entity.Property(e => e.ReplacedByToken)
                    .HasMaxLength(500)
                    .IsUnicode(false);

                entity.Property(e => e.RevokedByIp)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.RevokedDate).HasColumnType("datetime");
            });

            modelBuilder.Entity<Users>(entity =>
            {
                entity.HasKey(e => e.UserId);

                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.DateOfBirth).HasColumnType("date");

                entity.Property(e => e.DeletedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.DeletedDate).HasColumnType("datetime");

                entity.Property(e => e.Education).IsUnicode(false);

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.ExternalProvider)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ExternalToken)
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.FirstName)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.IsStudent)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.IsTutor)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.Languages)
                    .HasMaxLength(1000)
                    .IsUnicode(false);

                entity.Property(e => e.LastName)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedDate).HasColumnType("datetime");

                entity.Property(e => e.Password)
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.PhoneNumber)
                    .HasMaxLength(30)
                    .IsUnicode(false);

                entity.Property(e => e.PhoneNumberOtpexpiration)
                    .HasColumnName("PhoneNumberOTPExpiration")
                    .HasColumnType("datetime");

                entity.Property(e => e.PhoneNumberVerificationOtp)
                    .HasColumnName("PhoneNumberVerificationOTP")
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.PhoneNumberVerified)
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.RecordDeleted)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.Property(e => e.RegisterationDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.ResetTokenExpiration).HasColumnType("datetime");

                entity.Property(e => e.VerifyAccountTokenExpiration).HasColumnType("datetime");

                entity.HasOne(d => d.Country)
                    .WithMany(p => p.Users)
                    .HasForeignKey(d => d.CountryId);

                entity.HasOne(d => d.GenderNavigation)
                    .WithMany(p => p.Users)
                    .HasForeignKey(d => d.Gender);
            });

            modelBuilder.Entity<ViewLogs>(entity =>
            {
                entity.HasKey(e => e.ViewLogId);

                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('Y')");

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreatedDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.DeletedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.DeletedDate).HasColumnType("datetime");

                entity.Property(e => e.ModifiedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModifiedDate).HasColumnType("datetime");

                entity.Property(e => e.RecordDeleted)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength()
                    .HasDefaultValueSql("('N')");

                entity.HasOne(d => d.RefrenceTypeNavigation)
                    .WithMany(p => p.ViewLogs)
                    .HasForeignKey(d => d.RefrenceType)
                    .OnDelete(DeleteBehavior.ClientSetNull);

                entity.HasOne(d => d.Student)
                    .WithMany(p => p.ViewLogs)
                    .HasForeignKey(d => d.StudentId)
                    .OnDelete(DeleteBehavior.ClientSetNull);
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
