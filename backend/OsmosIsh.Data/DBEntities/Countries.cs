using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class Countries
    {
        public Countries()
        {
            Users = new HashSet<Users>();
        }

        public int CountryId { get; set; }
        public string Iso { get; set; }
        public string Name { get; set; }
        public string NiceName { get; set; }
        public string Iso3 { get; set; }
        public int? NumberCode { get; set; }
        public int PhoneCode { get; set; }
        public DateTime CreatedDate { get; set; }

        public virtual ICollection<Users> Users { get; set; }
    }
}
