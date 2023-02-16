using AutoMapper;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Data.DBEntities;
using OsmosIsh.Repository.IRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.Repository
{
    public class AdminCouponRepository : IAdminCouponRepository
    {
        #region readonly
        private readonly IMapper _Mapper;
        #endregion

        OsmosIshContext _ObjContext;
        MainResponse _MainResponse = null;


        public AdminCouponRepository(OsmosIshContext ObjContext, IMapper Mapper)
        {
            _MainResponse = new MainResponse();
            _ObjContext = ObjContext;
            _Mapper = Mapper;
        }

        public async Task<MainResponse> CreateUpdateCoupon(CreateUpdateCouponRequest createUpdateCouponRequest)
        {
            if (createUpdateCouponRequest.CouponId > 0)
            {
                var promotionalCouponType = (from C in _ObjContext.Coupons
                                             join G in _ObjContext.GlobalCodes on C.CouponType equals G.GlobalCodeId
                                             where C.CouponType == createUpdateCouponRequest.CouponType && G.CodeName == "PromotionalCode"
                                             select C.CouponId).Any();
                var couponData = _ObjContext.Coupons.Where(x => x.CouponId == createUpdateCouponRequest.CouponId && x.Active == "Y").FirstOrDefault();
                if (promotionalCouponType)
                {
                    couponData.NoExpiration = createUpdateCouponRequest.NoExpiration;
                    couponData.EndDate = string.IsNullOrEmpty(createUpdateCouponRequest.EndDate) ? (DateTime?)null : Convert.ToDateTime(createUpdateCouponRequest.EndDate);
                    couponData.ValidDays = Convert.ToInt32(createUpdateCouponRequest.ValidDays);
                    couponData.ModifiedBy = createUpdateCouponRequest.ActionPerformedBy;
                    couponData.ModifiedDate = DateTime.UtcNow;
                    _ObjContext.Coupons.Update(couponData);
                    await _ObjContext.SaveChangesAsync();
                }
                else
                {

                    if (couponData != null && (couponData.CouponCode != createUpdateCouponRequest.CouponCode || couponData.StartDate != Convert.ToDateTime(createUpdateCouponRequest.StartDate)
                        || couponData.EndDate != Convert.ToDateTime(createUpdateCouponRequest.EndDate) || couponData.ValidDays != createUpdateCouponRequest.ValidDays
                        || couponData.Discount != createUpdateCouponRequest.Discount || couponData.DiscountType != createUpdateCouponRequest.DiscountType
                        || couponData.NoExpiration != createUpdateCouponRequest.NoExpiration
                        || couponData.MinimumCartAmount != createUpdateCouponRequest.MinimumCartAmount
                        || couponData.MaximumDiscount != createUpdateCouponRequest.MaximumDiscount))
                    {
                        couponData.Active = "N";
                        var coupons = _Mapper.Map<Coupons>(createUpdateCouponRequest);
                        coupons.CreatedBy = createUpdateCouponRequest.ActionPerformedBy;
                        coupons.CreatedDate = DateTime.UtcNow;
                        coupons.CouponId = 0;
                        _ObjContext.Coupons.Update(couponData);
                        _ObjContext.Coupons.Add(coupons);
                        await _ObjContext.SaveChangesAsync();
                    }
                }
                _MainResponse.Message = SuccessMessage.COUPON_UPDATED_SUCCESSFULLY;
                _MainResponse.Success = true;
            }
            else
            {
                bool alreadyExists = (from C in _ObjContext.Coupons
                                      join G in _ObjContext.GlobalCodes on C.CouponType equals G.GlobalCodeId
                                      where C.CouponType == createUpdateCouponRequest.CouponType && G.CodeName != "PromotionalCode"
                                      select C.CouponId).Any();

                bool promoCodeAlreadyExists = (from C in _ObjContext.Coupons
                                               join G in _ObjContext.GlobalCodes on C.CouponType equals G.GlobalCodeId
                                               where C.CouponType == createUpdateCouponRequest.CouponType && G.CodeName == "PromotionalCode" && C.CouponCode == createUpdateCouponRequest.CouponCode
                                               select C.CouponId).Any();

                if (alreadyExists || promoCodeAlreadyExists)
                {
                    _MainResponse.Success = false;
                    _MainResponse.Message = alreadyExists ? ErrorMessages.COUPON_ALREADY_EXISTS : ErrorMessages.COUPON_NAME_ALREADY_EXISTS;
                    return _MainResponse;
                }
                var coupons = _Mapper.Map<Coupons>(createUpdateCouponRequest);
                coupons.CreatedBy = createUpdateCouponRequest.ActionPerformedBy;
                coupons.CreatedDate = DateTime.UtcNow;
                _ObjContext.Coupons.Add(coupons);
                await _ObjContext.SaveChangesAsync();
                _MainResponse.Message = SuccessMessage.COUPON_CREATED_SUCCESSFULLY;
                _MainResponse.Success = true;
            }
            return _MainResponse;
        }

        public async Task<MainResponse> BlockUnBlockCoupon(BlockUnBlockCouponRequest blockUnBlockCouponRequest)
        {
            var couponData = _ObjContext.Coupons.Where(x => x.CouponId == blockUnBlockCouponRequest.CouponId && x.Active == "Y").FirstOrDefault();
            if (couponData != null)
            {
                couponData.BlockCoupon = blockUnBlockCouponRequest.BlockCoupon;
                couponData.ModifiedBy = blockUnBlockCouponRequest.ActionPerformedBy;
                couponData.ModifiedDate = DateTime.UtcNow;
                _ObjContext.Coupons.Update(couponData);
                await _ObjContext.SaveChangesAsync();
                _MainResponse.Message = SuccessMessage.COUPON_UPDATED_SUCCESSFULLY;
                _MainResponse.Success = true;
            }
            else
            {
                _MainResponse.Message = ErrorMessages.COUPON_NOT_EXISTS;
                _MainResponse.Success = false;
            }
            return _MainResponse;
        }
    }
}
