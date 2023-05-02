using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore.Metadata;
using OsmosIsh.Core.CustomDataAnnotations;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace OsmosIsh.Core.DTOs.Request
{
    public class UpdateStudentProfileRequest
    {
        [Required]
        public int StudentId { get; set; }
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string LastName { get; set; }
        public int? CountryId { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Education { get; set; }
        public string PhoneNumber { get; set; }
        [AllowedExtensions(new string[] { ".jpg", ".png", ".gif" })]
        public IFormFile Image { get; set; }
        /// <example>false</example>
        public bool IsImageUpdated { get; set; } = false;
        public string Description { get; set; }
        public string Interest { get; set; }
        public string Languages { get; set; }
    }


    public class UpdateStudentORTeacherRequest
    {
        [Required]
        public string Type { get; set; }

        [Required]
        public int Id { get; set; }
        
        public string FieldName { get; set; } 

        public string Value { get; set; }
        [Required]
        [DefaultValue("true")]
        public bool IsInterestOrDescription { get; set; }

        public bool IsPayPal { get; set; }

    }
    public class CreateStudentRequest
    {
        [Required]
        public int UserId { get; set; }
        [Required]
        public string Username { get; set; }
    }
    public class ValidateCouponRequest
    {
        [Required]
        public string UserEmail { get; set; }
        [Required]
        public string CouponCode { get; set; }
        [Required]
        public decimal TotalAmount { get; set; }
        [Required]
        public int StudentId { get; set; }
        [Required]
        public string Enrollments { get; set; }
        public DateTime UserDate { get; set; }
    }

    public class ValideCouponResponse
    {
        public int CouponId { get; set; }
        public int UserCouponLogId { get; set; }
        public string CouponCode { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public string DiscountType { get; set; }
        public decimal Discount { get; set; }
        public char NoExpiration { get; set; }
        public char BlockedCoupon { get; set; }



    }
}
