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
    public class ProcessPayment : IJob
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
                CronJobPayoutObject payoutObject = new CronJobPayoutObject();
                // Payout for tutor for sessions without dispute
                var getTeacherPayoutResult = PaymentPorcess.GetTeacherPayoutList();

                var apiContext = PaypalConfiguration.GetAPIContext();
                if (getTeacherPayoutResult.Count > 0 && getTeacherPayoutResult != null)
                {
                    foreach (var name in getTeacherPayoutResult)
                    {
                        try
                        {
                            if (name.PayAmount >= 1)
                            {
                                var payout = new Payout();
                                payout.sender_batch_header = new PayoutSenderBatchHeader();
                                payout.sender_batch_header.sender_batch_id = "batch_" + System.Guid.NewGuid().ToString().Substring(0, 8);
                                //payout.sender_batch_header.email_subject = "Payment Processed. Request Id= " + request.Id;
                                payout.items = new List<PayoutItem>();


                                // Create payout items object  and in amount we need to add condition of service fee and others to calculate amount
                                var paymentItem = new PayoutItem();
                                var shareramount = new Currency();
                                var _sTutorCost = Convert.ToDouble(name.PayAmount);
                                _sTutorCost = Math.Round((Double)_sTutorCost, 2);
                                //shareramount.value = Convert.ToString();
                                shareramount.value = Convert.ToString(_sTutorCost);
                                shareramount.currency = "USD";
                                paymentItem.amount = shareramount;

                                if (name.PaypalAccountType == "email")
                                {
                                    paymentItem.recipient_type = PayoutRecipientType.EMAIL;
                                    /* shareritem.receiver = SharerPaypalDetail.PaypalBusinessEmail*/
                                    //sharer Paypal email id
                                    paymentItem.receiver = name.PaypalAccount;
                                }
                                else
                                {
                                    paymentItem.recipient_type = PayoutRecipientType.PHONE;
                                    paymentItem.receiver = name.PaypalAccount;//sharer Paypal phone number
                                }
                                //shareritem.note = "Payment To Sharer Account. Request Id " + request.Id;
                                paymentItem.note = "Payment To Tutor Account. " + name.SessionId;
                                paymentItem.sender_item_id = System.Guid.NewGuid().ToString();

                                payout.items.Add(paymentItem);

                                // Create payout	

                                var createdPayout = payout.Create(apiContext, false);
                                var payoutDetail = Payout.Get(apiContext, createdPayout.batch_header.payout_batch_id);

                                var APIContextJSON = JsonConvert.SerializeObject(apiContext);
                                var PayoutJSON = JsonConvert.SerializeObject(payout);
                                var CreatedPayoutJSON = JsonConvert.SerializeObject(createdPayout);
                                var payoutDetailsJSON = JsonConvert.SerializeObject(payoutDetail);


                                payoutObject.payout_batch_id = payoutDetail.batch_header.payout_batch_id;
                                payoutObject.sender_batch_id = payoutDetail.batch_header.sender_batch_header.sender_batch_id;
                                payoutObject.amount = payoutDetail.batch_header.amount.value;
                                payoutObject.fee = payoutDetail.batch_header.fees.value;
                                payoutObject.time_created = payoutDetail.batch_header.time_created;
                                payoutObject.time_completed = payoutDetail.batch_header.time_completed;
                                payoutObject.errors = Convert.ToString(payoutDetail.batch_header.errors);
                                payoutObject.SessionId = name.SessionId;
                                payoutObject.StudentId = name.StudentId;
                                payoutObject.TeacherId = name.TeacherId;
                                payoutObject.TutorAffiliatePayBack = name.TutorAffiliatePayBack;
                                payoutObject.PaypalAccount = name.PaypalAccount;
                                payoutObject.PaypalAccountType = name.PaypalAccountType;
                                payoutObject.AffiliateShare = name.AffiliateShare;
                                payoutObject.SessionFee = name.SessionPrice;
                                payoutObject.ServiceFee = name.ServiceFee;
                                payoutObject.NumberOfStudentsEnrolled = name.NumberOfStudentsEnrolled;
                                payoutObject.PayoutType = "Normal Payout";
                                #region SendEmail
                                var emailBody = "";
                                emailBody = CommonFunction.GetTemplateFromHtml("ReceiptTutor.html");
                                emailBody = emailBody.Replace("{SessionId}", Convert.ToString(name.SessionId));
                                emailBody = emailBody.Replace("{TeacherRecievingDate}", Convert.ToDateTime(payoutObject.time_created).ToString("MM/dd/yyyy"));
                                emailBody = emailBody.Replace("{SessionPrice}", Convert.ToString(name.SessionPrice));
                                emailBody = emailBody.Replace("{ServiceFee}", Convert.ToString(name.ServiceFee));
                                emailBody = emailBody.Replace("{SessionName}", Convert.ToString(name.Title));
                                emailBody = emailBody.Replace("{NumberOfStudentsEnrolled}", Convert.ToString(name.NumberOfStudentsEnrolled));
                                emailBody = emailBody.Replace("{TotalPrice}", Convert.ToString(name.PayAmount));
                                emailBody = emailBody.Replace("{TutorAffiliatePayBack}", Convert.ToString(name.TutorAffiliatePayBack));
                                NotificationHelper.SendEmail(name.Email, emailBody, "Osmos-ish: Review Your Payment Summary", true);

                                #endregion

                                //	update the status in DB)
                                await PaymentPorcess.UpdatePayoutDetails(payoutObject);
                            }
                        }
                        catch (Exception exception)
                        {
                            PaymentPorcess.LogExceptionInDB(exception, "ProcessPayment");
                        }
                    }
                }
            }
            catch (Exception exception)
            {
                PaymentPorcess.LogExceptionInDB(exception, "ProcessPayment");
            }
        }
    }
}
