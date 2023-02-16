using OsmosIsh.Repository.Repository;
using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Service.Service
{
    public class CouponCodeService
    {
        CouponCodeRepository _CouponCodeRepository;
        public string GetTemplateFromHtml_CouponCode(string templateName, string email)
        {
            _CouponCodeRepository = new CouponCodeRepository();
            return _CouponCodeRepository.GetTemplateFromHtml_CouponCode(templateName, email);
        }
        public void InserUpdateUserCouponLog(int? userCouponLogId, int? couponId, string email)
        {
            _CouponCodeRepository = new CouponCodeRepository();
            _CouponCodeRepository.InserUpdateUserCouponLog(userCouponLogId, couponId, email);
        }
    }
}
