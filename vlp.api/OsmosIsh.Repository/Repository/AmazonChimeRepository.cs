using AutoMapper;
using Dapper;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Repository.IRepository;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.Repository
{
    public class AmazonChimeRepository : IAmazonChimeRepository
    {
        #region readonly
        private readonly IMapper _Mapper;
        #endregion

        OsmosIshContext _ObjContext;
        MainResponse _MainResponse = null;


        public AmazonChimeRepository(OsmosIshContext ObjContext, IMapper Mapper) 
        {
            _MainResponse = new MainResponse();
            _ObjContext = ObjContext;
            _Mapper = Mapper;
        }

        public async Task<ValidateMeetingResponse> ValidateCreateMeeting(AmazonChimeMeetingRequest amazonChimeMeetingRequest)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@sessionid", amazonChimeMeetingRequest.SessionId);
                dynamicParameters.Add("@userid", amazonChimeMeetingRequest.UserId);

                // Excute store procedure
                var response = db.Query("sp_ValidateCreateMeeting", dynamicParameters, commandType: CommandType.StoredProcedure).First();
                return CommonFunction.DeserializedDapperObject<ValidateMeetingResponse>(response);
            }
        }

        public async Task<ValidateMeetingResponse> ValidateJoinMeeting(AmazonChimeMeetingRequest amazonChimeMeetingRequest)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@sessionid", amazonChimeMeetingRequest.SessionId);
                dynamicParameters.Add("@userid", amazonChimeMeetingRequest.UserId);

                // Excute store procedure
                var response = db.Query("sp_ValidateJoinMeeting", dynamicParameters, commandType: CommandType.StoredProcedure).First();
                return CommonFunction.DeserializedDapperObject<ValidateMeetingResponse>(response);
            }
        }

        public async Task<ValidateMeetingResponse> ValidateEndMeeting(AmazonChimeMeetingRequest amazonChimeMeetingRequest)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@sessionid", amazonChimeMeetingRequest.SessionId);
                dynamicParameters.Add("@userid", amazonChimeMeetingRequest.UserId);

                // Excute store procedure
                var response = db.Query("sp_ValidateEndMeeting", dynamicParameters, commandType: CommandType.StoredProcedure).First();
                return CommonFunction.DeserializedDapperObject<ValidateMeetingResponse>(response);
            }

        }

        public async Task EndMeeting(int? meetingId)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@meetingId", meetingId);

                // Excute store procedure
                await db.ExecuteAsync("sp_EndMeeting", dynamicParameters, commandType: CommandType.StoredProcedure);
            }

        }

    }
}
