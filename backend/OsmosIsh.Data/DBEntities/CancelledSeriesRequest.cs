using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class CancelledSeriesRequest
    {
        public int CancelledSeriesId { get; set; }
        public int SeriesId { get; set; }
        public int StudentId { get; set; }
        public int TeacherId { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int? Status { get; set; }
        public string IsCancelledSeriesResoved { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string AdminComments { get; set; }

        public virtual Series Series { get; set; }
        public virtual Students Student { get; set; }
        public virtual Teachers Teacher { get; set; }
    }
}
