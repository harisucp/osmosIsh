using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.DTOs.Mapped.Common
{
    public class DisputeDetail
    {
        public int DisputeId { get; set; }
        public int DisputeStatus { get; set; }
        public string DisputeStatusDescription { get; set; }
        public int DisputeReason { get; set; }
        public string DisputeReasonDescription { get; set; }
        public string Reason { get; set; }
        public int TeacherId { get; set; }
        public int StudentId { get; set; }
        public int SessionId { get; set; }
        public DateTime CreatedDate { get; set; }
        public int EnrollmentId { get; set; }
        public decimal TotalSessionAmount { get; set; }
        public decimal TotalLimit { get; set; }
        public decimal Share { get; set; }
        public string DiscountedFee { get; set; }
    }
    public class DisputeListDetail
    {
        public int DisputeId { get; set; }
        public int DisputeStatus { get; set; }
        public int DisputeReason { get; set; }
        public string DisputeStatusDescription { get; set; }
        public string DisputeReasonDescription { get; set; }
        public string Reason { get; set; }
        public int TeacherId { get; set; }
        public int StudentId { get; set; }
        public DateTime CreatedDate { get; set; }
        public int SessionId { get; set; }
    }
    public class CancelledSeriesListDetail
    {
        public int CancelledSeriesId { get; set; }
        public int SeriesId { get; set; }
        public string SeriesTitle { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; }
        public int TeacherId { get; set; }
        public string TutorName { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string IsCancelledSeriesResoved { get; set; }
        public string Status { get; set; }
    }
    public class CancelledDetail
    {
        public int StudentId { get; set; }
        public int TeacherId { get; set; }
        public int SeriesId { get; set; }
        public int CancelledSeriesId { get; set; }
        public int EnrollmentId { get; set; }
        public DateTime? CreatedDate { get; set; }
        public decimal TotalSessionAmount { get; set; }
        public decimal TotalLimit { get; set; }
    }
    public class CancelledSeriesSessionListDetail
    {
        public int SessionId { get; set; }
        public int CancelledSeriesId { get; set; }
        public decimal SeriesFee { get; set; }
        public string SeriesTitle { get; set; }
        public string Status { get; set; }
        public int MeetingId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }
    public class SpecificCancellationSeriesRequestDetail
    {
        public int CancelledSeriesId { get; set; }
        public int SeriesId { get; set; }
        public int StudentId { get; set; }
        public int TeacherId { get; set; }
        public DateTime CreatedDate { get; set; }
        public string IsCancelledSeriesResoved { get; set; }
        public string RequestStatus { get; set; }
        public int EnrollmentId { get; set; }
        public decimal TotalSessionAmount { get; set; }
        public decimal TotalLimit { get; set; }
        public decimal Share { get; set; }
        public string AdminComments { get; set; }
        public string DiscountedFee { get; set; }
    }
}
