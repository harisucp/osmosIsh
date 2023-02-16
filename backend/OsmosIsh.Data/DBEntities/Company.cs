using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class Company
    {
        public int CompanyId { get; set; }
        public string CompanyName { get; set; }
        public int BeforeMeetingStartTime { get; set; }
        public int BeforeMeetingEndTime { get; set; }
    }
}
