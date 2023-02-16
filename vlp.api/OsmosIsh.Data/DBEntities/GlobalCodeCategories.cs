using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class GlobalCodeCategories
    {
        public GlobalCodeCategories()
        {
            GlobalCodes = new HashSet<GlobalCodes>();
        }

        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string AllowAddDelete { get; set; }
        public string AllowCodeNameEdit { get; set; }
        public string AllowSortOrderEdit { get; set; }
        public string Description { get; set; }
        public string Active { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string RecordDeleted { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }

        public virtual ICollection<GlobalCodes> GlobalCodes { get; set; }
    }
}
