using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.DTOs.Response
{
    public class CouponCodeResponse
    {
        public int CouponId { get; set; }
        public string CouponCode { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public int? ValidDays { get; set; }
        public string Discount { get; set; }
        public string BlockCoupon { get; set; }
        public string DiscountType { get; set; }
    }
}
