using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class TeacherAffiliateCode
    {
        public int TeacherAffiliateCodeId { get; set; }
        public int? TeacherId { get; set; }
        public string AffiliateCode { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? DeletedDate { get; set; }
        public string DeletedBy { get; set; }
        public string IsDeleted { get; set; }

        public virtual Teachers Teacher { get; set; }
    }
}
