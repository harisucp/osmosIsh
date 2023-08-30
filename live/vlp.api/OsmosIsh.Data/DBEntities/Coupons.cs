using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class Coupons
    {
        public Coupons()
        {
            UserCouponLogs = new HashSet<UserCouponLogs>();
        }

        public int CouponId { get; set; }
        public int CouponType { get; set; }
        public string CouponCode { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int ValidDays { get; set; }
        public decimal? Discount { get; set; }
        public string DiscountType { get; set; }
        public string NoExpiration { get; set; }
        public string Active { get; set; }
        public string BlockCoupon { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string ModifiedBy { get; set; }
        public int? MinimumCartAmount { get; set; }
        public int? MaximumDiscount { get; set; }

        public virtual GlobalCodes CouponTypeNavigation { get; set; }
        public virtual ICollection<UserCouponLogs> UserCouponLogs { get; set; }
    }
}
