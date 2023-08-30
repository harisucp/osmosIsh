using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class GlobalCodes
    {
        public GlobalCodes()
        {
            Coupons = new HashSet<Coupons>();
            DisputesDisputeReasonNavigation = new HashSet<Disputes>();
            DisputesDisputeStatusNavigation = new HashSet<Disputes>();
            Enrollments = new HashSet<Enrollments>();
            Favorites = new HashSet<Favorites>();
            Images = new HashSet<Images>();
            MessagesRecipientTypeNavigation = new HashSet<Messages>();
            MessagesSenderTypeNavigation = new HashSet<Messages>();
            Rating = new HashSet<Rating>();
            Reviews = new HashSet<Reviews>();
            Schedule = new HashSet<Schedule>();
            SessionDetail = new HashSet<SessionDetail>();
            Subscriptions = new HashSet<Subscriptions>();
            Transactions = new HashSet<Transactions>();
            Users = new HashSet<Users>();
            ViewLogs = new HashSet<ViewLogs>();
        }

        public int GlobalCodeId { get; set; }
        public int CategoryId { get; set; }
        public string CodeName { get; set; }
        public string Description { get; set; }
        public string Active { get; set; }
        public string CannotModifyNameOrDelete { get; set; }
        public int? SortOrder { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string RecordDeleted { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }

        public virtual GlobalCodeCategories Category { get; set; }
        public virtual ICollection<Coupons> Coupons { get; set; }
        public virtual ICollection<Disputes> DisputesDisputeReasonNavigation { get; set; }
        public virtual ICollection<Disputes> DisputesDisputeStatusNavigation { get; set; }
        public virtual ICollection<Enrollments> Enrollments { get; set; }
        public virtual ICollection<Favorites> Favorites { get; set; }
        public virtual ICollection<Images> Images { get; set; }
        public virtual ICollection<Messages> MessagesRecipientTypeNavigation { get; set; }
        public virtual ICollection<Messages> MessagesSenderTypeNavigation { get; set; }
        public virtual ICollection<Rating> Rating { get; set; }
        public virtual ICollection<Reviews> Reviews { get; set; }
        public virtual ICollection<Schedule> Schedule { get; set; }
        public virtual ICollection<SessionDetail> SessionDetail { get; set; }
        public virtual ICollection<Subscriptions> Subscriptions { get; set; }
        public virtual ICollection<Transactions> Transactions { get; set; }
        public virtual ICollection<Users> Users { get; set; }
        public virtual ICollection<ViewLogs> ViewLogs { get; set; }
    }
}
