using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Repository.Common;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.Common
{
    public class PaymentProcessService
    {
        PaymentProcessRepository _PaymentProcessRepository;
        public List<TutorPayoutDetail> GetTeacherPayoutList()
        {
            _PaymentProcessRepository = new PaymentProcessRepository();
            return _PaymentProcessRepository.GetTeacherPayoutList();
        }
        public List<TutorMissedSessionRefundDetail> GetTutorMissedSessionRefundDetail()
        {
            _PaymentProcessRepository = new PaymentProcessRepository();
            return _PaymentProcessRepository.GetTutorMissedSessionRefundDetail();
        }
        public void LogExceptionInDB(Exception exception, string croneJobName)
        {
            _PaymentProcessRepository = new PaymentProcessRepository();
            _PaymentProcessRepository.LogExceptionInDB(exception, croneJobName);
        }
        public async Task UpdatePayoutDetails(CronJobPayoutObject payoutObject)
        {
            _PaymentProcessRepository = new PaymentProcessRepository();
            await _PaymentProcessRepository.UpdatePayoutDetails(payoutObject);
        }
        public async Task UpdateTutorMissedSessionRefundtransaction(TutorMissedSessionRefundResponse tutorMissedSessionRefundResponse)
        {
            _PaymentProcessRepository = new PaymentProcessRepository();
            await _PaymentProcessRepository.UpdateTutorMissedSessionRefundtransaction(tutorMissedSessionRefundResponse);
        }
        public List<ReCaptureDetail> GetReCaptureDetail()
        {
            _PaymentProcessRepository = new PaymentProcessRepository();
            return _PaymentProcessRepository.GetReCaptureDetail();
        }

        public async Task UpdateReCaptureDetails(ReCapturePaypalResponse reCapturePaypalResponse)
        {
            _PaymentProcessRepository = new PaymentProcessRepository();
            await _PaymentProcessRepository.UpdateReCaptureDetails(reCapturePaypalResponse);
        }

        // Session Reminders
        public List<ReminderTutorDetail> GetSessionReminderTutorDetail()
        {
            _PaymentProcessRepository = new PaymentProcessRepository();
            return _PaymentProcessRepository.GetSessionReminderTutorDetail();
        }
        public List<ReminderStudentDetail> GetSessionReminderStudentDetail()
        {
            _PaymentProcessRepository = new PaymentProcessRepository();
            return _PaymentProcessRepository.GetSessionReminderStudentDetail();
        }

        public List<AffiliatePayoutDetail> GetAffiliateList()
        {
            _PaymentProcessRepository = new PaymentProcessRepository();
            return _PaymentProcessRepository.GetAffiliateList();
        }
        public async Task UpdateAffiliatePayoutDetail(CronJobAffilaitePayoutObject payoutObject, AffiliatePayoutDetail affiliatePayoutDetail)
        {
            _PaymentProcessRepository = new PaymentProcessRepository();
            await _PaymentProcessRepository.UpdateAffiliatePayoutDetail(payoutObject, affiliatePayoutDetail);
        }


        //UpdatePayoutDetails
        public async Task ManualUpdatePayoutDetail(ManualPaymentRequest manualPaymentRequest)
        {
            _PaymentProcessRepository = new PaymentProcessRepository();
            PaymentProcessService paymentPorcess = new PaymentProcessService();

            #region SendEmail
            var emailBody = "";
            emailBody = CommonFunction.GetTemplateFromHtml("ReceiptTutor.html");
            emailBody = emailBody.Replace("{SessionId}", Convert.ToString(manualPaymentRequest.SessionId));
            emailBody = emailBody.Replace("{TeacherRecievingDate}", Convert.ToDateTime(manualPaymentRequest.DateTimePaymentSent).ToString("MM/dd/yyyy"));
            emailBody = emailBody.Replace("{SessionPrice}", Convert.ToString(manualPaymentRequest.SessionPrice));
            emailBody = emailBody.Replace("{ServiceFee}", Convert.ToString(manualPaymentRequest.ServiceFee));
            emailBody = emailBody.Replace("{SessionName}", Convert.ToString(manualPaymentRequest.Title));
            emailBody = emailBody.Replace("{NumberOfStudentsEnrolled}", Convert.ToString(manualPaymentRequest.NumberOfStudentsEnrolled));
            emailBody = emailBody.Replace("{TotalPrice}", Convert.ToString(manualPaymentRequest.PayAmount));
            emailBody = emailBody.Replace("{TutorAffiliatePayBack}", Convert.ToString(manualPaymentRequest.TutorAffiliatePayBack));
            NotificationHelper.SendEmail(manualPaymentRequest.Email, emailBody, "Osmos-ish: Review Your Payment Summary", true);
            #endregion

            CronJobPayoutObject cronJobPayoutObject = new CronJobPayoutObject();
            cronJobPayoutObject.payout_batch_id = manualPaymentRequest.TransactionId;
            cronJobPayoutObject.amount = Convert.ToString(manualPaymentRequest.PayAmount);
            cronJobPayoutObject.fee = manualPaymentRequest.Fee;
            cronJobPayoutObject.time_created = manualPaymentRequest.DateTimePaymentSent;
            cronJobPayoutObject.time_completed = manualPaymentRequest.DateTimePaymentSent;
            //cronJobPayoutObject.errors = Convert.ToString(manualPaymentRequest.batch_header.errors);
            cronJobPayoutObject.SessionId = manualPaymentRequest.SessionId;
            cronJobPayoutObject.StudentId = manualPaymentRequest.StudentId;
            cronJobPayoutObject.TeacherId = manualPaymentRequest.TeacherId;
            cronJobPayoutObject.TutorAffiliatePayBack = manualPaymentRequest.TutorAffiliatePayBack;
            cronJobPayoutObject.PaypalAccount = manualPaymentRequest.PaypalAccount;
            cronJobPayoutObject.PaypalAccountType = manualPaymentRequest.PaypalAccountType;
            cronJobPayoutObject.AffiliateShare = manualPaymentRequest.AffiliateShare;
            cronJobPayoutObject.SessionFee = manualPaymentRequest.SessionPrice;
            cronJobPayoutObject.ServiceFee = manualPaymentRequest.ServiceFee;
            cronJobPayoutObject.NumberOfStudentsEnrolled = manualPaymentRequest.NumberOfStudentsEnrolled;
            cronJobPayoutObject.PayoutType = "Manual Payout";

            await _PaymentProcessRepository.UpdatePayoutDetails(cronJobPayoutObject);
        }
    }
}
