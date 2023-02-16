using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class UserActivities
    {
        public int UserActivityLogId { get; set; }
        public int UserId { get; set; }
        public string Activity { get; set; }
        public string ActivityDescription { get; set; }
        public DateTime ActivityDate { get; set; }

        public virtual Users User { get; set; }
    }
}
