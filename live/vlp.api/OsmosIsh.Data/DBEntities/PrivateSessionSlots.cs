using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class PrivateSessionSlots
    {
        public int PrivateSessionSlotId { get; set; }
        public int TeacherId { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public DateTime CreateDate { get; set; }
        public string RecordDeleted { get; set; }
        public DateTime? DeletedDate { get; set; }

        public virtual Teachers Teacher { get; set; }
    }
}
