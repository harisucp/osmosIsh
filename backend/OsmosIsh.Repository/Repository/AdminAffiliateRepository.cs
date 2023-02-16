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
    public class AdminAffiliateRepository : IAdminAffiliateRepository
    {
        #region readonly
        private readonly IMapper _Mapper;
        #endregion

        OsmosIshContext _ObjContext;
        MainResponse _MainResponse = null;


        public AdminAffiliateRepository(OsmosIshContext ObjContext, IMapper Mapper)
        {
            _MainResponse = new MainResponse();
            _ObjContext = ObjContext;
            _Mapper = Mapper;
        }


        public async Task<MainResponse> CreateUpdateAffiliate(CreateUpdateAffiliateRequest createUpdateAffiliateRequest)
        {
            if (createUpdateAffiliateRequest.AffiliateId > 0)
            {
                var affiliateCode = _ObjContext.Affiliates.Where(x => x.AffiliateId == createUpdateAffiliateRequest.AffiliateId && x.Active == "Y").FirstOrDefault();
                if (affiliateCode != null)
                {
                    bool alreadyExists = _ObjContext.Affiliates.Where(x => x.Email == createUpdateAffiliateRequest.Email && x.AffiliateId != createUpdateAffiliateRequest.AffiliateId && x.Active == "Y").Any();
                    if (alreadyExists)
                    {
                        _MainResponse.Success = false;
                        _MainResponse.Message = ErrorMessages.AFFILIATE_ALREADY_REGISTER;
                        return _MainResponse;
                    }
                    bool mailChanged = false;
                    if (affiliateCode.Email != createUpdateAffiliateRequest.Email)
                    {
                        mailChanged = true;
                    }

                    if (affiliateCode != null && (affiliateCode.FirstName != createUpdateAffiliateRequest.FirstName
                        || affiliateCode.LastName != createUpdateAffiliateRequest.LastName
                    || affiliateCode.Email != createUpdateAffiliateRequest.Email || affiliateCode.PhoneNumber != createUpdateAffiliateRequest.PhoneNumber
                    || affiliateCode.PaypalAccountType != createUpdateAffiliateRequest.PaypalAccountType || affiliateCode.PaypalAccount != createUpdateAffiliateRequest.PaypalAccount
                    || affiliateCode.AffiliateEarningPercentage != createUpdateAffiliateRequest.AffiliateEarningPercentage
                    || affiliateCode.TeacherEarningPercentage != createUpdateAffiliateRequest.TeacherEarningPercentage
                    || affiliateCode.ExpirationDate != Convert.ToDateTime(createUpdateAffiliateRequest.ExpirationDate)))
                    {
                        affiliateCode.Active = "N";
                        var affilate = _Mapper.Map<Affiliates>(createUpdateAffiliateRequest);
                        affilate.CreatedBy = createUpdateAffiliateRequest.ActionPerformedBy;
                        affilate.CreatedDate = DateTime.UtcNow;
                        affilate.AffiliateCode = affiliateCode.AffiliateCode;
                        affilate.Code = affiliateCode.Code;
                        affilate.AffiliateId = 0;
                        _ObjContext.Affiliates.Update(affiliateCode);
                        _ObjContext.Affiliates.Add(affilate);
                        await _ObjContext.SaveChangesAsync();
                    }

                    if (mailChanged)
                    {
                        var emailBody = "";
                        emailBody = CommonFunction.GetTemplateFromHtml("AdminAffiliateCode.html");
                        emailBody = emailBody.Replace("{AffiliateName}", affiliateCode.FirstName);
                        emailBody = emailBody.Replace("{AffiliateCODE}", affiliateCode.AffiliateCode);
                        NotificationHelper.SendEmail(affiliateCode.Email, emailBody, "Affiliate code generated.", true);
                    }
                }
                _MainResponse.Message = SuccessMessage.AFFILIATE_UPDATED_SUCCESSFULLY;
                _MainResponse.Success = true;
            }
            else
            {
                bool alreadyExists = _ObjContext.Affiliates.Where(x => x.Email == createUpdateAffiliateRequest.Email).Any();
                if (alreadyExists)
                {
                    _MainResponse.Success = false;
                    _MainResponse.Message = ErrorMessages.AFFILIATE_ALREADY_REGISTER;
                    return _MainResponse;
                }
                var affiliate = _Mapper.Map<Affiliates>(createUpdateAffiliateRequest);
                int latestAffiliateCode = _ObjContext.Affiliates.OrderByDescending(u => u.Code).Select(x => x.Code).FirstOrDefault();
                latestAffiliateCode = latestAffiliateCode > 0 ? latestAffiliateCode + 1 : 400;
                affiliate.Code = latestAffiliateCode;
                affiliate.AffiliateCode = affiliate.FirstName.Substring(0, 3) + affiliate.LastName.Substring(0, 3) + latestAffiliateCode;
                affiliate.CreatedBy = createUpdateAffiliateRequest.ActionPerformedBy;
                affiliate.CreatedDate = DateTime.UtcNow;
                _ObjContext.Affiliates.Add(affiliate);
                await _ObjContext.SaveChangesAsync();
                _MainResponse.Message = SuccessMessage.AFFILIATE_CREATED_SUCCESSFULLY;
                _MainResponse.Success = true;

                var emailBody = "";
                emailBody = CommonFunction.GetTemplateFromHtml("AdminAffiliateCode.html");
                emailBody = emailBody.Replace("{AffiliateName}", affiliate.FirstName);
                emailBody = emailBody.Replace("{AffiliateCODE}", affiliate.AffiliateCode);
                NotificationHelper.SendEmail(affiliate.Email, emailBody, "Affiliate code generated.", true);
            }
            return _MainResponse;
        }

        public async Task<MainResponse> BlockUnBlockeAffiliate(BlockUnBlockAffiliateRequest blockUnBlockAffiliateRequest)
        {
            var affiliateData = _ObjContext.Affiliates.Where(x => x.AffiliateId == blockUnBlockAffiliateRequest.AffiliateId && x.Active == "Y").FirstOrDefault();
            if (affiliateData != null)
            {
                affiliateData.BlockAffiliate = blockUnBlockAffiliateRequest.BlockAffilicate;
                affiliateData.ModifiedBy = blockUnBlockAffiliateRequest.ActionPerformedBy;
                affiliateData.ModifiedDate = DateTime.UtcNow;
                _ObjContext.Affiliates.Update(affiliateData);
                await _ObjContext.SaveChangesAsync();
                _MainResponse.Message = SuccessMessage.AFFILIATE_UPDATED_SUCCESSFULLY;
                _MainResponse.Success = true;
            }
            else
            {
                _MainResponse.Message = ErrorMessages.AFFILIATE_NOT_EXISTS;
                _MainResponse.Success = false;
            }
            return _MainResponse;
        }

        
        public async Task<MainResponse> ValidateAffiliate(ValideAffiliateRequest valideAffiliateRequest)
        {
            var affiliateData = _ObjContext.Affiliates.Where(x => x.AffiliateCode == valideAffiliateRequest.AffiliateCode && x.Active == "Y").FirstOrDefault();
            if (affiliateData != null)
            {
                //_MainResponse.Message = SuccessMessage.AFFILIATE_CODE_VERIFIED.Replace("{Teache_PayBack}", affiliateData.TeacherEarningPercentage.ToString());
                _MainResponse.Message = SuccessMessage.AFFILIATE_CODE_VERIFIED;
                _MainResponse.Success = true;
            }
            else
            {
                _MainResponse.Message = ErrorMessages.AFFILIATE_CODE_INVALID;
                _MainResponse.Success = false;
            }
            return _MainResponse;
        }
    }
}
