using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class Session
    {
        public Session()
        {
            Meetings = new HashSet<Meetings>();
            SessionDetail = new HashSet<SessionDetail>();
        }

        public int SessionId { get; set; }
        public int? SeriesId { get; set; }
        public int TeacherId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int Duration { get; set; }
        public string Active { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string RecordDeleted { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }
        public string FeaturedSession { get; set; }
        public string BlockSession { get; set; }
        public int? AffiliateId { get; set; }

        public virtual Series Series { get; set; }
        public virtual Teachers Teacher { get; set; }
        public virtual ICollection<Meetings> Meetings { get; set; }
        public virtual ICollection<SessionDetail> SessionDetail { get; set; }
    }
}
