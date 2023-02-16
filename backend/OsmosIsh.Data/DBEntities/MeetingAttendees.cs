using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class MeetingAttendees
    {
        public int MeetingAttendeeId { get; set; }
        public int MeetingId { get; set; }
        public int StudentId { get; set; }
        public string AmazonChimeAttendeeId { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime? EndDateTime { get; set; }

        public virtual Meetings Meeting { get; set; }
        public virtual Students Student { get; set; }
    }
}
