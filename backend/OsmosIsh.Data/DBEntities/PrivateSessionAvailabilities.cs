using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class PrivateSessionAvailabilities
    {
        public int PrivateSessionAvailabilityId { get; set; }
        public int TeacherId { get; set; }
        public int WeekDay { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public DateTime CreateDate { get; set; }

        public virtual Teachers Teacher { get; set; }
        public virtual GlobalCodes WeekDayNavigation { get; set; }
    }
}
