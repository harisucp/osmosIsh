using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class TransactionDetail
    {
        public int TransactionDetailId { get; set; }
        public int TransactionId { get; set; }
        public int EnrollmentId { get; set; }
        public decimal? ServiceFee { get; set; }
        public decimal? TotalAmount { get; set; }
        public decimal? Charity { get; set; }
        public decimal? SubTotal { get; set; }
        public string Currency { get; set; }
        public string Description { get; set; }
        public string Isrefunded { get; set; }
        public DateTime? CreateTime { get; set; }
        public DateTime? UpdateTime { get; set; }
        public string RefundState { get; set; }
        public int? SessionId { get; set; }
        public string Refund { get; set; }
        public string RefundAmount { get; set; }
        public string Active { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string RecordDeleted { get; set; }

        public virtual Enrollments Enrollment { get; set; }
        public virtual Transactions Transaction { get; set; }
    }
}
