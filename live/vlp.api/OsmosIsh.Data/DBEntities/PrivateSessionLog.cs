using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class PrivateSessionLog
    {
        public int PrivateSessionLogId { get; set; }
        public int TeacherId { get; set; }
        public int StudentId { get; set; }
        public string SessionTitle { get; set; }
        public int? SessionCategoryId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string IsAccept { get; set; }
        public string Notes { get; set; }
        public string Active { get; set; }
        public int? SessionId { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string RecordDeleted { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }

        public virtual SessionCategories SessionCategory { get; set; }
        public virtual Students Student { get; set; }
        public virtual Teachers Teacher { get; set; }
    }
}
