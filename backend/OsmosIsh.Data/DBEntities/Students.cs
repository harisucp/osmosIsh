using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class Students
    {
        public Students()
        {
            CancelledSeriesRequest = new HashSet<CancelledSeriesRequest>();
            Disputes = new HashSet<Disputes>();
            Enrollments = new HashSet<Enrollments>();
            Favorites = new HashSet<Favorites>();
            MeetingAttendees = new HashSet<MeetingAttendees>();
            PayoutDetail = new HashSet<PayoutDetail>();
            PrivateSessionLog = new HashSet<PrivateSessionLog>();
            Rating = new HashSet<Rating>();
            Reviews = new HashSet<Reviews>();
            ViewLogs = new HashSet<ViewLogs>();
        }

        public int StudentId { get; set; }
        public int UserId { get; set; }
        public int? NumberOfCoursesEnrolled { get; set; }
        public int? NumberOfCoursesCompleted { get; set; }
        public string Interest { get; set; }
        public string Description { get; set; }
        public string Active { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string RecordDeleted { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }
        public string Blocked { get; set; }

        public virtual Users User { get; set; }
        public virtual ICollection<CancelledSeriesRequest> CancelledSeriesRequest { get; set; }
        public virtual ICollection<Disputes> Disputes { get; set; }
        public virtual ICollection<Enrollments> Enrollments { get; set; }
        public virtual ICollection<Favorites> Favorites { get; set; }
        public virtual ICollection<MeetingAttendees> MeetingAttendees { get; set; }
        public virtual ICollection<PayoutDetail> PayoutDetail { get; set; }
        public virtual ICollection<PrivateSessionLog> PrivateSessionLog { get; set; }
        public virtual ICollection<Rating> Rating { get; set; }
        public virtual ICollection<Reviews> Reviews { get; set; }
        public virtual ICollection<ViewLogs> ViewLogs { get; set; }
    }
}
