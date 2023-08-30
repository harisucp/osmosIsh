using System;
using System.Collections.Generic;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Service.IService;
using OsmosIsh.Web.API.Helpers;

namespace OsmosIsh.Web.API.Controllers
{
    [Route("[controller]/[action]")]
    [ApiController]
    public class AuthAPIController : ControllerBase
    {

        #region readonly
        private readonly IUserService _UserService;
        private MainResponse _MainResponse;
        #endregion

        #region Private
        private string _JsonString = string.Empty;
        #endregion


        public AuthAPIController(IUserService UserService)
        {
            _UserService = UserService;
            _MainResponse = new MainResponse();
        }

        /// <summary>
        /// This API is used for login.
        /// </summary>
        /// <param name="loginRequest"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> Login(LoginRequest loginRequest)
        {
            loginRequest.IPAddress = ipAddress();
            _MainResponse = await _UserService.Login(loginRequest);
            if (_MainResponse.Success)
            {
                var claims = new Dictionary<string, string>
                {
                    { "Email", loginRequest.Email },
                    { "UserId", _MainResponse.UserResponse.UserId.ToString() },
                    { "Jti", Guid.NewGuid().ToString() },
                };
                _MainResponse.UserResponse.Token = JWTHelper.GenerateJSONWebToken(claims);


            }
            _JsonString = Mapper.Convert<UserResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }


