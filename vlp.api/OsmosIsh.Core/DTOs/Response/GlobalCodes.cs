using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.DTOs.Response
{
    public class GlobalCodes
    {

        public string CategoryName
        {
            get; set;
        }

        public int GlobalCodeId { get; set; }
        public string CodeName { get; set; }
        public string Active { get; set; }
    }
}
