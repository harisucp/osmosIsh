using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class PrivatSessionAvailableDaySlots
    {
        public int PrivatSessionAvailableDaySlotId { get; set; }
        public int PrivatSessionAvailableDayId { get; set; }
        public TimeSpan Start { get; set; }
        public TimeSpan End { get; set; }

        public virtual PrivatSessionAvailableDays PrivatSessionAvailableDay { get; set; }
    }
}
