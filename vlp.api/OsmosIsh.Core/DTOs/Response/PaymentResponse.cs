using Org.BouncyCastle.Utilities.IO;
using OsmosIsh.Data.DBEntities;
using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.DTOs.Response
{
    public class EnrollmentPaymentMainResponse
    {
        public List<EnrollmentPayment> enrollmentPayment { get; set; }
    }
    public class EnrollmentPayment
    {
        public int EnrollmentId { get; set; }
        public int? TransactionId { get; set; }
        public int StudentId { get; set; }
        public DateTime EnrollmentDate { get; set; }
        public int RefrenceId { get; set; }
        public int RefrenceType { get; set; }
        public decimal? SessionPrice { get; set; }
        public decimal? SeriesPrice { get; set; }

    }
    public class TransactionDataResponse
    {
        public int EnrollmentId { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal Charity { get; set; }
        public string Currency { get; set; }
        public decimal Fee { get; set; }
        public string Type { get; set; }
        public string Title { get; set; }
        public decimal DiscountedFee { get; set; }
    }
    public class PayoutDataResponse
    {
        public int TeacherId { get; set; }
        public int StudentId { get; set; }
        public string PaypalAccount { get; set; }
        public string PaypalAccountType { get; set; }
        public decimal SessionFee { get; set; }
        public int SessionId { get; set; }
        public int SessionAttendees { get; set; }
        public decimal PayAmount { get; set; }

    }

    public class RefundDataResponse
    {
        public int TransactionId { get; set; }
        public string CaptureId { get; set; }
        public decimal RefundAmount { get; set; }
        public int EnrollmentId { get; set; }

    }
    public class RefundPayoutDataResponse
    {
        public int TransactionId { get; set; }
        public string CaptureId { get; set; }
        public decimal RefundAmount { get; set; }
        public int EnrollmentId { get; set; }
        public string PaypalAccount { get; set; }
        public string PaypalAccountType { get; set; }
        public int SessionId { get; set; }
        public int TeacherId { get; set; }
        public decimal? TutorAffiliatePayBack { get; set; }
        public decimal? AffiliateShare { get; set; }

        public decimal? SessionFee { get; set; }
        public decimal? ServiceFee { get; set; }

    }
    public class TutorCancelledRefundDataResponse
    {
        public int TransactionId { get; set; }
        public string CaptureId { get; set; }
        public decimal RefundAmount { get; set; }
        public int EnrollmentId { get; set; }
        public int RefrenceId { get; set; }
        public string Type { get; set; }
        public string Title { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
    }
    //public class TutorPayoutDetail
    //{
    //    public int TeacherId { get; set; }
    //    public int? StudentId { get; set; }
    //    public string PaypalAccount { get; set; }
    //    public string PaypalAccountType { get; set; }
    //    public decimal? SessionFee { get; set; }
    //    public int? SessionId { get; set; }
    //    public int SessionAttendees { get; set; }
    //    public decimal PayAmount { get; set; }
    //}
    public class TutorPayoutDetail
    {
        public int TeacherId { get; set; }
        public string? StudentId { get; set; }
        public string PaypalAccount { get; set; }
        public string PaypalAccountType { get; set; }
        public decimal? SessionPrice { get; set; }
        public int? SessionId { get; set; }
        public string Title { get; set; }
        public decimal ServiceFee { get; set; }
        public int NumberOfStudentsEnrolled { get; set; }
        public decimal SingleAmount { get; set; }
        public decimal PayAmount { get; set; }
        public string Email { get; set; }
        public string TutorAffiliatePayBack { get; set; }
        public string AffiliateShare { get; set; }
        public string TutorName { get; set; }
        public int? SeriesId { get; set; }
    }

    public class AffiliatePayoutDetail
    {

        public decimal? TotalAffiliateShare { get; set; }

        public string AffiliateShareSessionsDetail { get; set; }
        public string AffiliatePaypalAccountType { get; set; }
        public string AffiliatePaypalAccount { get; set; }
        public string AffiliateEmail { get; set; }


    }
    public class TutorMissedSessionRefundDetail
    {
        public string CaptureId { get; set; }
        public int SessionId { get; set; }
        public decimal RefundAmount { get; set; }
        public int EnrollmentId { get; set; }
        public int StudentId { get; set; }
    }
    public class TutorMissedSessionRefundResponse
    {
        public string? CaptureId { get; set; }
        public string? RefundedAmount { get; set; }
        public string? RefundId { get; set; }
        public DateTime? create_time { get; set; }
        public DateTime? update_time { get; set; }
        public int EnrollmentId { get; set; }
        public string? state { get; set; }
        public int SessionId { get; set; }
    }

    public class ReCaptureDetail
    {
        public string CaptureId { get; set; }
        public int TransactionId { get; set; }
        public string AuthorizationId { get; set; }
        public string AmountPaid { get; set; }
    }

    public class AuthorizedCapturedDetail
    {
        //Authorization
        public string AuthorizationId { get; set; }
        public string PaymentMode { get; set; }
        public string ValidUntill { get; set; }
        public DateTime AuthorizationUpdateTime { get; set; }
        public DateTime AuthorizationCreateTime { get; set; }
        //Capture
        public string CaptureId { get; set; }
        public string State { get; set; }
        public string TransactionFee { get; set; }
        public DateTime CaptureUpdateTime { get; set; }
        public DateTime CaptureCreateTime { get; set; }
        public bool IsFinalCapture { get; set; }
        public string Amount { get; set; }
        public string PaymentId { get; set; }
    }
    public class ReCapturePaypalResponse
    {
        public string AuthorizationId { get; set; }
        public string CaptureId { get; set; }
        public DateTime CaptureUpdateTime { get; set; }
        public DateTime CaptureCreateTime { get; set; }
        public string TotalAmount { get; set; }
    }
    public class StudentDisputeResponse
    {
        public string CaptureId { get; set; }
        public string AuthorizationId { get; set; }
        public string IsPaymentSuccess { get; set; }
    }
    public class StudentCancelledSeriesResponse
    {
        public string CaptureId { get; set; }
        public string AuthorizationId { get; set; }
        public string IsPaymentSuccess { get; set; }
        public int EnrollmentId { get; set; }
    }
    public class TutorDisputeResponse
    {
        public string PaypalAccount { get; set; }
        public string PaypalAccountType { get; set; }
    }
    public class DisputeResolvedResponse
    {
        public int DisputeId { get; set; }
        public int SessionId { get; set; }
        public string ActionPerformedBy { get; set; }
        //Refund
        public string? captureId { get; set; }
        public string? Amount { get; set; }
        public string? RefundId { get; set; }
        public DateTime? CreateTime { get; set; }
        public DateTime? UpdateTime { get; set; }
        public int? EnrollmentId { get; set; }
        public string? State { get; set; }
        //payout
        public string? payout_batch_id { get; set; }
        public string? sender_batch_id { get; set; }
        public string? amount { get; set; }
        public string? fee { get; set; }
        public string? batch_status { get; set; }
        public string? time_created { get; set; }
        public string? time_completed { get; set; }
        public string? errors { get; set; }
        public int StudentId { get; set; }
        public int TeacherId { get; set; }

        public decimal? SessionFee { get; set; }
        public decimal? TutorAffiliatePayBack { get; set; }
        public decimal? AffiliateShare { get; set; }
        public string PaypalAccountType { get; set; }
        public string PaypalAccount { get; set; }


    }

    //Template Classes

    public class SessionTitleAfterPaymentTemplateResponse
    {
        public string TeacherEmail { get; set; }
        public string TeacherFirstName { get; set; }
        public string SessionTitle { get; set; }
        public decimal SessionFee { get; set; }
        public  DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

    }
    public class SeriesTitleAfterPaymentTemplateResponse
    {
        public string TeacherEmail { get; set; }
        public string TeacherFirstName { get; set; }
        public string SeriesTitle { get; set; }
        public decimal SessionFee { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class SessionTutorPaymentTemplateResponse
    {
        public int NumberOfJoinees { get; set; }
        public decimal SessionFee { get; set; }
        public string SeriesSessionName { get; set; }
    }
    public class TutorPayoutTemplateResponse
    {
        public string Email { get; set; }
    }
    public class SeriesTutorPaymentTemplateResponse
    {
        public int NumberOfJoinees { get; set; }
        public decimal SessionFee { get; set; }
        public string SeriesSessionName { get; set; }

    }


    public class studentCancellationTemplate
    {
        public string Email { get; set; }
        public string StudentName { get; set; }
        public string Title { get; set; }
    }
    public class studentCancellationUpdateTutorTemplate
    {
        public string Email { get; set; }
        public string TutorName { get; set; }
        public string Title { get; set; }
    }
    public class studentReviewSubmissionTemplate
    {
        public string Email { get; set; }
        public string StudentName { get; set; }
        public string Title { get; set; }
    }
    public class studentReviewTemplateResponse
    {
        public string Email { get; set; }
        public string TutorName { get; set; }
        public int TeacherId { get; set; }
    }

    public class ReminderTutorDetail
    {
        public string Title { get; set; }
        public string TeacherName { get; set; }
        public string TutorEmail { get; set; }
    }
    public class ReminderStudentDetail
    {
        public string Title { get; set; }
        public string StudentName { get; set; }
        public string Email { get; set; }
    }
    //public class studentTutorNoShowTemplate
    //{
    //    public string Title { get; set; }
    //    public DateTime SessionTime { get; set; }
    //}

    public class TutorEmailPayoutResponse
    {
        public string UserEmail { get; set; }
        public int SessionId { get; set; }
        public int SeriesId { get; set; }
        public string Title { get; set; }
        public string Type { get; set; }
        public decimal Fee { get; set; }
        public decimal ServiceFee { get; set; }
        public int NumberOfJoinees { get; set; }
    }
    public class TutorMissedShow
    {
        public string UserEmail { get; set; }
        public string FirstName { get; set; }
        public int SessionId { get; set; }
        public int SeriesId { get; set; }
        public string Title { get; set; }
        public string Type { get; set; }
        public DateTime StartTime { get; set; }
    }

    public class TutorAffiliateShareResponse
    {
        public decimal? AffiliateShare { get; set; }
        public decimal? TeacherShare { get; set; }
        public decimal? SessionFee { get; set; }
    }
    public class CouponValidateResponse
    {
        public int UserCouponLogId { get; set; }
        public int CouponId { get; set; }
        public string DiscountType { get; set; }
        public decimal? Discount { get; set; }
        public int? MinimumCartAmount { get; set; }
        public int? MaximumDiscount { get; set; }
        public decimal? TotalDiscountedAmount { get; set; }

    }

    public class DiscountedDetial
    {
        public decimal? TotalDiscountedAmount { get; set; }
        public decimal? TotalCalculatedDiscount { get; set; }
    }

}

