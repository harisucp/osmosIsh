using Newtonsoft.Json;
using OsmosIsh.Core.DTOs.Request;
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
    public class ProcessAffiliate : IJob
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
                CronJobAffilaitePayoutObject payoutObject = new CronJobAffilaitePayoutObject();
                // Payout for tutor for sessions without dispute

                var getAffiliatePayoutResult = PaymentPorcess.GetAffiliateList();

                var apiContext = PaypalConfiguration.GetAPIContext();
                if (getAffiliatePayoutResult.Count > 0 && getAffiliatePayoutResult != null)
                {
                    foreach (var affiliate in getAffiliatePayoutResult)
                    {
                        try
                        {
                            if (affiliate.TotalAffiliateShare >= 1)
                            {
                                var payout = new Payout();
                                payout.sender_batch_header = new PayoutSenderBatchHeader();
                                payout.sender_batch_header.sender_batch_id = "batch_" + System.Guid.NewGuid().ToString().Substring(0, 8);
                                payout.items = new List<PayoutItem>();

                                // Create payout items object  and in amount we need to add condition of service fee and others to calculate amount
                                var paymentItem = new PayoutItem();
                                var shareramount = new Currency();
                                var _sTutorCost = Convert.ToDouble(affiliate.TotalAffiliateShare);
                                _sTutorCost = Math.Round((Double)_sTutorCost, 2);
                                //shareramount.value = Convert.ToString();
                                shareramount.value = Convert.ToString(_sTutorCost);
                                shareramount.currency = "USD";
                                paymentItem.amount = shareramount;

                                if (affiliate.AffiliatePaypalAccountType == "email")
                                {
                                    paymentItem.recipient_type = PayoutRecipientType.EMAIL;
                                    /* shareritem.receiver = SharerPaypalDetail.PaypalBusinessEmail*/
                                    //sharer Paypal email id
                                    paymentItem.receiver = affiliate.AffiliatePaypalAccount;
                                }
                                else
                                {
                                    paymentItem.recipient_type = PayoutRecipientType.PHONE;
                                    paymentItem.receiver = affiliate.AffiliatePaypalAccount;//sharer Paypal phone number
                                }
                                //shareritem.note = "Payment To Sharer Account. Request Id " + request.Id;
                                paymentItem.note = "Payment To Affiliate Account. " + affiliate.AffiliatePaypalAccount;
                                paymentItem.sender_item_id = System.Guid.NewGuid().ToString();
                                payout.items.Add(paymentItem);

                                // Create payout
                                var createdPayout = payout.Create(apiContext, false);
                                var payoutDetail = Payout.Get(apiContext, createdPayout.batch_header.payout_batch_id);
                                payoutObject.payout_batch_id = payoutDetail.batch_header.payout_batch_id;
                                payoutObject.sender_batch_id = payoutDetail.batch_header.sender_batch_header.sender_batch_id;
                                payoutObject.Amount = payoutDetail.batch_header.amount.value;
                                payoutObject.Fee = payoutDetail.batch_header.fees.value;
                                payoutObject.Time_created = payoutDetail.batch_header.time_created;
                                payoutObject.Time_completed = payoutDetail.batch_header.time_completed;
                                payoutObject.Errors = Convert.ToString(payoutDetail.batch_header.errors);
                                payoutObject.PaypalAccount = affiliate.AffiliatePaypalAccount;
                                payoutObject.PaypalAccountType = affiliate.AffiliatePaypalAccountType;

                                await PaymentPorcess.UpdateAffiliatePayoutDetail(payoutObject, affiliate);
                            }
                        }
                        catch (Exception exception)
                        {
                            PaymentPorcess.LogExceptionInDB(exception, "ProcessAffiliate");
                        }
                    }
                }
            }
            catch (Exception exception)
            {
                PaymentPorcess.LogExceptionInDB(exception, "ProcessAffiliate");
            }
        }
    }
}




