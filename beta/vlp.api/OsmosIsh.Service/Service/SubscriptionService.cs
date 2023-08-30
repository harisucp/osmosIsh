using AutoMapper;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Data.DBEntities;
using OsmosIsh.Repository.IRepository;
using OsmosIsh.Service.IService;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using OsmosIsh.Data.DBContext;
using System.Linq;
using RestSharp;

namespace OsmosIsh.Service.Service
{
    public class SubscriptionService : ISubscriptionService
    {
        #region readonly
        private readonly ISubscriptionRepository _SubscriptionRepository;
        private readonly IMapper _Mapper;
        #endregion

        #region Private
        private MainResponse _MainResponse;
        public OsmosIshContext _ObjContext;
        #endregion
        public SubscriptionService(ISubscriptionRepository SubscriptionRepository, IMapper Mapper, OsmosIshContext ObjContext)
        {
            _SubscriptionRepository = SubscriptionRepository;
            _Mapper = Mapper;
            _MainResponse = new MainResponse();
            _ObjContext = ObjContext;
        }

        public async Task<MainResponse> SubscribeEmail(SubscribeEmailRequest subscribeEmailRequest)
        {
            var subscriptionDetail = _SubscriptionRepository.GetSingle(x => x.Email == subscribeEmailRequest.Email && x.Active == "Y");
            if (subscriptionDetail == null)
            {
                var subscription = new Subscriptions();
                subscription.Email = subscribeEmailRequest.Email;
                subscription.SubscriptionDate = DateTime.UtcNow;
                subscription.FirstName = subscribeEmailRequest.FirstName;
                subscription.LastName = subscribeEmailRequest.LastName;
                int? UserTypeId = null;
                if (!string.IsNullOrWhiteSpace(subscribeEmailRequest.UserType))
                {
                    UserTypeId = _ObjContext.GlobalCodes.Where(x => x.CodeName.ToLower() == subscribeEmailRequest.UserType.ToLower()).Select(x => x.GlobalCodeId).FirstOrDefault();
                }
                subscription.UserTypeId = UserTypeId > 0 ? UserTypeId : null;

                await _SubscriptionRepository.AddAsync(subscription);
                _MainResponse.Message = SuccessMessage.EMAIL_SUBSCRIBED;

                var emailBody = string.Empty;
                if (!string.IsNullOrEmpty(subscribeEmailRequest.Source) && subscribeEmailRequest.Source == "ComingSoon")
                {
                    emailBody = CommonFunction.GetTemplateFromHtml("SubscriptionBeforeLive.html");
                }
                else
                {
                    var couponCodeService = new CouponCodeService();
                    emailBody = couponCodeService.GetTemplateFromHtml_CouponCode("Subscription.html", subscription.Email);
                    emailBody = emailBody.Replace("{RedirectUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/CourseSearch");
                }
                if (!string.IsNullOrWhiteSpace(subscribeEmailRequest.FirstName) && !string.IsNullOrWhiteSpace(subscribeEmailRequest.LastName))
                {
                    emailBody = emailBody.Replace("{FirstName}", subscribeEmailRequest.FirstName);
                }
                else
                {
                    emailBody = emailBody.Replace("{Email}", subscription.Email);
                }
                NotificationHelper.SendEmail(subscription.Email, emailBody, "Welcome to Osmos-Ish", true);
            }
            else
            {
                _MainResponse.Message = ErrorMessages.EMAIL_ALREADY_SUBSCRIBED;
                _MainResponse.Success = false;
            }
            return _MainResponse;
        }

        public async Task<MainResponse> UpdateSubscribeEmail(UpdateSubscribeEmailRequest updateSubscribeEmailRequest)
        {
            return await _SubscriptionRepository.UpdateSubscribeEmail(updateSubscribeEmailRequest);
        }

        public async Task<MainResponse> SubscribeEmailToSendy(SubscribeEmailToSendyRequest subscribeEmailToSendyRequest)
        {
            var subscriptionDetail = _SubscriptionRepository.GetSingle(x => x.Email == subscribeEmailToSendyRequest.Email && x.Active == "Y");
            if (subscriptionDetail == null)
            {
                var subscription = new Subscriptions();
                subscription.Email = subscribeEmailToSendyRequest.Email;
                subscription.SubscriptionDate = DateTime.UtcNow;
                subscription.FirstName = subscribeEmailToSendyRequest.FirstName;
                subscription.LastName = subscribeEmailToSendyRequest.LastName;
                await _SubscriptionRepository.AddAsync(subscription);

                _MainResponse.Message = SuccessMessage.EMAIL_SUBSCRIBED;
                var emailBody = string.Empty;
                var couponCodeService = new CouponCodeService();
                emailBody = couponCodeService.GetTemplateFromHtml_CouponCode("Subscription_CouponCode.html", subscription.Email);
                emailBody = emailBody.Replace("{RedirectUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/CourseSearch");

                var client = new RestClient(AppSettingConfigurations.AppSettings.SendySubscribeLink);
                client.Timeout = -1;
                var request = new RestRequest(Method.POST);
                 request.AddHeader("content-type", "application/x-www-form-urlencoded");
                request.AddParameter("application/x-www-form-urlencoded", $"api_key=8w4Bh2csOiB0oh9A8yZM&name={subscribeEmailToSendyRequest.FirstName + ' ' + subscribeEmailToSendyRequest.LastName}&email={subscribeEmailToSendyRequest.Email}&list=6pu2FjJqsvIpmqINM892GwTg&boolean=true", ParameterType.RequestBody);

                IRestResponse response = client.Execute(request);
                var reponseContent = response.Content;

                NotificationHelper.SendEmail(subscription.Email, emailBody, "Welcome to Osmos-Ish", true);
            }
            else
            {
                _MainResponse.Message = ErrorMessages.EMAIL_ALREADY_SUBSCRIBED;
                _MainResponse.Success = false;
            }
            return _MainResponse;
        }

    }
}
