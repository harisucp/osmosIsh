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
using OsmosIsh.Service.Service;
using OsmosIsh.Service.Common;

namespace OsmosIsh.Web.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
     [Authorize]
    public class PaymentAPIController : ControllerBase
    {
        #region readonly
        private IPaymentService _PaymentService;
        #endregion
        #region private
        private MainResponse _MainResponse;
        private string _JsonString = string.Empty;
        #endregion

        public PaymentAPIController(IPaymentService PaymentService)
        {
            _PaymentService = PaymentService;
            _MainResponse = new MainResponse();
        }


        /// <summary>
        /// This API is used to Create Payment.
        /// </summary>
        /// <param name="paymentRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("Pay")]
        [ActionName("Pay")]
        public async Task<ActionResult> Pay(PaymentRequest paymentRequest)
        {
            try
            {
                var studentId = paymentRequest.StudentId;
                var enrollments = paymentRequest.Enrollments;
                _MainResponse = await _PaymentService.ValidateEnrollmentDetails(paymentRequest);

                if (_MainResponse.Success)
                {
                    var a = _PaymentService.GetUserRequest(paymentRequest);
                    var transactionId = a.Result.TransactionResponse.TransactionId;
                    //if (transactionId > 0)
                    // Transactions, TransactionItems
                    // TODO: Entry tranasaction table e.g. transactionId = 1
                    // Need to have store paymentId & PayerId after payment get authorized
                    // 0 => Pending, 1 => Final 2 => Cancelled
                    // ItemsCount, Subtotal, CharityAmount, TotalServiceCharge, Total

                    // TODO: Handling of real data
                    if (paymentRequest.Amount > 0)
                    {

                        var transactions = GetTransactionsList(transactionId, paymentRequest.Amount, paymentRequest.Charity, paymentRequest.SubTotal);
                        var createdPayment = PaypalHelper.CreatePayment(transactions, "authorize", GetReturnUrls(transactionId)); // pass transactionid in getreturnurls

                        //var a = _PaymentService.GetUserRequest(paymentRequest.StudentId, paymentRequest.Enrollments);
                        // Return approval url (Paypal url) to client
                        // Open that url in window popup
                        _MainResponse.Message = createdPayment.GetApprovalUrl();
                    }
                    else
                    {
                        //var couponCodeService = new CouponCodeService();
                        //couponCodeService.InserUpdateUserCouponLog(paymentRequest.UserCouponLogId, paymentRequest.CouponId, "");
                        await _PaymentService.UpdateTransactionsAfterPayment(transactionId, null, null);
                        //return AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/PagePaymentSuccess";
                        _MainResponse.Message = AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/PagePaymentSuccess";
                    }
                }
                _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
                return new OkObjectResult(_JsonString);
            }
            catch (Exception ex)
            {
                return new OkObjectResult(ex.Message);
            }
        }

        [HttpGet]
        [Route("AuthorizeSuccessful")]
        [ActionName("AuthorizeSuccessful")]
        public async Task<ContentResult> AuthorizeSuccessful(int transactionId, string paymentId, string token, string PayerID)
        {
            // TODO: Handling of amount (Might be from db based)
            // Get Details from transactionId
            var amountPay = _PaymentService.GetTransactionAmount(transactionId);
            // Capture Payment
            var amount = new Amount()
            {
                currency = "USD",
                total = amountPay.Result.ToString()
            };

            var capture = PaypalHelper.CapturePayment(paymentId, PayerID, amount);
            var json = Newtonsoft.Json.JsonConvert.SerializeObject(capture);
            // Update Transaction
            // PaymentId, PayerId, Payment flag = Y, Stauts = Final
            // Enrollments table transactionId
            var result = await _PaymentService.UpdateTransactionsAfterPayment(transactionId, capture, PayerID);
            // TODO: Redirect to react application at final confirmation page 

           // return Redirect(AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/PagePaymentSuccess");
            if ("completed".Equals(capture.State.ToLower()) && result.Success)
            {
                return Content("true");
            }
            else
            {
                return Content("false");
            }
            //return Redirect("http://localhost:3000/PagePaymentSuccess");
        }

        [HttpGet]
        [Route("PaymentCancelled")]
        [ActionName("PaymentCancelled")]
        public IActionResult PaymentCancelled()
        {
            // TODO: Handle cancelled payment
            // Update Transaction
            // status - fail
            // enrollment Payment flag = Y, Stauts = Final
            return Redirect(AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/PageFailedPayment");
            //return Redirect("http://localhost:3000/PageFailedPayment");
        }

        private List<Transaction> GetTransactionsList(int transactionId, decimal amount, decimal charity, decimal subtotal)
        {
            var transactionDetailList = _PaymentService.GetTransactionList(transactionId);
            var transactionList = new List<Transaction>();
            var items = new List<Item>();
            foreach (var transaction in transactionDetailList.Result.transactionDataResponse)
            {
                items.Add(new Item()
                {
                    name = transaction.Title,
                    currency = "USD",
                    price = transaction.DiscountedFee.ToString(),
                    quantity = "1",
                    sku = transaction.Type
                });
            }
            // The Payment creation API requires a list of Transaction; 
            // add the created Transaction to a List
            transactionList.Add(new Transaction()
            {
                description = "Transaction description.",
                amount = new Amount()
                {
                    currency = "USD",
                    total = amount.ToString(),
                },

                item_list = new ItemList()
                { items = items }

            });
            return transactionList;
        }

        private RedirectUrls GetReturnUrls(int transactionId)
        {
            var baseUrl = GetBaseUrl();
            var returnUrl = $"/VerifyPayment?transactionId={transactionId}";

            // Redirect URLS
            // These URLs will determine how the user is redirected from PayPal 
            // once they have either approved or canceled the payment.
            return new RedirectUrls()
            {
                cancel_url = baseUrl + "/PaymentCancelled",
                return_url = baseUrl + returnUrl
            };
        }

        private string GetBaseUrl()
        {
            //return Request.Scheme + "://" + Request.Host + "/" + ControllerContext.ActionDescriptor.ControllerName;
            //return AppSettingConfigurations.AppSettings.APIApplicationUrl + "/PaymentAPI";
            return AppSettingConfigurations.AppSettings.ReactAppliactionUrl;

        }

        /// <summary>
        /// This API is used to process refund of student.
        /// </summary>
        /// <param name="cancelStudentClassRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("ProcessStudentRefund")]
        [ActionName("ProcessStudentRefund")]
        public async Task<ActionResult> ProcessStudentRefund(CancelStudentClassRequest cancelStudentClassRequest)
        {
            CancelledSeriesSessionPayoutObject payoutObject = new CancelledSeriesSessionPayoutObject();
            var payout = new Payout();

            // Only for cancellation without dispute
            var refundDetailResult = _PaymentService.GetRefundDetail(cancelStudentClassRequest);
            // get detail of captured payment and amount to refund from application database
            if (refundDetailResult.Result.RefundDataResponse.Count > 0 && refundDetailResult.Result.RefundDataResponse[0].RefundAmount >= 1)
            {
                APIContext apiContext = PaypalConfiguration.GetAPIContext();
                string captureId = refundDetailResult.Result.RefundDataResponse[0].CaptureId;
                Double refundAmount = Convert.ToDouble(refundDetailResult.Result.RefundDataResponse[0].RefundAmount);
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
                //Update response in application database
                if (refunded.state == "completed" || refunded.state == "pending")
                {
                    var result = await _PaymentService.UpdateRefundtransaction(captureId, Convert.ToString(refunded.amount.total), refunded.id, Convert.ToDateTime(refunded.create_time), Convert.ToDateTime(refunded.update_time), refundDetailResult.Result.RefundDataResponse[0].EnrollmentId, refunded.state, cancelStudentClassRequest.SessionId, cancelStudentClassRequest.SeriesId);
                    _MainResponse.Success = true;
                    _MainResponse.Message = "You have cancelled your session successfully.";
                }
            }
            else
            {
                var result = await _PaymentService.UpdateRefundtransaction(refundDetailResult.Result.RefundDataResponse[0].CaptureId, Convert.ToString(0), null, DateTime.UtcNow, DateTime.UtcNow, refundDetailResult.Result.RefundDataResponse[0].EnrollmentId, null, cancelStudentClassRequest.SessionId, cancelStudentClassRequest.SeriesId);
                _MainResponse.Success = true;
                _MainResponse.Message = "Your cancellation has been submitted. Since the class begins within 24 hours or the refund amount is less than $1, so as per our terms and conditions you are not eligible for a refund.";
            }

            var tutorPaypalDetail = _PaymentService.getTutorPayoutPaypalDetail(cancelStudentClassRequest);
            if (tutorPaypalDetail.Result.RefundPayoutDataResponse.Count > 0)
            {
                foreach (var info in tutorPaypalDetail.Result.RefundPayoutDataResponse)
                {
                    APIContext apiContext1 = PaypalConfiguration.GetAPIContext();
                    payoutObject.SessionId = info.SessionId;
                    payoutObject.StudentId = cancelStudentClassRequest.StudentId;
                    payoutObject.TeacherId = info.TeacherId;
                    if (info.RefundAmount > 0)
                    {
                        payout.sender_batch_header = new PayoutSenderBatchHeader();
                        payout.sender_batch_header.sender_batch_id = "batch_" + System.Guid.NewGuid().ToString().Substring(0, 8);
                        //payout.sender_batch_header.email_subject = "Payment Processed. Request Id= " + request.Id;
                        payout.items = new List<PayoutItem>();


                        // Create payout items object  and in amount we need to add condition of service fee and others to calculate amount
                        var paymentItem = new PayoutItem();
                        var shareramount = new Currency();
                        var _sTutorCost = Convert.ToDouble(info.RefundAmount);
                        _sTutorCost = Math.Round((Double)_sTutorCost, 2);
                        shareramount.value = Convert.ToString(_sTutorCost);
                        shareramount.currency = "USD";
                        paymentItem.amount = shareramount;

                        if (info.PaypalAccountType == "email")
                        {
                            paymentItem.recipient_type = PayoutRecipientType.EMAIL;
                            /* shareritem.receiver = SharerPaypalDetail.PaypalBusinessEmail*/
                            //sharer Paypal email id
                            paymentItem.receiver = info.PaypalAccount;
                        }
                        else
                        {
                            paymentItem.recipient_type = PayoutRecipientType.PHONE;
                            paymentItem.receiver = info.PaypalAccount;//sharer Paypal phone number
                        }
                        //shareritem.note = "Payment To Sharer Account. Request Id " + request.Id;
                        paymentItem.note = "Payment To Tutor Account. " + cancelStudentClassRequest.SessionId;
                        paymentItem.sender_item_id = System.Guid.NewGuid().ToString();

                        payout.items.Add(paymentItem);
                        // Create payout
                        var createdPayout = payout.Create(apiContext1, false);
                        var payoutDetail = Payout.Get(apiContext1, createdPayout.batch_header.payout_batch_id);

                        payoutObject.payout_batch_id = payoutDetail.batch_header.payout_batch_id;
                        payoutObject.sender_batch_id = payoutDetail.batch_header.sender_batch_header.sender_batch_id;
                        payoutObject.amount = payoutDetail.batch_header.amount.value;
                        payoutObject.fee = payoutDetail.batch_header.fees.value;
                        payoutObject.time_created = payoutDetail.batch_header.time_created;
                        payoutObject.time_completed = payoutDetail.batch_header.time_completed;
                        payoutObject.errors = Convert.ToString(payoutDetail.batch_header.errors);
                        payoutObject.PaypalAccount = info.PaypalAccount;
                        payoutObject.PaypalAccountType = info.PaypalAccountType;
                        payoutObject.TutorAffiliatePayBack = info.TutorAffiliatePayBack;
                        payoutObject.AffiliateShare = info.AffiliateShare;
                        payoutObject.SessionFee = info.SessionFee;
                        payoutObject.ServiceFee = info.ServiceFee;
                        payoutObject.PayoutType = "Cancellation Payout";
                    }
                    //	update the status in DB)
                    await _PaymentService.UpdatecancelledSeriesSessionPayoutDetail(payoutObject);
                }
                //  _MainResponse.Message = "You cannont cancel this session as the time diffrence is less than 24 hours.";
            }
            else
            {
                await _PaymentService.SendTutorNoAmountTemplateSessionCancelledByTutor(cancelStudentClassRequest);
            }

            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
        /// <summary>
        /// This API is used to process tutor refund.
        /// </summary>
        /// <param name="tutorCancelClassRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("ProcessTutorCancellationRefund")]
        [ActionName("ProcessTutorCancellationRefund")]
        public async Task<ActionResult> ProcessTutorCancellationRefund(TutorCancelClassRequest tutorCancelClassRequest)
        {
            // Only for cancellation without dispute
            var refundDetailResult = _PaymentService.GetTutorCancelledRefundDetail(tutorCancelClassRequest);
            // get detail of captured payment and amount to refund from application database
            if (refundDetailResult.Result.TutorCancelledRefundDataResponse.Count > 0)
            {
                foreach (var name in refundDetailResult.Result.TutorCancelledRefundDataResponse)
                {
                    var refunded = new Refund();
                    if (name.RefundAmount >= 1)
                    {
                        APIContext apiContext = PaypalConfiguration.GetAPIContext();
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
                        refunded = capture.Refund(apiContext, refund);
                        //Update response in application database
                        if (refunded.state == "completed")
                        {
                            var result = await _PaymentService.UpdateRefundDetailsOnTutorCancellation(refunded.capture_id, Convert.ToString(refunded.amount.total), refunded.id, Convert.ToDateTime(refunded.create_time), Convert.ToDateTime(refunded.update_time), name.EnrollmentId, refunded.state, tutorCancelClassRequest.SessionId, tutorCancelClassRequest.SeriesId, -1);
                            if (name.Type == "Series")
                            {
                                var resultCancelledSeries = await _PaymentService.UpdateCancelledSeriesStatus(name.RefrenceId, tutorCancelClassRequest.ActionPerformedBy);
                            }
                            else
                            {
                                var resultCancelledSession = await _PaymentService.UpdateCancelledSessionStatus(name.RefrenceId, tutorCancelClassRequest.ActionPerformedBy);
                            }
                            //_MainResponse.Success = true;
                            //_MainResponse.Message = "You have cancelled your session successfully.";
                        }

                    }
                    else
                    {
                        await _PaymentService.UpdateRefundDetailsOnTutorCancellation(null, name.RefundAmount.ToString(), null, DateTime.UtcNow, DateTime.UtcNow, name.EnrollmentId, "completed", tutorCancelClassRequest.SessionId, tutorCancelClassRequest.SeriesId, name.TransactionId);
                        if (name.Type == "Series")
                        {
                            var resultCancelledSeries = await _PaymentService.UpdateCancelledSeriesStatus(name.RefrenceId, tutorCancelClassRequest.ActionPerformedBy);
                        }
                        else
                        {
                            var resultCancelledSession = await _PaymentService.UpdateCancelledSessionStatus(name.RefrenceId, tutorCancelClassRequest.ActionPerformedBy);
                        }
                    }
                    #region Send Email
                    var emailBody = "";
                    var couponCodeService = new CouponCodeService();
                    emailBody = couponCodeService.GetTemplateFromHtml_CouponCode("CancelledSessionByTutor.html", name.Email);
                    //emailBody = CommonFunction.GetTemplateFromHtml("CancelledSessionByTutor.html");
                    if (name.RefundAmount >= 1)
                    {
                        emailBody = emailBody.Replace("{Refund}", "<p style='color:#575f62;font-family:'Lato',sans-serif;font-size:15px;line-height:19px;margin-top:0;margin-bottom:20px;padding:0;font-weight:normal'><strong> Refund ID:</strong>" + refunded.id + "</p>");
                    }
                    else
                    {
                        emailBody = emailBody.Replace("{Refund}", "");
                    }
                    emailBody = emailBody.Replace("{StudentName}", Convert.ToString(name.UserName));
                    emailBody = emailBody.Replace("{ClassName}", Convert.ToString(name.Title));
                    emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/CourseSearch");

                    NotificationHelper.SendEmail(name.Email, emailBody, "Your Session Has Been Cancelled", true);
                    #endregion
                }
                _MainResponse.Success = true;
                _MainResponse.Message = "You have cancelled your series/session successfully.";

            }
            else
            {
                if (tutorCancelClassRequest.SeriesId > 0)
                {
                    var resultCancelledSeries = await _PaymentService.UpdateCancelledSeriesStatus(tutorCancelClassRequest.SeriesId, tutorCancelClassRequest.ActionPerformedBy);
                }
                else
                {
                    var resultCancelledSession = await _PaymentService.UpdateCancelledSessionStatus(tutorCancelClassRequest.SessionId, tutorCancelClassRequest.ActionPerformedBy);
                }
                _MainResponse.Message = "Cancellation processed successfully.";
            }


            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }


        [HttpPost]
        [Route("ManualPayout")]
        [ActionName("ManualPayout")]
        public async Task<ActionResult> ManualPayout(ManualPaymentRequest manualPaymentRequest)
        {
            var paymentPorcess = new PaymentProcessService();
            await paymentPorcess.ManualUpdatePayoutDetail(manualPaymentRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
    }
}