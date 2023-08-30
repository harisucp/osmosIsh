using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class Transactions
    {
        public Transactions()
        {
            TransactionDetail = new HashSet<TransactionDetail>();
        }

        public int TransactionId { get; set; }
        public int? UserId { get; set; }
        public int? UserCouponLogId { get; set; }
        public int? Status { get; set; }
        public string Description { get; set; }
        public string IsPaymentSuccess { get; set; }
        public decimal Charity { get; set; }
        public decimal? AmountPaid { get; set; }
        public int? PaypalTransactionId { get; set; }
        public string CaptureId { get; set; }
        public string AuthorizationId { get; set; }
        public string PaymentId { get; set; }
        public string PayerId { get; set; }
        public string State { get; set; }
        public string TransactionFee { get; set; }
        public DateTime? CreateTime { get; set; }
        public DateTime? UpdateTime { get; set; }
        public string PaymentMode { get; set; }
        public string ValidUntill { get; set; }
        public DateTime? AuthorizationCreateTime { get; set; }
        public DateTime? AuthorizationUpdateTime { get; set; }
        public string TotalAmount { get; set; }
        public string Active { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string RecordDeleted { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }

        public virtual GlobalCodes StatusNavigation { get; set; }
        public virtual Users User { get; set; }
        public virtual UserCouponLogs UserCouponLog { get; set; }
        public virtual ICollection<TransactionDetail> TransactionDetail { get; set; }
    }
}
