using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class Meetings
    {
        public Meetings()
        {
            MeetingAttendees = new HashSet<MeetingAttendees>();
        }

        public int MeetingId { get; set; }
        public string AmazonChimeMeetingTitle { get; set; }
        public string AmazonChimeMeetingId { get; set; }
        public string AmazonChimeAttendeeId { get; set; }
        public int SessionId { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime? EndDateTime { get; set; }
        public string IsMeetingEnded { get; set; }
        public string Payoutsucceeded { get; set; }
        public string PayoutBatchId { get; set; }
        public string SenderBatchId { get; set; }
        public string Amount { get; set; }
        public string Fee { get; set; }
        public string BatchStatus { get; set; }
        public string TimeCreated { get; set; }
        public string TimeCompleted { get; set; }
        public string Errors { get; set; }

        public virtual Session Session { get; set; }
        public virtual ICollection<MeetingAttendees> MeetingAttendees { get; set; }
    }
}
