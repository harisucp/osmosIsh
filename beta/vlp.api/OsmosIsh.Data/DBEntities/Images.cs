using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class Images
    {
        public int ImageId { get; set; }
        public int ImageTypeId { get; set; }
        public string ImageFile { get; set; }
        public int ImageRefrenceId { get; set; }
        public string Active { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string RecordDeleted { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }

        public virtual GlobalCodes ImageType { get; set; }
    }
}
