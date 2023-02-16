using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace OsmosIsh.Core.DTOs.Request
{
    public class LoginRequest
    {
        /// <summary>
        /// Registered Email Address
        /// </summary>
        /// <example></example>
        [Required]
        [DataType(DataType.EmailAddress)]
        [EmailAddress]
        public string Email { get; set; }

        /// <summary>
        /// Password
        /// </summary>
        /// <example></example>
        [Required]
        public string Password { get; set; }

        public string IPAddress { get; set; }
    }

    public class ForgotPasswordRequest
    {
        /// <summary>
        /// Email
        /// </summary>
        [Required]
        [DataType(DataType.EmailAddress)]
        [EmailAddress]
        public string Email { get; set; }
    }

    public class ResetForgotPasswordRequest
    {
        /// <summary>
        /// OTP
        /// </summary>
        [Required]
        public string Token { get; set; }

        /// <summary>
        /// New Password
        /// </summary>
        [Required]
        [MinLength(6, ErrorMessage = "Password cannot be less than 6.")]
        public string Password { get; set; }
    }
    public class ChangePasswordRequest
    {
        /// <summary>
        /// OTP
        /// </summary>
        [Required]
        public string Token { get; set; }

        /// <summary>
        /// UserId
        /// </summary>
        [Required]
        public int UserId { get; set; }

        /// <summary>
        /// Old Password
        /// </summary>
        [Required]
        [MinLength(6, ErrorMessage = "Password cannot be less than 6.")]
        public string OldPassword { get; set; }
        /// <summary>
        /// New Password
        /// </summary>
        [Required]
        [MinLength(6, ErrorMessage = "Password cannot be less than 6.")]
        public string NewPassword { get; set; }
    }
     public class CheckUserRequest { 
    public string Email { get; set; }
    }


    public class SignUpRequest
    {
        /// <summary>
        /// Email
        /// </summary>
        /// <example></example>
        [Required]
        [DataType(DataType.EmailAddress)]
        [EmailAddress]
        public string Email { get; set; }

        /// <summary>
        /// FullName combination of firstname and lastname ex:- John Smith
        /// </summary>
        /// <example></example>
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; }

        /// <summary>
        /// New Password
        /// </summary>
        /// <example></example>
        public string Password { get; set; }

        /// <summary>
        /// This property should be true if we want to signup as tutor.By default all signup set as student.
        /// </summary>
        /// <example>false</example>
        public bool IsBecomeTutor { get; set; } = false;
        /// <summary>
        /// This property should be true if we want to signup from external signup.
        /// </summary>
        /// <example>false</example>
        public bool IsExternalSignUp { get; set; } = false;
        public string ExternalProvider { get; set; }
        public string ExternalToken { get; set; }
    }

    public class ExternalSignInRequest
    {
        /// <summary>
        /// TokenId Returned by Google/Facebook
        /// </summary>
        [Required]
        public string TokenId { get; set; }

        /// <summary>
        /// Provider we are using right now :- Facebook/Google
        /// </summary>
        [Required]
        public string ProviderName { get; set; }
    }
    public class VerifyAccountRequest
    {
        /// <summary>
        /// OTP
        /// </summary>
        [Required]
        public string Token { get; set; }

        /// <summary>
        /// Email
        /// </summary>
        [Required]
        public string Email { get; set; }
    }

    public class ResendAccountVerificationRequest
    {
        /// <summary>
        /// Email
        /// </summary>
        [Required]
        public string Email { get; set; }
    }

    public class SendPhoneVerificationRequest
    {
        [Required]
        public int UserId { get; set; }
        public string PhoneNumber { get; set; }
    }
    public class VerifyPhoneNumberTokenRequest
    {
        [Required]
        public string OTP  { get; set; }
        [Required]
        public int UserId { get; set; }

        public string PhoneNumber { get; set; }
    }

    public class DeleteUserRequest
    {
        public int? StudentId  { get; set; }
        public int? TeacherId  { get; set; }
        public string ActionPerformedBy { get; set; }
        public Boolean ForceDelete { get; set; } = false;
    }

    public class RefreshTokenRequest
    {
        public string RefreshToken { get; set; }
        public string IPAddress { get; set; }
    }

    public class RevokeTokenRequest
    {
        public string RefreshToken { get; set; }
        public string IPAddress { get; set; }
    }
}
