using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Service.IService;
using PayPal.Api;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Authorization;
using log4net.Core;
using Caliburn.Micro;
using OsmosIsh.Web.API.Helpers;

namespace OsmosIsh.Web.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AdminPaymentAPIController : ControllerBase
    {
        #region readonly
        private IPaymentService _PaymentService;
        #endregion

        #region private
        private MainResponse _MainResponse;
        private string _JsonString = string.Empty;
        #endregion

        public AdminPaymentAPIController(IPaymentService PaymentService)
        {
            _PaymentService = PaymentService;
            _MainResponse = new MainResponse();
        }
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

        /// <summary>
        /// This API is used to Create Payment.
        /// </summary>
        /// <param name="AdminDisputedPaymentRequest"></param>
        /// <returns></returns>

        [HttpPost]
        [Route("Resolve")]
        [ActionName("Resolve")]
        public async Task<ActionResult> Resolve(AdminDisputedPaymentRequest adminDisputedPaymentRequest)
        {
            var payout = new Payout();
            DisputeResolvedResponse disputeResolvedResponse = new DisputeResolvedResponse();
            disputeResolvedResponse.DisputeId = adminDisputedPaymentRequest.DisputeId;
            disputeResolvedResponse.SessionId = adminDisputedPaymentRequest.SessionId;
            disputeResolvedResponse.StudentId = adminDisputedPaymentRequest.StudentId;
            disputeResolvedResponse.TeacherId = adminDisputedPaymentRequest.TutorId;
            disputeResolvedResponse.EnrollmentId = adminDisputedPaymentRequest.EnrollmentId;
            disputeResolvedResponse.ActionPerformedBy = adminDisputedPaymentRequest.ActionPerformedBy;


            // Get detail from application database of paypal for student with captureid

            var studentPaypalDetail = _PaymentService.getStudentPaypalDetail(adminDisputedPaymentRequest.StudentId, adminDisputedPaymentRequest.DisputeId, adminDisputedPaymentRequest.SessionId);
            if (studentPaypalDetail.Result.StudentDisputeResponse.Count > 0)
            {
                if (adminDisputedPaymentRequest.StudentAmount > 0)
                {
                    APIContext apiContext = PaypalConfiguration.GetAPIContext();
                    string captureId = studentPaypalDetail.Result.StudentDisputeResponse[0].CaptureId;
                    double refundAmount = Convert.ToDouble(adminDisputedPaymentRequest.StudentAmount);
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

                    disputeResolvedResponse.captureId = refunded.capture_id;
                    disputeResolvedResponse.Amount = refunded.amount.total;
                    disputeResolvedResponse.RefundId = refunded.id;
                    disputeResolvedResponse.CreateTime = Convert.ToDateTime(refunded.create_time);
                    disputeResolvedResponse.UpdateTime = Convert.ToDateTime(refunded.update_time);
                    disputeResolvedResponse.State = refunded.state;
                }
                else
                {
                    disputeResolvedResponse.captureId = studentPaypalDetail.Result.StudentDisputeResponse[0].CaptureId;
                    disputeResolvedResponse.Amount = "0.00";
                    disputeResolvedResponse.CreateTime = DateTime.UtcNow;
                    disputeResolvedResponse.UpdateTime = DateTime.UtcNow;
                }

            }
            var tutorPaypalDetail = _PaymentService.getTutorPaypalDetail(adminDisputedPaymentRequest.TutorId, adminDisputedPaymentRequest.SessionId);
            if (tutorPaypalDetail.Result.TutorDisputeResponse.Count > 0 && adminDisputedPaymentRequest.TutorId > 0)
            {
                if (adminDisputedPaymentRequest.TutorAmount > 0)
                {
                    var getTutorAffiliateShare = await _PaymentService.GetTutorAffiliateShare(adminDisputedPaymentRequest.SessionId);

                    // Add tutor affiliate share
                    adminDisputedPaymentRequest.TutorAmount = adminDisputedPaymentRequest.TutorAmount + Convert.ToDecimal(getTutorAffiliateShare.TutorAffiliateShareResponse.TeacherShare);

                    APIContext apiContext = PaypalConfiguration.GetAPIContext();
                    payout.sender_batch_header = new PayoutSenderBatchHeader();
                    payout.sender_batch_header.sender_batch_id = "batch_" + System.Guid.NewGuid().ToString().Substring(0, 8);
                    //payout.sender_batch_header.email_subject = "Payment Processed. Request Id= " + request.Id;
                    payout.items = new List<PayoutItem>();


                    // Create payout items object  and in amount we need to add condition of service fee and others to calculate amount
                    var paymentItem = new PayoutItem();
                    var shareramount = new Currency();
                    var _sTutorCost = Convert.ToDouble(adminDisputedPaymentRequest.TutorAmount);
                    _sTutorCost = Math.Round((Double)_sTutorCost, 2);
                    //shareramount.value = Convert.ToString();
                    shareramount.value = Convert.ToString(_sTutorCost);
                    shareramount.currency = "USD";
                    paymentItem.amount = shareramount;

                    if (tutorPaypalDetail.Result.TutorDisputeResponse[0].PaypalAccountType == "email")
                    {
                        paymentItem.recipient_type = PayoutRecipientType.EMAIL;
                        /* shareritem.receiver = SharerPaypalDetail.PaypalBusinessEmail*/
                        ;//sharer Paypal email id
                        paymentItem.receiver = tutorPaypalDetail.Result.TutorDisputeResponse[0].PaypalAccount;
                    }
                    else
                    {
                        paymentItem.recipient_type = PayoutRecipientType.PHONE;
                        paymentItem.receiver = tutorPaypalDetail.Result.TutorDisputeResponse[0].PaypalAccount;//sharer Paypal phone number
                    }
                    //shareritem.note = "Payment To Sharer Account. Request Id " + request.Id;
                    paymentItem.note = "Payment To Tutor Account. " + adminDisputedPaymentRequest.SessionId;
                    paymentItem.sender_item_id = System.Guid.NewGuid().ToString();

                    payout.items.Add(paymentItem);
                    // Create payout

                    if (payout.items.Count > 0)
                    {
                        var createdPayout = payout.Create(apiContext, false);
                        var payoutDetail = Payout.Get(apiContext, createdPayout.batch_header.payout_batch_id);

                        disputeResolvedResponse.payout_batch_id = payoutDetail.batch_header.payout_batch_id;
                        disputeResolvedResponse.sender_batch_id = payoutDetail.batch_header.sender_batch_header.sender_batch_id;
                        disputeResolvedResponse.amount = payoutDetail.batch_header.amount.value;
                        disputeResolvedResponse.fee = payoutDetail.batch_header.fees.value;
                        disputeResolvedResponse.batch_status = payoutDetail.batch_header.batch_status;
                        disputeResolvedResponse.time_created = payoutDetail.batch_header.time_created;
                        disputeResolvedResponse.time_completed = payoutDetail.batch_header.time_completed;
                        disputeResolvedResponse.errors = Convert.ToString(payoutDetail.batch_header.errors);
                        disputeResolvedResponse.PaypalAccount = tutorPaypalDetail.Result.TutorDisputeResponse[0].PaypalAccount;
                        disputeResolvedResponse.PaypalAccountType = tutorPaypalDetail.Result.TutorDisputeResponse[0].PaypalAccountType;
                        disputeResolvedResponse.TutorAffiliatePayBack = getTutorAffiliateShare.TutorAffiliateShareResponse.TeacherShare;
                        disputeResolvedResponse.AffiliateShare = getTutorAffiliateShare.TutorAffiliateShareResponse.AffiliateShare;
                        disputeResolvedResponse.SessionFee = getTutorAffiliateShare.TutorAffiliateShareResponse.SessionFee;
                    }
                }
                else
                {
                    disputeResolvedResponse.amount = "0.00";
                    disputeResolvedResponse.time_created = Convert.ToString(DateTime.UtcNow);
                    disputeResolvedResponse.time_completed = Convert.ToString(DateTime.UtcNow);
                }

            }
            //Update response in application database
            //Save data of resolved dispute in database
            // update the status of transactionin database
            var ResolvedDispute = _PaymentService.saveResolvedDisputeDetail(disputeResolvedResponse);

            _MainResponse.Success = true;
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

    }
}