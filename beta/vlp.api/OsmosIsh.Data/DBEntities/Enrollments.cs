using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class Enrollments
    {
        public Enrollments()
        {
            TransactionDetail = new HashSet<TransactionDetail>();
        }

        public int EnrollmentId { get; set; }
        public int StudentId { get; set; }
        public DateTime? EnrollmentDate { get; set; }
        public string PaidSubscription { get; set; }
        public int RefrenceId { get; set; }
        public int RefrenceType { get; set; }
        public int? TransactionId { get; set; }
        public string IsSavedForLater { get; set; }
        public decimal? DiscountedFee { get; set; }
        public string Active { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string RecordDeleted { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }

        public virtual GlobalCodes RefrenceTypeNavigation { get; set; }
        public virtual Students Student { get; set; }
        public virtual ICollection<TransactionDetail> TransactionDetail { get; set; }
    }
}
