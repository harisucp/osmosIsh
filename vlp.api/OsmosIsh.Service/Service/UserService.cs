using AutoMapper;
using Microsoft.Data.SqlClient;
using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Data.DBEntities;
using OsmosIsh.Repository.IRepository;
using OsmosIsh.Service.IService;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace OsmosIsh.Service.Service
{
    public class UserService : IUserService
    {
        #region readonly
        private readonly IUserRepository _UserRepository;
        private readonly IMapper _Mapper;
        #endregion

        #region Private
        private MainResponse _MainResponse;
        public OsmosIshContext _ObjContext;
        #endregion
        public UserService(IUserRepository UserRepository, IMapper Mapper, OsmosIshContext ObjContext)
        {
            _UserRepository = UserRepository;
            _Mapper = Mapper;
            _MainResponse = new MainResponse();
            _ObjContext = ObjContext;
        }

        public async Task<MainResponse> Login(LoginRequest loginRequest)
        {
            string encyptedPassword = CommonFunction.EncryptPassword(loginRequest.Password);
            return await _UserRepository.LoginUser(loginRequest.Email, encyptedPassword, null, loginRequest.IPAddress);
        }

        public async Task<MainResponse> ForgotPassword(ForgotPasswordRequest forgotPasswordRequest)
        {
            var userDetail = _UserRepository.GetSingle(x => x.Email == forgotPasswordRequest.Email && x.RecordDeleted == "N" && x.Active == "Y");
            if (userDetail != null && userDetail.ExternalProvider == null)
            {
                // Update information
                userDetail.ResetToken = Guid.NewGuid();
                userDetail.ResetTokenExpiration = DateTime.UtcNow.AddDays(1);
                userDetail.ModifiedBy = userDetail.Email;
                userDetail.ModifiedDate = DateTime.UtcNow;
                await _UserRepository.UpdateAsync(userDetail);

                _MainResponse.Message = SuccessMessage.RESET_PASSWORD_EMAIL;
                var emailBody = CommonFunction.GetTemplateFromHtml("ForgotPassword.html");
                emailBody = emailBody.Replace("{Email}", userDetail.FirstName);
                emailBody = emailBody.Replace("{ResetUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/ResetPassword?Token=" + userDetail.ResetToken + "&Email=" + userDetail.Email);
                NotificationHelper.SendEmail(userDetail.Email, emailBody, "Osmos-ish:Reset Your Password", true);
            }
            else
            {
                _MainResponse.Message = userDetail != null ? ErrorMessages.EXTERNAL_EMAIL_NOT_REGISTERED : ErrorMessages.EMAIL_NOT_REGISTERED;
                _MainResponse.Success = false;
            }
            return _MainResponse;
        }

        public async Task<MainResponse> ResetForgotPassword(ResetForgotPasswordRequest resetForgotPasswordRequest)
        {
            var userDetail = _UserRepository.GetSingle(x => x.ResetToken.ToString() == resetForgotPasswordRequest.Token && x.RecordDeleted == "N" && x.Active == "Y" && x.ResetTokenExpiration > DateTime.UtcNow);
            if (userDetail != null)
            {
                // Update information
                userDetail.ResetToken = null;
                userDetail.ResetTokenExpiration = null;
                userDetail.ModifiedBy = userDetail.Email;
                userDetail.ModifiedDate = DateTime.UtcNow;
                userDetail.Password = CommonFunction.EncryptPassword(resetForgotPasswordRequest.Password);
                await _UserRepository.UpdateAsync(userDetail);
                _MainResponse.Message = SuccessMessage.PASSWORD_REST;
            }
            else
            {
                _MainResponse.Message = ErrorMessages.REST_PASSWORD_LINK_EXPIRED;
                _MainResponse.Success = false;
            }
            return _MainResponse;
        }
        public async Task<MainResponse> CheckUser(CheckUserRequest checkUserRequest)
        {
            var userDetail = _UserRepository.GetSingle(x => x.Email == checkUserRequest.Email);

            if (userDetail != null && userDetail.Active == "N")
            {
                _MainResponse.Success = false;
                _MainResponse.Message = $"Account not active: an activation link has been already sent to you email '{userDetail.Email}'. To send actication link again please go to Sign In";
            }
            else if (userDetail !=null && userDetail.Active == "Y" && userDetail.ExternalToken == null && userDetail.Password != null)
            {
                _MainResponse.Success = false;
                _MainResponse.Message = $"Account already registered use your registered email and try manual sign-in";
            }
            else if (userDetail != null && userDetail.Active == "Y")
            {
                // Update information
                _MainResponse.Success = true;
            }
            else if (userDetail == null)
            {
                _MainResponse.Success = true;
                //_MainResponse.Message = "";
            }
            else
            {
                _MainResponse.Success = false;
                _MainResponse.Message = "Some thing went wrong please contact osmosish support.";
            }
            return _MainResponse;
        }
        public async Task<MainResponse> ChangePassword(ChangePasswordRequest changePasswordRequest)
        {
            var userDetail = _UserRepository.GetSingle(x => x.UserId == changePasswordRequest.UserId && x.Password == CommonFunction.EncryptPassword(changePasswordRequest.OldPassword));
            if(changePasswordRequest.OldPassword == changePasswordRequest.NewPassword)
            {
                _MainResponse.Success = false;
                _MainResponse.Message = ErrorMessages.INVALID_NEW_PASSWORD;
            }
            else if (userDetail != null)
            {
                // Update information
                userDetail.ModifiedBy = userDetail.FirstName;
                userDetail.ModifiedDate = DateTime.UtcNow;
                userDetail.Password = CommonFunction.EncryptPassword(changePasswordRequest.NewPassword);
                await _UserRepository.UpdateAsync(userDetail);
                #region Send Email
                var userTemplateDetail = _UserRepository.GetSingle(x => x.UserId == changePasswordRequest.UserId);
                var emailBody = "";
                emailBody = CommonFunction.GetTemplateFromHtml("PasswordChangeConfirmation.html");
                emailBody = emailBody.Replace("{UserName}", Convert.ToString(userTemplateDetail.FirstName));
                emailBody = emailBody.Replace("{UserEmail}", Convert.ToString(userTemplateDetail.Email));

                NotificationHelper.SendEmail(userTemplateDetail.Email, emailBody, "Osmos-ish: Your Password Has Been Updated", true);
                #endregion
                _MainResponse.Message = SuccessMessage.PASSWORD_CHANGE;
            }
            else
            {
                _MainResponse.Message = ErrorMessages.INCORRECT_OLD_PASSWORD;
                _MainResponse.Success = false;
            }
            return _MainResponse;
        }
        public async Task<MainResponse> SignUp(SignUpRequest signUpRequest)
        {
            var userDetail = _UserRepository.GetSingle(x => x.Email == signUpRequest.Email && x.RecordDeleted == "N");
            if (userDetail == null)
            {
                userDetail = new Users();
                // Update information
                string[] spilitfullName = signUpRequest.FullName.Split(new char[0]);
                if (spilitfullName.Length > 0)
                {
                    userDetail.FirstName = spilitfullName[0];
                }
                if (spilitfullName.Length > 1)
                {
                    userDetail.LastName = spilitfullName[1];
                }

                userDetail.Email = signUpRequest.Email;
                userDetail.CreatedBy = userDetail.Email;
                userDetail.VerifyAccountToken = Guid.NewGuid();
                userDetail.VerifyAccountTokenExpiration = DateTime.UtcNow.AddDays(1);

                if (signUpRequest.IsExternalSignUp)
                {
                    userDetail.ExternalToken = signUpRequest.ExternalToken;
                    userDetail.ExternalProvider = signUpRequest.ExternalProvider;
                }
                else
                {
                    userDetail.Password = CommonFunction.EncryptPassword(signUpRequest.Password);
                }

                if (signUpRequest.IsBecomeTutor)
                {
                    userDetail.IsTutor = "Y";
                    userDetail.IsStudent = "Y";
                    userDetail.Teachers.Add(new Teachers() { TeacherId = userDetail.UserId, CreatedBy = userDetail.Email });
                    userDetail.Students.Add(new Students() { StudentId = userDetail.UserId, CreatedBy = userDetail.Email });
                }
                else
                {
                    userDetail.IsStudent = "Y";
                    userDetail.Students.Add(new Students() { StudentId = userDetail.UserId, CreatedBy = userDetail.Email });
                }
                await _UserRepository.AddAsync(userDetail);

                // Send Mail
                var emailBody = CommonFunction.GetTemplateFromHtml("EmailVerification.html");
                emailBody = emailBody.Replace("{FirstName}", userDetail.FirstName);
                emailBody = emailBody.Replace("{VerifyAccountUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/VerifyAccount?Token=" + userDetail.VerifyAccountToken + "&Email=" + userDetail.Email);
                NotificationHelper.SendEmail(userDetail.Email, emailBody, "Osmos-ish: Please Verify Your Email", true);

                //Add Emails to Sendy
                bool isInserted = InsertEmailsToSendy(userDetail);
                _MainResponse.Message = SuccessMessage.User_REGISTERED;
            }
            else
            {
                _MainResponse.Message = ErrorMessages.EMAIL_ALREADY_REGISTERED;
                _MainResponse.Success = false;
            }
            return _MainResponse;
        }
        public bool InsertEmailsToSendy(Users userDetail)
        {
            try
            {
                MySqlConnection mySqlConnection = new MySqlConnection(AppSettingConfigurations.AppSettings.SendyAPIDbConnectionString);
                mySqlConnection.Open();
                DateTime foo = DateTime.Now;
                long unixTime = ((DateTimeOffset)foo).ToUnixTimeSeconds();
                MySqlCommand mySqlCommand = new MySqlCommand("Insert into subscribers(userID,name,email,list,timestamp,confirmed) values(1,@name,@email,1,@timestamp,1)", mySqlConnection);
                mySqlCommand.Parameters.AddWithValue("@email", userDetail.Email);
                mySqlCommand.Parameters.AddWithValue("@name", userDetail.FirstName);
                mySqlCommand.Parameters.AddWithValue("@timestamp", unixTime);
                mySqlCommand.ExecuteNonQuery();
                mySqlConnection.Close();
                return true;
            }
            catch
            {
                return false;
            }
        }
        public async Task<MainResponse> ExternalLogIn(string email, string externalToken, string IPAddress)
        {
            return await _UserRepository.LoginUser(email, null, externalToken, IPAddress);
        }

        public async Task<MainResponse> ContactUs(ContactUsRequest contactUsRequest)
        {
            _MainResponse.Message = SuccessMessage.MESSAGE_SENT_SUCCESSFULLY;
            var emailBody = CommonFunction.GetTemplateFromHtml("ContactUs.html");
            emailBody = emailBody.Replace("{from-email}", contactUsRequest.Email);
            emailBody = emailBody.Replace("{from-name}", contactUsRequest.Name);
            emailBody = emailBody.Replace("{subject}", contactUsRequest.Subject);
            emailBody = emailBody.Replace("{issuesfacing}", contactUsRequest.IssuesFacing);
            emailBody = emailBody.Replace("{message}", contactUsRequest.Message);
            NotificationHelper.SendEmail(AppSettingConfigurations.AppSettings.AdminEmail, emailBody, "Contact Us", true);
            //  NotificationHelper.SendEmail(contactUsRequest.Email, emailBody, "Contact Us", true);
            return _MainResponse;
        }

        public async Task<MainResponse> VerifyAccount(VerifyAccountRequest verifyAccountRequest)
        {
            var userDetail = _UserRepository.GetSingle(x => x.VerifyAccountToken.ToString() == verifyAccountRequest.Token && x.RecordDeleted == "N" && x.Active == "N" && x.VerifyAccountTokenExpiration > DateTime.UtcNow);
            if (userDetail != null)
            {
                // Update information
                userDetail.VerifyAccountToken = null;
                userDetail.VerifyAccountTokenExpiration = null;
                userDetail.Active = "Y";
                userDetail.ModifiedBy = userDetail.Email;
                userDetail.ModifiedDate = DateTime.UtcNow;
                await _UserRepository.UpdateAsync(userDetail);
                _MainResponse.Message = SuccessMessage.ACCOUNT_VERIFIED_SUCCESS;

                var emailBody = "";
                var couponCodeService = new CouponCodeService();

                if (userDetail.IsTutor == "Y")
                {
                    //emailBody = CommonFunction.GetTemplateFromHtml("SignupTutor.html");
                    emailBody = couponCodeService.GetTemplateFromHtml_CouponCode("SignupTutor.html", userDetail.Email);
                }
                else
                {
                    //emailBody = CommonFunction.GetTemplateFromHtml("SignupStudent.html");
                    emailBody = couponCodeService.GetTemplateFromHtml_CouponCode("SignupStudent.html", userDetail.Email);
                }
                emailBody = emailBody.Replace("{NavigationToHome}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl);
                emailBody = emailBody.Replace("{NavigationUrlForStudent}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/CourseSearch");
                emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/CreateTutor");
                emailBody = emailBody.Replace("{NavigationToHome}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl);
                NotificationHelper.SendEmail(userDetail.Email, emailBody, "Your account has been verified", true);
            }
            else
            {
                _MainResponse.Message = ErrorMessages.ACCOUNT_VERIFICATION_LINK_EXPIRED;
                _MainResponse.Success = false;
            }
            return _MainResponse;
        }

        public async Task<MainResponse> ResendAccountVerification(ResendAccountVerificationRequest resendAccountVerificationRequest)
        {
            var userDetail = _UserRepository.GetSingle(x => x.Email == resendAccountVerificationRequest.Email);
            if (userDetail != null)
            {
                if (userDetail.Active == "Y")
                {
                    _MainResponse.Message = ErrorMessages.ALREADY_ACTIVATED;
                    _MainResponse.Success = false;
                }
                else
                {
                    // Update information
                    userDetail.VerifyAccountToken = Guid.NewGuid();
                    userDetail.VerifyAccountTokenExpiration = DateTime.UtcNow.AddDays(1);
                    userDetail.ModifiedBy = userDetail.Email;
                    userDetail.ModifiedDate = DateTime.UtcNow;
                    await _UserRepository.UpdateAsync(userDetail);

                    _MainResponse.Message = SuccessMessage.ACCOUNT_VERIFICATION_EMAIL;
                    var emailBody = CommonFunction.GetTemplateFromHtml("EmailVerification.html");
                    emailBody = emailBody.Replace("{FirstName}", userDetail.FirstName);
                    emailBody = emailBody.Replace("{VerifyAccountUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/VerifyAccount?Token=" + userDetail.VerifyAccountToken + "&Email=" + userDetail.Email);
                    NotificationHelper.SendEmail(userDetail.Email, emailBody, "Osmos-ish: Please Verify Your Email", true);
                }


            }
            else
            {
                _MainResponse.Message = ErrorMessages.EMAIL_NOT_REGISTERED;
                _MainResponse.Success = false;
            }
            return _MainResponse;
        }
        public async Task<MainResponse> AdminLogin(LoginRequest loginRequest)
        {
            string encyptedPassword = CommonFunction.EncryptPassword(loginRequest.Password);
            return await _UserRepository.AdminLoginUser(loginRequest.Email, encyptedPassword);
        }

        public async Task<MainResponse> SendPhoneVerificationToken(SendPhoneVerificationRequest sendPhoneVerificationRequest)
        {
            var userDetail = _UserRepository.GetSingle(x => x.UserId == sendPhoneVerificationRequest.UserId && x.RecordDeleted == "N" && x.Active == "Y");
            var OTPAllowed = Convert.ToInt32(AppSettingConfigurations.AppSettings.OTPRequestAllowed);
            if (userDetail != null)
            {
                if (Convert.ToBoolean(userDetail.IsLockout) && userDetail.OTPCount == OTPAllowed)
                {
                    if (CommonFunction.CheckIn24Hours(userDetail.OTPGeneratedDate))
                    {
                        userDetail.IsLockout = false;
                        userDetail.OTPCount = 0;
                        await _UserRepository.UpdateAsync(userDetail);
                    }
                    else
                    {
                        _MainResponse.Message = "your account is locked please try again after 24 hours";
                        _MainResponse.Success = false;
                        _MainResponse.UserResponse = new UserResponse() { IsLockOut = userDetail.IsLockout, UserId = userDetail.UserId };
                        return _MainResponse;
                    }
                }
                else if (userDetail.OTPCount == Convert.ToInt32(AppSettingConfigurations.AppSettings.OTPRequestAllowed))
                {
                    userDetail.IsLockout = true;
                    await _UserRepository.UpdateAsync(userDetail);
                    _MainResponse.Message = ErrorMessages.OTP_TOKEN_REQUEST_REACHED;
                    _MainResponse.Success = false;
                    _MainResponse.UserResponse = new UserResponse() { IsLockOut = userDetail.IsLockout , UserId = userDetail.UserId};
                    return _MainResponse;

                }
                var phoneNumber = string.IsNullOrWhiteSpace(sendPhoneVerificationRequest.PhoneNumber) ? userDetail.PhoneNumber : sendPhoneVerificationRequest.PhoneNumber;
                var newOTPGenerated = CommonFunction.GenerateCode();
                var resp = SendTwillioSMS.SendSMS("Your Osmos-ish verification code is " + newOTPGenerated + ".", phoneNumber);
                if (resp == "true")
                {
                    _MainResponse.Message = SuccessMessage.PHONE_VERIFICATION_SUCCESS;
                    _MainResponse.Success = true;
                    _MainResponse.UserResponse = new UserResponse() { IsLockOut = userDetail.IsLockout, UserId = userDetail.UserId };
                    userDetail.PhoneNumberVerified = "N";
                    userDetail.PhoneNumberVerificationOtp = newOTPGenerated;
                    userDetail.PhoneNumberOtpexpiration = DateTime.UtcNow.AddDays(1);
                    userDetail.OTPCount += 1;
                    userDetail.OTPGeneratedDate = DateTime.UtcNow;
                    await _UserRepository.UpdateAsync(userDetail);
                }
                else
                {
                    _MainResponse.Message = resp;
                    _MainResponse.Success = false;
                    _MainResponse.UserResponse = new UserResponse() { IsLockOut = userDetail.IsLockout, UserId = userDetail.UserId };
                }
            }
            return _MainResponse;
        }


        public async Task<MainResponse> VerifyPhoneNumberToken(VerifyPhoneNumberTokenRequest verifyPhoneNumberTokenRequest)
        {
            var userDetail = _UserRepository.GetSingle(x => x.UserId == verifyPhoneNumberTokenRequest.UserId && x.RecordDeleted == "N" && x.Active == "Y" && x.PhoneNumberVerificationOtp == verifyPhoneNumberTokenRequest.OTP && x.PhoneNumberOtpexpiration > DateTime.UtcNow);
            if (userDetail != null)
            {
                // Update information
                userDetail.PhoneNumberVerificationOtp = null;
                userDetail.PhoneNumberOtpexpiration = null;
                userDetail.PhoneNumber = verifyPhoneNumberTokenRequest.PhoneNumber;
                userDetail.PhoneNumberVerified = "Y";
                userDetail.ModifiedBy = userDetail.Email;
                userDetail.ModifiedDate = DateTime.UtcNow;
                await _UserRepository.UpdateAsync(userDetail);
                _MainResponse.Message = SuccessMessage.PHONE_NUMBER_VERIFIED_SUCCESS;
            }
            else
            {
                _MainResponse.Message = ErrorMessages.PHONE_VERIFICATION_OTP_EXPIRED;
                _MainResponse.Success = false;
            }
            return _MainResponse;
        }

        public async Task<MainResponse> DeleteUser(DeleteUserRequest deleteUserRequest)
        {
            return await _UserRepository.DeleteUser(deleteUserRequest);
        }

        public async Task<MainResponse> RefreshToken(RefreshTokenRequest refreshTokenRequest)
        {
            return await _UserRepository.RefreshToken(refreshTokenRequest);
        }

        public async Task<MainResponse> RevokeToken(RevokeTokenRequest revokeTokenRequest)
        {
            return await _UserRepository.RevokeToken(revokeTokenRequest);
        }


    }
}
