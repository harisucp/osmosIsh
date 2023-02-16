using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class Teachers
    {
        public Teachers()
        {
            CancelledSeriesRequest = new HashSet<CancelledSeriesRequest>();
            Disputes = new HashSet<Disputes>();
            PayoutDetail = new HashSet<PayoutDetail>();
            PrivatSessionAvailableDays = new HashSet<PrivatSessionAvailableDays>();
            PrivateSessionLog = new HashSet<PrivateSessionLog>();
            Series = new HashSet<Series>();
            Session = new HashSet<Session>();
            TeacherAffiliateCode = new HashSet<TeacherAffiliateCode>();
        }

        public int TeacherId { get; set; }
        public int? UserId { get; set; }
        public string Awards { get; set; }
        public string Specialization { get; set; }
        public string Interest { get; set; }
        public string Description { get; set; }
        public string PrivateSession { get; set; }
        public int? NumberOfPublishedCourse { get; set; }
        public int? SessionDeliveredCount { get; set; }
        public string IsProfileUpdated { get; set; }
        public decimal? FeePerHours { get; set; }
        public string PaypalAccountType { get; set; }
        public string PaypalAccount { get; set; }
        public string PrivateSessionCategories { get; set; }
        public string PrivateSessionTimeZone { get; set; }
        public string OwnReferralCode { get; set; }
        public string Blocked { get; set; }
        public string FeaturedTeacher { get; set; }
        public string Active { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string RecordDeleted { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }

        public virtual Users User { get; set; }
        public virtual ICollection<CancelledSeriesRequest> CancelledSeriesRequest { get; set; }
        public virtual ICollection<Disputes> Disputes { get; set; }
        public virtual ICollection<PayoutDetail> PayoutDetail { get; set; }
        public virtual ICollection<PrivatSessionAvailableDays> PrivatSessionAvailableDays { get; set; }
        public virtual ICollection<PrivateSessionLog> PrivateSessionLog { get; set; }
        public virtual ICollection<Series> Series { get; set; }
        public virtual ICollection<Session> Session { get; set; }
        public virtual ICollection<TeacherAffiliateCode> TeacherAffiliateCode { get; set; }
    }
}
