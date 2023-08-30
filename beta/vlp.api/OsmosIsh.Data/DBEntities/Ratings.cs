using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class Ratings
    {
        public int RatingId { get; set; }
        public int? RatingRefrenceId { get; set; }
        public int RatingTypeId { get; set; }
        public int? StudentId { get; set; }
        public int? Rating { get; set; }
        public string Active { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string RecordDeleted { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }

        public virtual GlobalCodes RatingType { get; set; }
        public virtual Students Student { get; set; }
    }
}
