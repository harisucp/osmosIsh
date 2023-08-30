using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class Affiliates
    {
        public int AffiliateId { get; set; }
        public int Code { get; set; }
        public string AffiliateCode { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string PaypalAccountType { get; set; }
        public string PaypalAccount { get; set; }
        public decimal? AffiliateEarningPercentage { get; set; }
        public decimal? TeacherEarningPercentage { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public string Active { get; set; }
        public string BlockAffiliate { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string ModifiedBy { get; set; }
    }
}
