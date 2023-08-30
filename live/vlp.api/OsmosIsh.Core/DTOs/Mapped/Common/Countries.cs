using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.DTOs.Mapped.Common
{
    public class Countries
    {
        public int CountryId { get; set; }
        public string ISO { get; set; }
        public string Name { get; set; }
        public string NiceName { get; set; }
        public string ISO3 { get; set; }
        public string NumberCode { get; set; }
        public string PhoneCode { get; set; }
    }
}
