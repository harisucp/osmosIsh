using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore.Metadata;
using OsmosIsh.Core.CustomDataAnnotations;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace OsmosIsh.Core.DTOs.Request
{
    public class PaymentRequest : BaseRequest
    {
        public int StudentId { get; set; }
        public string Enrollments { get; set; }
        public decimal Amount { get; set; }
        public decimal SubTotal { get; set; }
        public decimal Charity { get; set; }
        public int? CouponId { get; set; }
        public int? UserCouponLogId { get; set; }
    }
    public class CancelStudentClassRequest : BaseRequest
    {
        public int StudentId { get; set; }
        public int SessionId { get; set; }
        public int SeriesId { get; set; }
        public DateTime CancelDate { get; set; }
    }
    public class TutorCancelClassRequest : BaseRequest
    {
        public int TeacherId { get; set; }
        public int SessionId { get; set; }
        public int SeriesId { get; set; }
        public DateTime CancelDate { get; set; }
    }
    public class DisputeHandlingRequest : BaseRequest
    {

    }
    public class CreateTransactionRequest : BaseRequest
    {

    }
    public class CronJobPayoutObject
    {
        public int? SessionId { get; set; }
        public string? payout_batch_id { get; set; }
        public string? sender_batch_id { get; set; }
        public string? amount { get; set; }
        public string? fee { get; set; }
        public string? batch_status { get; set; }
        public string? time_created { get; set; }
        public string? time_completed { get; set; }
        public string? errors { get; set; }
        public string? StudentId { get; set; }
        public int? TeacherId { get; set; }
        public string TutorAffiliatePayBack { get; set; }
        public string PaypalAccountType { get; set; }
        public string PaypalAccount { get; set; }
        public string AffiliateShare { get; set; }
        public decimal? SessionFee { get; set; }
        public decimal ServiceFee { get; set; }
        public int? NumberOfStudentsEnrolled { get; set; }
        public string PayoutType { get; set; }
    }
    public class CronJobAffilaitePayoutObject
    {
        public int? AffiliateId { get; set; }
        public int? SessionId { get; set; }
        public char PayoutSucceeded { get; set; }
        public string? payout_batch_id { get; set; }
        public string? sender_batch_id { get; set; }
        public string? Amount { get; set; }
        public string? Fee { get; set; }
        public string? Batch_status { get; set; }
        public string? Time_created { get; set; }
        public string? Time_completed { get; set; }
        public string? Errors { get; set; }
        public string PaypalAccountType { get; set; }
        public string PaypalAccount { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
    }
    public class PayoutObject
    {
        public int? SessionId { get; set; }
        public string? payout_batch_id { get; set; }
        public string? sender_batch_id { get; set; }
        public string? amount { get; set; }
        public string? fee { get; set; }
        public string? batch_status { get; set; }
        public string? time_created { get; set; }
        public string? time_completed { get; set; }
        public string? errors { get; set; }
        public int? StudentId { get; set; }
        public int? TeacherId { get; set; }
    }
    public class CancelledSeriesSessionPayoutObject
    {
        public int SessionId { get; set; }
        public int StudentId { get; set; }
        public int TeacherId { get; set; }
        public string? payout_batch_id { get; set; }
        public string? sender_batch_id { get; set; }
        public string? amount { get; set; }
        public string? fee { get; set; }
        public string? batch_status { get; set; }
        public string? time_created { get; set; }
        public string? time_completed { get; set; }
        public string? errors { get; set; }
        public string PaypalAccount { get; set; }
        public string PaypalAccountType { get; set; }
        public decimal? TutorAffiliatePayBack { get; set; }
        public decimal? AffiliateShare { get; set; }
        public decimal? SessionFee { get; set; }
        public decimal? ServiceFee { get; set; }
        public string PayoutType { get; set; }
        

    }
    public class CancelledSeriesPayoutObject
    {
        public int SeriesId { get; set; }
        public int StudentId { get; set; }
        public int TeacherId { get; set; }
        public string? payout_batch_id { get; set; }
        public string? sender_batch_id { get; set; }
        public string? amount { get; set; }
        public string? fee { get; set; }
        public string? batch_status { get; set; }
        public string? time_created { get; set; }
        public string? time_completed { get; set; }
        public string? errors { get; set; }
        public int? CancelledSeriesId { get; set; }
        public decimal? StudentShare { get; set; }
    }



    public class AffiliateJsonArrayResponse
    {
        public int SessionId { get; set; }
        public string? SessionTotalAffiliateShare { get; set; }
        public string? Title { get; set; }
        public string? SessionPayoutIds { get; set; }
        public string? TeacherName { get; set; }
        public string? AffiliateEarningPercentage { get; set; }
        public int AffiliateId { get; set; }

    }

    public class ManualPaymentRequest
    {
        [Required]
        public int SessionId { get; set; }
        [Required]
        public int TeacherId { get; set; }
        [Required]
        public string StudentId { get; set; }
        [Required]
        public string PaypalAccount { get; set; }
        [Required]
        public string PaypalAccountType { get; set; }
        [Required]
        public decimal SessionPrice { get; set; }
        [Required]
        public string Title { get; set; }
        [Required]
        public decimal ServiceFee { get; set; }
        [Required]
        public int NumberOfStudentsEnrolled { get; set; }
        [Required]
        public decimal SingleAmount { get; set; }
        [Required]
        public decimal PayAmount { get; set; }
        [Required]
        public string Email { get; set; }
        [Required]
        public string TutorAffiliatePayBack { get; set; }
        [Required]
        public string AffiliateShare { get; set; }
        [Required]
        public string TransactionId { get; set; }
        [Required]
        public string Fee { get; set; }
        [Required]
        public string DateTimePaymentSent { get; set; }
    }
}
