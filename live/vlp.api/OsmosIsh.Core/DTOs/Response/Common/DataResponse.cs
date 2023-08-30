using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.DTOs.Response.Common
{
    public class DataResponse 
    {
        public dynamic ResultDataList { get; set; }
        public object Structure { get; set; }
    }
    public class AuditResponse
    {
        public dynamic ResultDataList { get; set; }
    }
}