        /// <summary>
        /// This API is used to send email for forgot password.
        /// </summary>
        /// <param name="forgotPasswordRequest"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> ForgotPassword(ForgotPasswordRequest forgotPasswordRequest)
        {
            _MainResponse = await _UserService.ForgotPassword(forgotPasswordRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

        /// <summary>
        /// This API is used for reset forgot password.
        /// </summary>
        /// <param name="resetForgotPasswordRequest"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> 
        ResetForgotPassword(ResetForgotPasswordRequest resetForgotPasswordRequest)
        {
            _MainResponse = await _UserService.ResetForgotPassword(resetForgotPasswordRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
        /// <summary>
        /// This API is used for Change password.
        /// </summary>
        /// <param name="changePasswordRequest"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> ChangePassword(ChangePasswordRequest changePasswordRequest)
        {
            _MainResponse = await _UserService.ChangePassword(changePasswordRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
        /// <summary>
        /// This API is used for Check User is already registered or not.
        /// </summary>
        /// <param name="CheckUserRequest"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> CheckUser(CheckUserRequest checkUserRequest)
        {
            _MainResponse = await _UserService.CheckUser(checkUserRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
        /// <summary>
        /// This API is used for signup.
        /// </summary>
        /// <param name="signUpRequest"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> SignUp(SignUpRequest signUpRequest)
        {
            _MainResponse = await _UserService.SignUp(signUpRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

        /// <summary>
        /// This API is used to sign in using google.
        /// </summary>
        /// <param name="externalSignInRequest"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> ExternalLogIn([FromBody] ExternalSignInRequest externalSignInRequest)
        {
            dynamic externalLoginResponse = null;
            if (externalSignInRequest.ProviderName.ToLower().Equals("facebook"))
            {
                using (var client = new HttpClient())
                {
                    client.BaseAddress = new Uri("https://graph.facebook.com");
                    HttpResponseMessage response = client.GetAsync($"me?fields=id,first_name,last_name,email&access_token={externalSignInRequest.TokenId}").Result.EnsureSuccessStatusCode();
                    string result = response.Content.ReadAsStringAsync().Result;
                    externalLoginResponse = JsonConvert.DeserializeObject<FacebookResposne>(result);
                }
            }
            else if (externalSignInRequest.ProviderName.ToLower().Equals("google"))
            {
                externalLoginResponse = GoogleJsonWebSignature.ValidateAsync(externalSignInRequest.TokenId, new GoogleJsonWebSignature.ValidationSettings()).Result;
            }
            else
            {
                _MainResponse.Success = false;
                _MainResponse.Message = ErrorMessages.INVALID_LOGIN_PROVIDER;
            }

            if (externalLoginResponse != null)
            {
                _MainResponse = await _UserService.ExternalLogIn(externalLoginResponse.Email, externalSignInRequest.ProviderName.ToLower().Equals("google") ? externalLoginResponse.Subject :externalLoginResponse.Id,ipAddress());
                if (_MainResponse.Success)
                {
                    var claims = new Dictionary<string, string>
                    {
                        { "Email", externalLoginResponse.Email },
                        { "UserId", _MainResponse.UserResponse.UserId.ToString() },
                        { "Jti", Guid.NewGuid().ToString() },
                    };

                    _MainResponse.UserResponse.Token = JWTHelper.GenerateJSONWebToken(claims);
                }
            }


            _JsonString = Mapper.Convert<UserResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

        /// <summary>
        /// This API is used for ContactUs.
        /// </summary>
        /// <param name="contactUsRequest"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> ContactUs(ContactUsRequest contactUsRequest)
        {
            _MainResponse = await _UserService.ContactUs(contactUsRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

        /// <summary>
        /// This API is used for verify account.
        /// </summary>
        /// <param name="verifyAccountRequest"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> VerifyAccount(VerifyAccountRequest verifyAccountRequest)
        {
            _MainResponse = await _UserService.VerifyAccount(verifyAccountRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }


        /// <summary>
        /// This API is used for resend account verification.
        /// </summary>
        /// <param name="resendAccountVerificationRequest"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> ResendAccountVerification(ResendAccountVerificationRequest resendAccountVerificationRequest)
        {
            _MainResponse = await _UserService.ResendAccountVerification(resendAccountVerificationRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
        /// <summary>
        /// This API is used for login.
        /// </summary>
        /// <param name="loginRequest"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> AdminUserLogin(LoginRequest loginRequest)
        {
            _MainResponse = await _UserService.AdminLogin(loginRequest); 
            if (_MainResponse.Success)
            {
                var claims = new Dictionary<string, string>
                {
                    { "Email", loginRequest.Email },
                    { "UserId", _MainResponse.AdminUserResponse.UserId.ToString() },
                    { "Jti", Guid.NewGuid().ToString() },
                };
                string token = JWTHelper.GenerateJSONWebToken(claims);
                _MainResponse.AdminUserResponse.AdminToken = token;
            }
            _JsonString = Mapper.Convert<AdminUserResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }


        /// <summary>
        /// This API is used for send SMS.
        /// </summary>
        /// <param name="sendPhoneVerificationRequest"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> SendPhoneVerificationToken(SendPhoneVerificationRequest sendPhoneVerificationRequest)
        {
            _MainResponse = await _UserService.SendPhoneVerificationToken(sendPhoneVerificationRequest);
            _JsonString = Mapper.ConvertWithoutNull<UserResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

        /// <summary>
        /// This API is used to verify phone number.
        /// </summary>
        /// <param name="verifyPhoneNumberTokenRequest"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> VerifyPhoneNumberToken(VerifyPhoneNumberTokenRequest verifyPhoneNumberTokenRequest)
        {
            _MainResponse = await _UserService.VerifyPhoneNumberToken(verifyPhoneNumberTokenRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
        /// <summary>
        /// This API is used to save and auto-verify phone-number.
        /// </summary>
        /// <param name="VerifyPhoneNumber"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> VerifyPhoneNumber(SendPhoneVerificationRequest VerifyPhoneNumber)
        {
            _MainResponse = await _UserService.VerifyPhoneNumber(VerifyPhoneNumber);
            _JsonString = Mapper.ConvertWithoutNull<UserResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
        /// <summary>
        /// This API is used to delete user.
        /// </summary>
        /// <param name="deleteUserRequest"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> DeleteUser(DeleteUserRequest deleteUserRequest)
        {
            _MainResponse = await _UserService.DeleteUser(deleteUserRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

        
        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> RefreshToken(RefreshTokenRequest request)
        {
            request.IPAddress = ipAddress();
            _MainResponse = await _UserService.RefreshToken(request);

            var data = _MainResponse.RefershTokenResponse;
            var token = GenerateJWTToken(data.UserId, data.Email);
           
           _MainResponse.RefershTokenResponse.Token = token;

            _JsonString = Mapper.Convert<RefershTokenResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> RevokeToken(RevokeTokenRequest request)
        {
            request.IPAddress = ipAddress();

            _MainResponse = await _UserService.RevokeToken(request);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

        private string GenerateJWTToken(int userId, string emailAddress) 
        {
             var claims = new Dictionary<string, string>
            {
                { "Email", emailAddress },
                { "UserId", userId.ToString() },
                { "Jti", Guid.NewGuid().ToString() },
            };
            string token = JWTHelper.GenerateJSONWebToken(claims);

            return token;
        }

        
        private string ipAddress()
        {
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
                return Request.Headers["X-Forwarded-For"];
            else
                return HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();
        }

    }
}