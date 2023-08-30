using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace OsmosIsh.Core.DTOs.Request
{
#pragma warning disable CS1591 // Missing XML comment for publicly visible type or member
    public class CreateUpdateAffiliateRequest : BaseRequest
#pragma warning restore CS1591 // Missing XML comment for publicly visible type or member
    {
        public int AffiliateId { get; set; }
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string LastName { get; set; }
        [Required]
        public string PhoneNumber { get; set; }
        [Required]
        public string Email { get; set; }
        [Required]
        public string PaypalAccountType { get; set; }
        [Required]
        public string PaypalAccount { get; set; }
        [Required]
        public decimal? AffiliateEarningPercentage { get; set; }
        [Required]
        public decimal? TeacherEarningPercentage { get; set; }
        [Required]
        public string ExpirationDate { get; set; }
    }

    public class BlockUnBlockAffiliateRequest : BaseRequest
    {
        [Required]
        public int AffiliateId { get; set; }
        [Required]
        public string BlockAffilicate { get; set; }
    }

    public class ValideAffiliateRequest 
    {
        [Required]
        public string AffiliateCode { get; set; }
    }
}
