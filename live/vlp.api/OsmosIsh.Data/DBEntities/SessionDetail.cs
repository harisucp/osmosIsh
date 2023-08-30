using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class SessionDetail
    {
        public int SessionDetailId { get; set; }
        public int SessionId { get; set; }
        public string SessionTitle { get; set; }
        public int? Status { get; set; }
        public string TimeZone { get; set; }
        public int NumberOfJoineesAllowed { get; set; }
        public int NumberOfJoineesEnrolled { get; set; }
        public decimal SessionFee { get; set; }
        public string Language { get; set; }
        public int SessionCategoryId { get; set; }
        public string SessionTags { get; set; }
        public string Description { get; set; }
        public string PrivateSession { get; set; }
        public string Agenda { get; set; }
        public string Active { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string RecordDeleted { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }

        public virtual Session Session { get; set; }
        public virtual GlobalCodes StatusNavigation { get; set; }
    }
}
