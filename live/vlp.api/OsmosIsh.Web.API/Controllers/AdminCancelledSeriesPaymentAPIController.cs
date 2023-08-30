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
    public class AdminCancelledSeriesPaymentAPIController : ControllerBase
    {
        #region readonly
        private IPaymentService _PaymentService;
        #endregion

        #region private
        private MainResponse _MainResponse;
        private string _JsonString = string.Empty;
        #endregion

        public AdminCancelledSeriesPaymentAPIController(IPaymentService PaymentService)
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
        [Route("ResolveCancelledSeries")]
        [ActionName("ResolveCancelledSeries")]
        public async Task<ActionResult> ResolveCancelledSeries(AdminCancelledPaymentRequest adminCancelledPaymentRequest)
        {
            CancelledSeriesPayoutObject cancelledSeriesPayoutObject = new CancelledSeriesPayoutObject();
            var payout = new Payout();
            APIContext apiContext = PaypalConfiguration.GetAPIContext();
            // Get detail from application database of paypal for student with captureid

            var studentPaypalDetail = _PaymentService.GetAdminCancelledSeriesSpecificStudentPaypalDetail(adminCancelledPaymentRequest.StudentId, adminCancelledPaymentRequest.CancelledSeriesId, adminCancelledPaymentRequest.SeriesId);
            if (studentPaypalDetail.Result.StudentCancelledSeriesResponse.Count > 0)
            {
                if (adminCancelledPaymentRequest.StudentAmount > 0)
                {

                    string captureId = studentPaypalDetail.Result.StudentCancelledSeriesResponse[0].CaptureId;
                    Double refundAmount = Convert.ToDouble(adminCancelledPaymentRequest.StudentAmount);
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

                    var result = await _PaymentService.UpdateCancelledSeriesRefundDetails(captureId, Convert.ToString(refunded.amount.total), refunded.id, Convert.ToDateTime(refunded.create_time), Convert.ToDateTime(refunded.update_time), studentPaypalDetail.Result.StudentCancelledSeriesResponse[0].EnrollmentId, refunded.state, adminCancelledPaymentRequest.CancelledSeriesId);
                }
                else
                {
                    var result = await _PaymentService.UpdateCancelledSeriesRefundDetails(studentPaypalDetail.Result.StudentCancelledSeriesResponse[0].CaptureId, Convert.ToString(0), null, DateTime.UtcNow, DateTime.UtcNow, studentPaypalDetail.Result.StudentCancelledSeriesResponse[0].EnrollmentId, null, adminCancelledPaymentRequest.CancelledSeriesId);
                }
            }


            var tutorPaypalDetail = _PaymentService.GetCancelledSeriesTutorPaypalDetail(adminCancelledPaymentRequest.TutorId);
            if (tutorPaypalDetail.Result.TutorDisputeResponse.Count > 0)
            {
                cancelledSeriesPayoutObject.CancelledSeriesId = adminCancelledPaymentRequest.CancelledSeriesId;
                cancelledSeriesPayoutObject.SeriesId = adminCancelledPaymentRequest.SeriesId;
                cancelledSeriesPayoutObject.StudentId = adminCancelledPaymentRequest.StudentId;
                cancelledSeriesPayoutObject.TeacherId = adminCancelledPaymentRequest.TutorId;
                cancelledSeriesPayoutObject.StudentShare = adminCancelledPaymentRequest.StudentAmount;

                if (adminCancelledPaymentRequest.TutorAmount > 0)
                {
                    payout.sender_batch_header = new PayoutSenderBatchHeader();
                    payout.sender_batch_header.sender_batch_id = "batch_" + System.Guid.NewGuid().ToString().Substring(0, 8);
                    //payout.sender_batch_header.email_subject = "Payment Processed. Request Id= " + request.Id;
                    payout.items = new List<PayoutItem>();


                    // Create payout items object  and in amount we need to add condition of service fee and others to calculate amount
                    var paymentItem = new PayoutItem();
                    var shareramount = new Currency();
                    var _sTutorCost = Convert.ToDouble(adminCancelledPaymentRequest.TutorAmount);
                    _sTutorCost = Math.Round((Double)_sTutorCost, 2);
                    shareramount.value = Convert.ToString(_sTutorCost);
                    shareramount.currency = "USD";
                    paymentItem.amount = shareramount;

                    if (tutorPaypalDetail.Result.TutorDisputeResponse[0].PaypalAccountType == "email")
                    {
                        paymentItem.recipient_type = PayoutRecipientType.EMAIL;
                        /* shareritem.receiver = SharerPaypalDetail.PaypalBusinessEmail*/
                        //sharer Paypal email id
                        paymentItem.receiver = tutorPaypalDetail.Result.TutorDisputeResponse[0].PaypalAccount;
                    }
                    else
                    {
                        paymentItem.recipient_type = PayoutRecipientType.PHONE;
                        paymentItem.receiver = tutorPaypalDetail.Result.TutorDisputeResponse[0].PaypalAccount;//sharer Paypal phone number
                    }
                    //shareritem.note = "Payment To Sharer Account. Request Id " + request.Id;
                    paymentItem.note = "Payment To Tutor Account. " + adminCancelledPaymentRequest.SeriesId;
                    paymentItem.sender_item_id = System.Guid.NewGuid().ToString();

                    payout.items.Add(paymentItem);
                    // Create payout
                    var createdPayout = payout.Create(apiContext, false);
                    var payoutDetail = Payout.Get(apiContext, createdPayout.batch_header.payout_batch_id);

                    cancelledSeriesPayoutObject.payout_batch_id = payoutDetail.batch_header.payout_batch_id;
                    cancelledSeriesPayoutObject.sender_batch_id = payoutDetail.batch_header.sender_batch_header.sender_batch_id;
                    cancelledSeriesPayoutObject.amount = payoutDetail.batch_header.amount.value;
                    cancelledSeriesPayoutObject.fee = payoutDetail.batch_header.fees.value;
                    cancelledSeriesPayoutObject.time_created = payoutDetail.batch_header.time_created;
                    cancelledSeriesPayoutObject.time_completed = payoutDetail.batch_header.time_completed;
                    cancelledSeriesPayoutObject.errors = Convert.ToString(payoutDetail.batch_header.errors);
                }
            }
            //	update the status in DB)
            await _PaymentService.UpdatecancelledSeriesPayoutDetail(cancelledSeriesPayoutObject);

            _MainResponse.Success = true;

            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

    }
}