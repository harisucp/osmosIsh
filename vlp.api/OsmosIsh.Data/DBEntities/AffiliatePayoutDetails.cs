using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class AffiliatePayoutDetails
    {
        public int AffiliatePayoutDeatilId { get; set; }
        public int AffiliateId { get; set; }
        public int PayoutId { get; set; }
        public string AffiliatePayoutJson { get; set; }
        public string PayoutSucceeded { get; set; }
        public string PayoutBatchId { get; set; }
        public string SenderBatchId { get; set; }
        public string Amount { get; set; }
        public string Fee { get; set; }
        public string BatchStatus { get; set; }
        public string TimeCreated { get; set; }
        public string TimeCompleted { get; set; }
        public string Errors { get; set; }
        public string PaypalAccountType { get; set; }
        public string PaypalAccount { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }

        public virtual PayoutDetail Payout { get; set; }
    }
}
