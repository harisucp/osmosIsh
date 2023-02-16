using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class PrivatSessionAvailableDays
    {
        public PrivatSessionAvailableDays()
        {
            PrivatSessionAvailableDaySlots = new HashSet<PrivatSessionAvailableDaySlots>();
        }

        public int PrivatSessionAvailableDayId { get; set; }
        public string Day { get; set; }
        public bool Opened { get; set; }
        public int TeacherId { get; set; }

        public virtual Teachers Teacher { get; set; }
        public virtual ICollection<PrivatSessionAvailableDaySlots> PrivatSessionAvailableDaySlots { get; set; }
    }
}
