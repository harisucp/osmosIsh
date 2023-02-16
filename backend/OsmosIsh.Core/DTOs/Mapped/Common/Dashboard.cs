using Amazon.Chime.Model;
using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.DTOs.Mapped.Common
{
    public class StudentDashboardDetail
    {

        public int CountRecentEnrolled { get; set; }
        public int CountUpcomingEnrolled { get; set; }

        public int StudentId { get; set; }

        public string? Description { get; set; }

        public string UserId { get; set; }

        public string Name { get; set; }
        public string? ImageFile { get; set; }

    }
    public class StudentTodaySessionDetail
    {
        public int SessionId { get; set; }
        public int? SeriesId { get; set; }

        public string SessionTitle { get; set; }

        public string Description { get; set; }

        public int SessionCategoryId { get; set; }

        public string SessionCategoryName { get; set; }

        public string SessionImageFile { get; set; }
        public int? TeacherId { get; set; }
        public string TeacherImageFile { get; set; }
        public string TeacherName { get; set; }
        public string Language { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string Status { get; set; }
        public string SessionFee { get; set; }
        public string Duration { get; set; }
        public int? VacantSeats { get; set; }
        public int? TotalSeats { get; set; }
        public int? OccupiedSeats { get; set; }
        public string TimeZone { get; set; }
        public int EnrollmentId { get; set; }
        public int DisputeStatus { get; set; } 
        public int? DisputeId { get; set; }
        public string? SessionStatus { get; set; }
        public string DiscountedFee{ get; set; }
    }
    public class DataResponse
    {
        public string data { get; set; }
        public int totalCount { get; set; }
    }
    
    public class StudentFavoriteSessions
    {
        public int? id { get; set; }
        public int? KeyId { get; set; }
        public string? KeyType { get; set; }
        public string? Title { get; set; }

        public string? Description { get; set; }
        public int? SessionCategoryId { get; set; }

        public string? SessionCategoryName { get; set; }
        public string? ImageFile { get; set; }
        public string? Language { get; set; }

        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string? Duration { get; set; }
        public decimal? SessionFee { get; set; }

        public string? seriesdetail { get; set; }

    }

    //Teacher dashboard----------------------------------
    public class TeacherDashboardDetail
    {
        public decimal? TotalEarned { get; set; }
        public int? TotalDeliveredSessions { get; set; }

        public int? TotalDeliveredSeries { get; set; }

        public int? TotalPendingSessions { get; set; }

        public int? TotalPendingSeries { get; set; }

        public string TotalDeliveredHours { get; set; }
        public int? TotalDeliveredMinutes { get; set; }

        public int TeacherId { get; set; }

        public int? UserId { get; set; }

        public string? Name { get; set; }

        public decimal? TeachersRating { get; set; }

        public string? ImageFile { get; set; }
        public char? PrivateSession { get; set; }

    }
    
    public class TeachersSessionDetail
    {
        public int TeacherID { get; set; }
        public int SessionId { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string? title { get; set; }
        public int? SeriesId { get; set; }
    }
    public class TeachersTodaysSession
    {
        public int SessionId { get; set; }
        public int? SeriesId { get; set; }
        public string SessionTitle { get; set; }
        public string Description { get; set; }
        public int? SessionCategoryId { get; set; }
        public string SessionCategoryName { get; set; }
        public string SessionImageFile { get; set; }
        public string? Language { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Status { get; set; }
        public string Duration { get; set; }
        public decimal? Fee { get; set; }
        public string SessionFee { get; set; }
        public string VacantSeats { get; set; }
        public int? TotalSeats { get; set; }
        public int? OccupiedSeats { get; set; }
        public string TimeZone { get; set; }
        public string? SessionStatus { get; set; }
    }
    public class TeacherPrivateSessionResponse
    {
        public int PrivateSessionLogId { get; set; }
        public string IsAccept { get; set; }
        public int StudentId { get; set; }
        public int TeacherId { get; set; }
        public int? SessionCategoryId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string SessionCategoryName { get; set; }
        public string StudentName { get; set; }
        public string TeacherName { get; set; }
        public string StudentImage { get; set; }
        public string TeacherImage { get; set; }
        public int? StudentType { get; set; }
        public int? TeacherType { get; set; }
        public int? NewMessageCount { get; set; }
        public string RecordDeleted{ get; set; }
        public int? FeePerHours { get; set; }
        public DateTime? CreatedDate { get; set; }
        public int SessionType { get; set; }
        public string Notes { get; set; }
        public int StudentUserId { get; set; }
        public int TeacherUserId { get; set; }
        public int? SessionId { get; set; }
        public string SessionTitle { get; set; }
    }


    public class AllNotifications
    {
        public int NotificationCount { get; set; }
    }
    public class PrivateSessionAvailableDay
    {
        public string PrivateSession { get; set; }
        public decimal? FeePerHours { get; set; }
        public string PrivateSessionCategories { get; set; }
        public string PrivateSessionTimeZone { get; set; }
        public string PrivateSessionAvailableDays { get; set; }
    }


}

