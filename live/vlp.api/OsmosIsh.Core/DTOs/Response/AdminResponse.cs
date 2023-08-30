using Org.BouncyCastle.Utilities.IO;
using OsmosIsh.Data.DBEntities;
using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.DTOs.Response
{
    public class AdminSeriesResponse
    {
        public int SeriesId { get; set; }
    }
    public class AdminStudentResponse
    {
        public int StudentId { get; set; }
    }
    public class AdminSessionResponse
    {
        public int SessionId { get; set; }
    }
    public class AdminTutorResponse
    {
        public int TeacherId { get; set; }
    }
    public class ResolveDisputeStudentResponse
    {
        public string Email { get; set; }
        public string StudentName { get; set; }
        public string Title { get; set; }
        public int? DisputeId { get; set; }
    }

    public class ResolveDisputeTutorResponse
    {
        public string Email { get; set; }
        public string TutorName { get; set; }
        public string Title { get; set; }
        public int? DisputeId { get; set; }
    }
    public class ResolveDisputeDetailResponse
    {

        public int DisputeId { get; set; }
        public string? RefundInfo { get; set; }
        public string? PayoutInfo { get; set; }
        public string StudentName { get; set; }
        public string TeacherName { get; set; }
        public string Title { get; set; }
    }
    public class CancelledSeriesDetailResponse
    {

        public int CancelledSeriesId { get; set; }
        public int SeriesId { get; set; }
        public int StudentId { get; set; }
        public int TeacherId { get; set; }
        public string? RefundInfo { get; set; }
        public string Title { get; set; }
        public string? PayoutInfo { get; set; }

        public string StudentName { get; set; }
        public string TeacherName { get; set; }
    }


    public class CouponDetailResponse
    {
        public int CouponId { get; set; }
        public int CouponType { get; set; }
        public string CouponTypeLabel { get; set; }
        public string CouponCode { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int ValidDays { get; set; }
        public decimal? Discount { get; set; }
        public string DiscountType { get; set; }
        public string NoExpiration { get; set; }
        public string Active { get; set; }
        public string BlockCoupon { get; set; }
        public int SentToCount { get; set; }
        public int AvailedCount { get; set; }
        public DateTime CreatedDate { get; set; }
        public int? MinimumCartAmount { get; set; }
        public int? MaximumDiscount { get; set; }
        public int? ParentCouponId { get; set; }
    }

    public class AffiliateDetailResponse
    {
        public int AffiliateId { get; set; }
        public string AffiliateCode { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string PaypalAccountType { get; set; }
        public string PaypalAccount { get; set; }
        public decimal? AffiliateEarningPercentage { get; set; }
        public decimal? TeacherEarningPercentage { get; set; }
        public string Active { get; set; }
        public string BlockAffiliate { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public int? ParentAffiliateId { get; set; }
    }
    public class AffiliateLogResponse
    {
        public int AffiliateId { get; set; }
        public string AffiliateCode { get; set; }
        public string AffiliateName { get; set; }
        public decimal? AffiliateEarningPercentage { get; set; }
        public decimal? TutorEarningPercentage { get; set; }
        public string Payout_batch_id { get; set; }
        public string Sender_batch_id { get; set; }
        public decimal? Amount { get; set; }
        public DateTime AffiliatePayoutCreated { get; set; }
        public string AffiliatePaypalAccountType { get; set; }
        public string AffiliatePaypalAccount { get; set; }
        public decimal? AffiliateShare { get; set; }
        public decimal? TutorShare { get; set; }
        public int NumberOfStudentsEnrolled { get; set; }
        public DateTime PayoutCreated { get; set; }
        public string TeacherName { get; set; }
        public string TutorPaypalAccount { get; set; }
        public string TutorPaypalAccountType { get; set; }
        public string Title { get; set; }
        public string PayoutType { get; set; }

    }

    public class SentCouponDetailResponse
    {
        public int UserCouponLogId { get; set; }
        public string CouponCode { get; set; }
        public string CouponType { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ExpirationDate { get; set; }
        public string Availed { get; set; }
        public decimal Discount { get; set; }
        public string BlockCoupon { get; set; }
        public string Email { get; set; }
        public string DiscountType { get; set; }
        public string UserName { get; set; }
    }

    public class NoShowRefundResponse
    {
        public int DisputeId { get; set; }
        public int StudentId { get; set; }
        public int TeacherId { get; set; }
        public string RefundInfo { get; set; }
        public string  StudentName { get; set; }
        public string TeacherName { get; set; }
        public string Title { get; set; }
    }

}
