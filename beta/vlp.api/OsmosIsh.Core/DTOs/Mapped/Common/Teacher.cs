using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.DTOs.Mapped.Common
{
    public class TutorDetail
    {
        public int TeacherID { get; set; }
        public string? Education { get; set; }
        public string? Languages { get; set; }
        public string? Awards { get; set; }
        public string? Specialization { get; set; }
        public string? Interest { get; set; }
        public string? Description { get; set; }
        public int UserId { get; set; }
        public string? Name { get; set; }
        public decimal? TeachersRating { get; set; }
        public string? TeacherImageFile { get; set; }
        public char? PrivateSession { get; set; }
        public string? SessionCategories { get; set; }
        public string? SessionDetail { get; set; }
        public string? SeriesDetail { get; set; }
        public string? CountryName { get; set; }
        public char? IsProfileUpdated { get; set; }
        public string? Reviews { get; set; } 

        public int? TutorReviewCounts { get; set; }
        public int? TotalSession{ get; set; }
        public int? UpcomingSession { get; set; }
        public int? DeliveredSession { get; set; }
        public int? TotalSeries { get; set; }
        public int? UpcomingSeries { get; set; }
        public int? DeliveredSeries { get; set; }
        
    }

    public class TeacherProfileDetail
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public int UserId { get; set; }
        public int TeacherId { get; set; }
        public int? CountryId { get; set; }
        public string CountryName { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Languages { get; set; }
        public string Interest { get; set; }
        public string Description { get; set; }
        public string Education { get; set; }
        public string Awards { get; set; }
        public string Specialization { get; set; }
        //public string PrivateSession { get; set; }
        public string FeePerHours { get; set; }
        public string PaypalAccountType { get; set; }
        public string PaypalAccount { get; set; }
        public string ImageFile { get; set; }
        public string? AffiliateCode { get; set; }
        public string PhoneNumberVerified { get; set; }
    }
}
