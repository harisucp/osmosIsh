using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace OsmosIsh.Core.DTOs.Request
{
    public class CreateUpdateCouponRequest : BaseRequest
    {
        public int CouponId { get; set; }
        [Required]
        public int CouponType { get; set; }
        [Required]
        public string CouponCode { get; set; }
        [Required]
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public int? ValidDays { get; set; }
        [Required]
        public decimal? Discount { get; set; }
        [Required]
        public string DiscountType { get; set; }
        [Required]
        public string NoExpiration { get; set; }

        public int? MinimumCartAmount { get; set; }
        public int? MaximumDiscount { get; set; }
    }

    public class BlockUnBlockCouponRequest : BaseRequest
    {
        [Required]
        public int CouponId { get; set; }
        [Required]
        public string BlockCoupon { get; set; }
    }
}
