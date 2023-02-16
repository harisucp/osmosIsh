using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore.Metadata;
using OsmosIsh.Core.CustomDataAnnotations;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace OsmosIsh.Core.DTOs.Request
{
    public class UpdateTeacherProfileRequest
    {
        [Required]
        public int TeacherId { get; set; }
        [Required]
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int? CountryId { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Education { get; set; }
        public string PhoneNumber { get; set; }
        public string Awards { get; set; }
        public string Specialization { get; set; }
        [AllowedExtensions(new string[] { ".jpg", ".png", ".gif" })]
        public IFormFile Image { get; set; }
        /// <example>false</example>
        public bool IsImageUpdated { get; set; } = false;
        public string Description { get; set; }
        public string Interest { get; set; }
        public string Languages { get; set; }
        //public string PrivateSession { get; set; }
        //public string PrivateSessionSlots { get; set; }
        //public decimal? FeePerHours { get; set; }
        public string PaypalAccountType { get; set; }
        public string PaypalAccount { get; set; }
        public string? AffiliateCode { get; set; }
        
    }

    public class CreateTutorRequest
    {
        public int UserId { get; set; }
        public string Username { get; set; }
    }

}
