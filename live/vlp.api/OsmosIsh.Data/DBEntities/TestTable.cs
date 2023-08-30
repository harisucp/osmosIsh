using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class TestTable
    {
        public int Id { get; set; }
        public DateTime? StartDate { get; set; }
        public string StartDateTimezone { get; set; }
        public DateTime? StartDateUtc { get; set; }
        public DateTime? CreatedDate { get; set; }
    }
}
