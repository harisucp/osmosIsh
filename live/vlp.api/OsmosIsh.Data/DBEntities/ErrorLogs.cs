using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class ErrorLogs
    {
        public ErrorLogs()
        {
            Apilogs = new HashSet<Apilogs>();
        }

        public int ErrorLogId { get; set; }
        public string ExceptionMsg { get; set; }
        public string ExceptionType { get; set; }
        public string ExceptionSource { get; set; }
        public DateTime? LogDateTime { get; set; }

        public virtual ICollection<Apilogs> Apilogs { get; set; }
    }
}
