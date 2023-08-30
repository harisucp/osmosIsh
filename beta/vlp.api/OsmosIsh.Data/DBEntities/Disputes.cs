using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class Disputes
    {
        public int DisputeId { get; set; }
        public int DisputeStatus { get; set; }
        public int DisputeReason { get; set; }
        public string Reason { get; set; }
        public int TeacherId { get; set; }
        public int StudentId { get; set; }
        public int? Sessionid { get; set; }
        public string TutorResponse { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public int? EnrollmentId { get; set; }

        public virtual GlobalCodes DisputeReasonNavigation { get; set; }
        public virtual GlobalCodes DisputeStatusNavigation { get; set; }
        public virtual Students Student { get; set; }
        public virtual Teachers Teacher { get; set; }
    }
}
