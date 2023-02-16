using Newtonsoft.Json;
using Org.BouncyCastle.Utilities.IO;
using OsmosIsh.Data.DBEntities;
using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.DTOs.Response
{
    public class UserResponse
    {
        public string Token { get; set; }
        public string RefreshToken { get; set; }
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string IsStudent { get; set; }
        public string IsTutor { get; set; }
        public string? IsProfileUpdated { get; set; }
        public int? TeacherId { get; set; }
        public int? StudentId { get; set; }
        public string UserImage { get; set; }
        public int? EnrollmentCount { get; set; }
        public string? ExternalProvider { get; set; }
        public string PhoneNumberVerified { get; set; }
    }
    public class TeacherDetail
    {
        public string IsProfileUpdated { get; set; }
    }


    public class FacebookResposne
    {
        public string Id { get; set; }

        /// <summary>
        /// Email returned by Facebook
        /// </summary>       
        public string Email { get; set; }

        /// <summary>
        /// FirstName returned by Facebook
        /// </summary>
        public string First_Name { get; set; }
        /// <summary>
        /// LastName returned by Facebook
        /// </summary>
        public string Last_Name { get; set; }

    }
    public class UpdateUserResponse
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserImage { get; set; }
    }
    public class AdminUserResponse
    {
        public string AdminToken { get; set; }
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
    }
    public class CouponResponse
    {
        public int? CouponId { get; set; }
        public string Message { get; set; }


    }

    public class RefreshToken
    {
        public string Token { get; set; }
        public DateTime Expires { get; set; }
        public bool IsExpired => DateTime.UtcNow >= Expires;
        public DateTime Created { get; set; }
        public string CreatedByIp { get; set; }
        public DateTime? Revoked { get; set; }
        public string RevokedByIp { get; set; }
        public string ReplacedByToken { get; set; }
        public bool IsActive => Revoked == null && !IsExpired;
    }

    public class RefershTokenResponse : BaseResponse
    {
        [JsonIgnore]
        public int UserId { get; set; }
        [JsonIgnore]
        public string Email { get; set; }
        public string Token { get; set; }
        public string RefreshToken { get; set; }
    }
}
