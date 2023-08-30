using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class UserCouponLogs
    {
        public UserCouponLogs()
        {
            Transactions = new HashSet<Transactions>();
        }

        public int UserCouponLogId { get; set; }
        public int CouponId { get; set; }
        public string Email { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ExpirationDate { get; set; }
        public string Availed { get; set; }

        public virtual Coupons Coupon { get; set; }
        public virtual ICollection<Transactions> Transactions { get; set; }
    }
}
