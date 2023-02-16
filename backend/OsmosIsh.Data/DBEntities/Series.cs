using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class Series
    {
        public Series()
        {
            CancelledSeriesRequest = new HashSet<CancelledSeriesRequest>();
            SeriesDetail = new HashSet<SeriesDetail>();
            Session = new HashSet<Session>();
        }

        public int SeriesId { get; set; }
        public int TeacherId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? Enddate { get; set; }
        public string Active { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string RecordDeleted { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }
        public string FeaturedSeries { get; set; }
        public string BlockSeries { get; set; }

        public virtual Teachers Teacher { get; set; }
        public virtual ICollection<CancelledSeriesRequest> CancelledSeriesRequest { get; set; }
        public virtual ICollection<SeriesDetail> SeriesDetail { get; set; }
        public virtual ICollection<Session> Session { get; set; }
    }
}
