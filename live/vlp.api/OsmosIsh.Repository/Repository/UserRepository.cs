using AutoMapper;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Data.DBEntities;
using OsmosIsh.Repository.IRepository;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.Repository
{
    public class UserRepository : BaseRepository<Users>, IUserRepository
    {
        #region readonly
        private readonly IMapper _Mapper;
        #endregion

        OsmosIshContext _ObjContext;
        MainResponse _MainResponse = null;


        public UserRepository(OsmosIshContext ObjContext, IMapper Mapper) : base(ObjContext)
        {
            _MainResponse = new MainResponse();
            _ObjContext = ObjContext;
            _Mapper = Mapper;
        }

        public async Task LogUserActivity(UserActivities userActivities)
        {
            _ObjContext.UserActivities.Add(userActivities);
            await _ObjContext.SaveChangesAsync();
        }


        public async Task<MainResponse> LoginUser(String email, string password, string externalToken, string IPAddress)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@Email", email);
                dynamicParameters.Add("@Password", password);
                dynamicParameters.Add("@ExternalToken", externalToken);

                var result = db.Query("sp_LoginUser", dynamicParameters, commandType: CommandType.StoredProcedure).FirstOrDefault();
                if (result.Message == null)
                {
                    _MainResponse.UserResponse = CommonFunction.DeserializedDapperObject<UserResponse>(result);
                    _MainResponse.UserResponse.RefreshToken = CreateUserRefereshToken(_MainResponse.UserResponse.UserId, IPAddress);
                    _MainResponse.Message = SuccessMessage.LOGIN_SUCCESS;
                }
                else
                {
                    _MainResponse.Message = result.Message;
                    _MainResponse.Success = false;
                }
            }
            return _MainResponse;
        }

        public async Task<MainResponse> AdminLoginUser(String email, string password)
        {
            var adminUserResponse = new AdminUserResponse();
            var credentialMatched = AppSettingConfigurations.AppSettings.AdminCredentials.Where(x => x.Email == email && x.Password == password).Any();
            if (credentialMatched)
            {
                adminUserResponse.UserId = 1;
                _MainResponse.AdminUserResponse = adminUserResponse;
                _MainResponse.Success = true;
                _MainResponse.Message = SuccessMessage.LOGIN_SUCCESS;
            }
            else
            {
                _MainResponse.Success = false;
            }
            return _MainResponse;
        }

        public async Task<MainResponse> DeleteUser(DeleteUserRequest deleteUserRequest)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@StudentId", deleteUserRequest.StudentId);
                dynamicParameters.Add("@TeacherId", deleteUserRequest.TeacherId);
                dynamicParameters.Add("@ActionPerformedBy", deleteUserRequest.ActionPerformedBy);
                dynamicParameters.Add("@ForceDelete", deleteUserRequest.ForceDelete);
                var result = db.Query("sp_DeleteStudentTutor", dynamicParameters, commandType: CommandType.StoredProcedure).FirstOrDefault();
                BaseResponse resultResponse = CommonFunction.DeserializedDapperObject<BaseResponse>(result);
                _MainResponse.Message = resultResponse.Message;
                _MainResponse.Success = resultResponse.Success;
            }
            return _MainResponse;
        }

        public async Task<MainResponse> RefreshToken(RefreshTokenRequest refreshTokenRequest)
        {
            var userRefreshToken = _ObjContext.UserRefreshToken.First(u => u.RefershToken == refreshTokenRequest.RefreshToken && u.RevokedDate == null && u.ExpiryDate > DateTime.UtcNow);

            // replace old refresh token with a new one and save
            //var newRefreshToken = CreateUserRefereshToken(userRefreshToken.UserId, refreshTokenRequest.IPAddress);

            // userRefreshToken.RevokedDate = DateTime.UtcNow;
            // userRefreshToken.RevokedByIp = refreshTokenRequest.IPAddress;
            userRefreshToken.ExpiryDate = DateTime.UtcNow.AddDays(7);

            _ObjContext.UserRefreshToken.Update(userRefreshToken);
            _ObjContext.SaveChanges();

            var user = _ObjContext.Users.First(u => u.UserId == userRefreshToken.UserId && u.Active == "Y");

            _MainResponse.RefershTokenResponse = new RefershTokenResponse 
            {
                RefreshToken = userRefreshToken.RefershToken,
                UserId = user.UserId,
                Email = user.Email
            };

            return _MainResponse;
        }



        private string CreateUserRefereshToken(int userId, string ipAddress)
        {
            var newRefreshtoken = CommonFunction.GenerateRefreshToken();
            var userRefreshToken = new UserRefreshToken
            {
                UserId = userId,
                RefershToken = newRefreshtoken,
                CreatedByIp = ipAddress,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                CreatedDate = DateTime.UtcNow,
            };

            _ObjContext.UserRefreshToken.Add(userRefreshToken);
            var saved = _ObjContext.SaveChanges();
            if (saved == -1) throw new Exception("Error while generating Refresh token");
            return newRefreshtoken;
        }

        public async Task<MainResponse> RevokeToken(RevokeTokenRequest revokeTokenRequest)
        {
            var userRefreshToken = _ObjContext.UserRefreshToken.First(u => u.RefershToken == revokeTokenRequest.RefreshToken && u.RevokedDate == null && u.ExpiryDate < DateTime.UtcNow);

            userRefreshToken.RevokedDate = DateTime.UtcNow;
            userRefreshToken.RevokedByIp = revokeTokenRequest.IPAddress;

            _ObjContext.UserRefreshToken.Update(userRefreshToken);
            _ObjContext.SaveChanges();

            _MainResponse.Success = true;
            return _MainResponse;
        }

    }
}
