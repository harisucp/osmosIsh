using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class Subscriptions
    {
        public int SubscriptionId { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int? UserTypeId { get; set; }
        public string Active { get; set; }
        public DateTime SubscriptionDate { get; set; }
        public DateTime? UnSubscriptionDate { get; set; }

        public virtual GlobalCodes UserType { get; set; }
    }
}
