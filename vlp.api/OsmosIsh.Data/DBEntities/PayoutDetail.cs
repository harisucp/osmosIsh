using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class PayoutDetail
    {
        public PayoutDetail()
        {
            AffiliatePayoutDetails = new HashSet<AffiliatePayoutDetails>();
        }

        public int PayoutId { get; set; }
        public int SessionId { get; set; }
        public int StudentId { get; set; }
        public int TeacherId { get; set; }
        public string PayoutSucceeded { get; set; }
        public string PayoutBatchId { get; set; }
        public string SenderBatchId { get; set; }
        public string Amount { get; set; }
        public string Fee { get; set; }
        public string BatchStatus { get; set; }
        public string TimeCreated { get; set; }
        public string TimeCompleted { get; set; }
        public string Errors { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int? SeriesId { get; set; }
        public decimal? TutorAffiliatePayBack { get; set; }
        public decimal? AffiliateShare { get; set; }
        public string PaypalAccountType { get; set; }
        public string PaypalAccount { get; set; }
        public decimal? SessionFee { get; set; }
        public decimal? ServiceFee { get; set; }
        public int? NumberOfStudentsEnrolled { get; set; }
        public string PayoutType { get; set; }

        public virtual Students Student { get; set; }
        public virtual Teachers Teacher { get; set; }
        public virtual ICollection<AffiliatePayoutDetails> AffiliatePayoutDetails { get; set; }
    }
}
