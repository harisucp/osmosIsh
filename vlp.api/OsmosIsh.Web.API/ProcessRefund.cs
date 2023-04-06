using Newtonsoft.Json;
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
using System.Threading.Tasks;

namespace OsmosIsh.Web.API
{
    public class ProcessRefund : IJob
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
                TutorMissedSessionRefundResponse tutorMissedSessionRefundResponse = new TutorMissedSessionRefundResponse();
                PayoutObject payoutObject = new PayoutObject();
                // Payout for tutor for sessions without dispute
                var getStudentRefundResult = PaymentPorcess.GetTutorMissedSessionRefundDetail();

                if (getStudentRefundResult.Count > 0 && getStudentRefundResult != null)
                {
                    foreach (var name in getStudentRefundResult)
                    {
                        try
                        {
                            if (name.RefundAmount > 0 )
                            {
                                var apiContext = PaypalConfiguration.GetAPIContext();
                                string captureId = name.CaptureId;
                                Double refundAmount = Convert.ToDouble(name.RefundAmount);
                                PayPal.Api.Capture capture = PayPal.Api.Capture.Get(apiContext, captureId);
                                Amount amount = new Amount();
                                var _refundedAmount = refundAmount;
                                _refundedAmount = Math.Round((Double)_refundedAmount, 2);
                                amount.currency = "USD";
                                amount.total = Convert.ToString(_refundedAmount);
                                Refund refund = new Refund
                                {
                                    amount = amount
                                };

                                var refunded = capture.Refund(apiContext, refund);

                                var apiContextJSON = JsonConvert.SerializeObject(apiContext);
                                var CaptureJSON = JsonConvert.SerializeObject(capture);
                                var RefundJSON = JsonConvert.SerializeObject(refund);
                                var ResponseRefundedJSON = JsonConvert.SerializeObject(refunded);

                                tutorMissedSessionRefundResponse.CaptureId = name.CaptureId;
                                tutorMissedSessionRefundResponse.RefundedAmount = refunded.amount.total;
                                tutorMissedSessionRefundResponse.RefundId = refunded.id;
                                tutorMissedSessionRefundResponse.create_time = Convert.ToDateTime(refunded.create_time);
                                tutorMissedSessionRefundResponse.update_time = Convert.ToDateTime(refunded.update_time);
                                tutorMissedSessionRefundResponse.EnrollmentId = name.EnrollmentId;
                                tutorMissedSessionRefundResponse.state = refunded.state;
                                tutorMissedSessionRefundResponse.SessionId = name.SessionId;

                            }
                            else
                            {
                                tutorMissedSessionRefundResponse.CaptureId = name.CaptureId;
                                tutorMissedSessionRefundResponse.RefundedAmount = Convert.ToString(name.RefundAmount);
                                tutorMissedSessionRefundResponse.RefundId = null;
                                tutorMissedSessionRefundResponse.create_time = DateTime.UtcNow;
                                tutorMissedSessionRefundResponse.update_time = DateTime.UtcNow;
                                tutorMissedSessionRefundResponse.EnrollmentId = name.EnrollmentId;
                                tutorMissedSessionRefundResponse.state = null;
                                tutorMissedSessionRefundResponse.SessionId = name.SessionId;
                            }
                            await PaymentPorcess.UpdateTutorMissedSessionRefundtransaction(tutorMissedSessionRefundResponse);
                        }
                        catch (Exception exception)
                        {
                            PaymentPorcess.LogExceptionInDB(exception, "ProcessRefund");
                        }
                    }
                }
            }
            catch (Exception exception)
            {
                PaymentPorcess.LogExceptionInDB(exception, "ProcessRefund");
            }
        }
    }
}
