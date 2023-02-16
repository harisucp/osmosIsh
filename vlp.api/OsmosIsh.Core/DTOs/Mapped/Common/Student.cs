using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.DTOs.Mapped.Common
{
    public class StudentProfileDetail
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public int UserId { get; set; }
        public int StudentId { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Description { get; set; }
        public string Interest { get; set; }
        public string Education { get; set; }
        public string Languages { get; set; }
        public int? CountryId { get; set; }
        public string CountryName { get; set; }
        public string PhoneNumber { get; set; }
        public string PhoneCode { get; set; }
        public string ImageFile { get; set; }
        public string PhoneNumberVerified { get; set; }


    }
    public class StudentEnrollmentDetail
    {
        public int id { get; set; }
        public int EnrollmentId { get; set; }
        public int? SessionId { get; set; }
        public int? SeriesId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? Endtime { get; set; }
        public string? Duration { get; set; }
        public decimal? Fee { get; set; }
        public string? CategoryName { get; set; }
        public string? Language { get; set; }
        public string? FullName { get; set; }   
        public string? ImageFile { get; set; }
        public string? closestSession { get; set; }
        public int? SourceTypeId { get; set; }
        public int? TransactionId { get; set; }
        public int? TeacherId { get; set; }

        public string? IsSavedForLater { get; set; }
        public string? IsPaymentSuccess { get; set; }
        public string? TutorBlocked { get; set; }
        public string? ClassBlocked  { get; set; }
        public int NumberOfJoineesAllowed { get; set; }
        public string? RecordDeleted { get; set; }

    }
}
