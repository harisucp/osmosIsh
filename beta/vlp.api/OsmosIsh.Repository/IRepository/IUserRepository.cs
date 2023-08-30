using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Data.DBEntities;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.IRepository
{
    public interface IUserRepository: IBaseRepository<Users>
    {
        Task LogUserActivity(UserActivities userActivities);
        Task<MainResponse> LoginUser(String email, string password, string externalToken, string IPAddress);
        Task<MainResponse> AdminLoginUser(String email, string password);
        Task<MainResponse> DeleteUser(DeleteUserRequest deleteUserRequest);
        Task<MainResponse> RefreshToken(RefreshTokenRequest refreshTokenRequest);
        Task<MainResponse> RevokeToken(RevokeTokenRequest revokeTokenRequest);
    }
}
