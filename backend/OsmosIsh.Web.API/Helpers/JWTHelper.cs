using Microsoft.IdentityModel.Tokens;
using OsmosIsh.Core.Shared.Static;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Web.API.Helpers
{
    public static class JWTHelper
    {
        public static string GenerateJSONWebToken(Dictionary<string, string> tokenClaims = null)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(AppSettingConfigurations.AppSettings.Secret));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            if (tokenClaims == null) tokenClaims = new Dictionary<string, string>();
            var claims = new List<Claim>();

            foreach (var claim in tokenClaims) claims.Add(new Claim(claim.Key, claim.Value));

            var token = new JwtSecurityToken(AppSettingConfigurations.AppSettings.ValidIssuer,
                                            AppSettingConfigurations.AppSettings.ValidAudience,
                                            claims,
                                            expires: DateTime.UtcNow.AddMinutes(Convert.ToInt32(AppSettingConfigurations.AppSettings.Timeout)),
                                            signingCredentials: credentials
                                            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }


        public static string GetClaim(this ClaimsPrincipal user, string claimType)
        {
            try
            {
                return user.FindFirst(claimType).Value;
            }
            catch(Exception ex)
            {
                return null;
            }
        }

        public static string GetUserId(this ClaimsPrincipal user) => user.FindFirst("UserId").Value;
    }
}
