using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.DTOs.Mapped.Common
{
    public class SeriesSession
    {
        public int MaxRows { get; set; }
        public int RowNum { get; set; }
        public int UserId { get; set; }
        public int? SessionId { get; set; }
        public int? SeriesId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Name { get; set; }
        public int TeacherId { get; set; }
        public int SessionCategoryId { get; set; }
        public string SessionCategoryName { get; set; }
        public string? ImageFile { get; set; }
        public string? TeacherImageFile { get; set; }
        public string? Language { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string? Duration { get; set; }
        public decimal Fee { get; set; }
        public string? VacantSeats { get; set; }
        public int? TotalSeats { get; set; }
        public int? OccupiedSeats { get; set; }
        public string? TimeZone { get; set; }
        public decimal? Rating { get; set; }
        public int? RatingCount { get; set; }
        public string? CanBeSubscribedAnyTime { get; set; }
        public string? SeriesDetail { get; set; }
        public int SessionReferenceType { get; set; }
        public int SeriesReferenceType { get; set; }
        public DateTime? CreatedDate{ get; set; }
    }
    public class SessionCategories
    {
        public int SessionCategoryId { get; set; }
        public int? ParentId { get; set; }
        public string SessionCategoryName { get; set; }
        public DateTime CreatedDate { get; set; }
    }
    public class AvailableTags
    {

        public string Interest { get; set; }

    }
    public class SessionDetail
    {
        public string SessionTitle { get; set; }
        public string? SessionDescription { get; set; }
        public string? SessionAgenda { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }

        public string? Duration { get; set; }

        public int? Status { get; set; }
        public Decimal SessionFee { get; set; }
        public string Name { get; set; }
        public string? TeacherDescription { get; set; }
        public string? CategoryName { get; set; }

        public int NumberOfJoineesEnrolled { get; set; }
        public int NumberOfJoineesAllowed { get; set; }

        public decimal? Rating { get; set; }

        public string? Language { get; set; }
        public string FullName { get; set; }
        public string? ImageFile { get; set; }
        public string? TeacherImageFile { get; set; }
        public string? RelatedSessions { get; set; }
        public string? RelatedSeries { get; set; }
        public string? PastSessions { get; set; }
        public string? PastSeries { get; set; }
        public string? SimilarSeries { get; set; }
        public string? SimilarSessions { get; set; }
        public int? TeacherId { get; set; }
        public int? RefrenceType { get; set; }
        public int? EnrollmentId { get; set; }
        public string CountryName { get; set; }
        public string? IsPaymentSuccess { get; set; }

    }
    public class SeriesDetail
    {
        public string SeriesTitle { get; set; }
        public string? SeriesDescription { get; set; }
        public string? SeriesAgenda { get; set; }
        public int? SessionCount { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Duration { get; set; }
        public decimal Fee { get; set; }
        public string Name { get; set; }
        public string? TeacherDescription { get; set; }
        public int? CategoryId { get; set; }

        public string? CategoryName { get; set; }

        public int? NumberOfJoineesEnrolled { get; set; }
        public int? NumberOfJoineesAllowed { get; set; }
        public decimal? Rating { get; set; }

        public string? Language { get; set; }
        public string FullName { get; set; }
        public string? ImageFile { get; set; }
        public string? TeacherImageFile { get; set; }
        public string? RelatedSessions { get; set; }
        public string? RelatedSeries { get; set; }
        public string? PastSessions { get; set; }
        public string? PastSeries { get; set; }
        public string? SimilarSeries { get; set; }
        public string? SimilarSessions { get; set; }
        public string? ClosestSession { get; set; }
        public int? TeacherId { get; set; }
        public int? RefrenceType { get; set; }
        public int? EnrollmentId { get; set; }
        public string CountryName { get; set; }
        public DateTime? FirstSessionStartDate { get; set; }
        public string? IsPaymentSuccess { get; set; }

    }


}

