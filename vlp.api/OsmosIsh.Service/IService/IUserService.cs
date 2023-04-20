using Google.Apis.Auth;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.IService
{
    public interface IUserService
    {
        Task<MainResponse> Login(LoginRequest loginRequest);
        Task<MainResponse> ForgotPassword(ForgotPasswordRequest forgotPasswordRequest);
        Task<MainResponse> ResetForgotPassword(ResetForgotPasswordRequest resetForgotPasswordRequest);
        Task<MainResponse> ChangePassword(ChangePasswordRequest changePasswordRequest);
        Task<MainResponse> CheckUser(CheckUserRequest checkUserRequest);
        Task<MainResponse> SignUp(SignUpRequest signUpRequest);
        Task<MainResponse> ExternalLogIn(string email, string externalToken, string IPAddress);
        Task<MainResponse> ContactUs(ContactUsRequest contactUsRequest);
        Task<MainResponse> VerifyAccount(VerifyAccountRequest verifyAccountRequest);
        Task<MainResponse> ResendAccountVerification(ResendAccountVerificationRequest resendAccountVerificationRequest);
        Task<MainResponse> AdminLogin(LoginRequest loginRequest);
        Task<MainResponse> SendPhoneVerificationToken(SendPhoneVerificationRequest sendPhoneVerificationRequest);
        Task<MainResponse> VerifyPhoneNumberToken(VerifyPhoneNumberTokenRequest verifyPhoneNumberTokenRequest);
        Task<MainResponse> VerifyPhoneNumber(SendPhoneVerificationRequest verifyPhoneNumber);
        Task<MainResponse> DeleteUser(DeleteUserRequest deleteUserRequest);
        Task<MainResponse> RefreshToken(RefreshTokenRequest refreshTokenRequest);
        Task<MainResponse> RevokeToken(RevokeTokenRequest revokeTokenRequest);
    }
}

