using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class SessionCategories
    {
        public SessionCategories()
        {
            PrivateSessionLog = new HashSet<PrivateSessionLog>();
            SeriesDetail = new HashSet<SeriesDetail>();
        }

        public int SessionCategoryId { get; set; }
        public int? ParentId { get; set; }
        public string SessionCategoryName { get; set; }
        public string Active { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }

        public virtual ICollection<PrivateSessionLog> PrivateSessionLog { get; set; }
        public virtual ICollection<SeriesDetail> SeriesDetail { get; set; }
    }
}
