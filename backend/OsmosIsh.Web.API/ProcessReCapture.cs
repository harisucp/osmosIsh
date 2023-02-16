using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Service.Common;
using OsmosIsh.Service.IService;
using OsmosIsh.Service.Service;
using PayPal.Api;
using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace OsmosIsh.Web.API
{
    public class ProcessReCapture : IJob
    {

        public static class PaypalConfiguration
        {
            private readonly static string ClientId;

            private readonly static string ClientSecret;
            static PaypalConfiguration()
            {
                ClientId = AppSettingConfigurations.PaypalSettings.Settings.clientId;
                ClientSecret = AppSettingConfigurations.PaypalSettings.Settings.clientSecret;
            }

            public static APIContext GetAPIContext()
            {
                APIContext apiContext = new APIContext(GetAccessToken());
                apiContext.Config = GetConfig();
                return apiContext;
            }

            private static Dictionary<string, string> GetConfig()
            {
                return new Dictionary<string, string>()
                {
                    { "connectionTimeout", AppSettingConfigurations.PaypalSettings.Settings.connectionTimeout },
                    { "requestRetries", AppSettingConfigurations.PaypalSettings.Settings.requestRetries },
                    { "mode", AppSettingConfigurations.PaypalSettings.Settings.mode }
                };
            }

            private static string GetAccessToken()
            {
                string accessToken = new OAuthTokenCredential
                (ClientId, ClientSecret, GetConfig()).GetAccessToken();
                return accessToken;
            }
        }

        public async Task Execute(IJobExecutionContext context)
        {
            PaymentProcessService PaymentPorcess = new PaymentProcessService();
            try
            {
                PayoutObject payoutObject = new PayoutObject();
                ReCapturePaypalResponse reCapturePaypalResponse = new ReCapturePaypalResponse();
                // Payout for tutor for sessions without dispute
                var getrecaptureDetailResult = PaymentPorcess.GetReCaptureDetail();


                if (getrecaptureDetailResult.Count > 0)
                {
                    foreach (var info in getrecaptureDetailResult)
                    {
                        try
                        {

                            if (info.AuthorizationId != null)
                            {
                                var apiContext = PaypalConfiguration.GetAPIContext();
                                PayPal.Api.Authorization authorize = PayPal.Api.Authorization.Get(apiContext, info.AuthorizationId);

                                var capture = new Capture()
                                {
                                    amount = new Amount()
                                    {
                                        currency = "USD",
                                        total = info.AmountPaid,
                                    },
                                    is_final_capture = false
                                };

                                var reCapture = authorize.Capture(apiContext, capture);
                                reCapturePaypalResponse.CaptureId = reCapture.id;
                                reCapturePaypalResponse.AuthorizationId = info.AuthorizationId;
                                reCapturePaypalResponse.CaptureCreateTime = Convert.ToDateTime(reCapture.create_time);
                                reCapturePaypalResponse.CaptureUpdateTime = Convert.ToDateTime(reCapture.update_time);
                                await PaymentPorcess.UpdateReCaptureDetails(reCapturePaypalResponse);
                            }

                        }
                        catch (Exception exception)
                        {
                            PaymentPorcess.LogExceptionInDB(exception, "ProcessReCapture");
                        }
                    }
                }
            }
            catch (Exception exception)
            {
                PaymentPorcess.LogExceptionInDB(exception, "ProcessReCapture");
            }
        }
    }
}
