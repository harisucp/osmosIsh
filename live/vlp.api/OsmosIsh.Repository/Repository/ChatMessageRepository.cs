using AutoMapper;
using OsmosIsh.Data.DBEntities;
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Repository.IRepository;
using OsmosIsh.Data.DBContext;
using System.IO;
using System.Threading.Tasks;
using System.Linq;
using System.Data;
using OsmosIsh.Core.Shared.Static;
using Dapper;

namespace OsmosIsh.Repository.Repository
{
    public class ChatMessageRepository : BaseRepository<Messages>, IChatMessageRepository
    {

        #region readonly
        private readonly IMapper _Mapper;
        #endregion

        OsmosIshContext _ObjContext;
        MainResponse _MainResponse = null;

        public ChatMessageRepository(OsmosIshContext ObjContext, IMapper Mapper) : base(ObjContext)
        {
            _MainResponse = new MainResponse();
            _ObjContext = ObjContext;
            _Mapper = Mapper;
        }
        public async Task<MainResponse> UpdateMessageStatus(UpdateMessageStatus updateMessageStatus)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@json", updateMessageStatus.ChatMessage);

                // Excute store procedure
                await db.ExecuteAsync("sp_UpdateChatMessage", dynamicParameters, commandType: CommandType.StoredProcedure);
            }

            _MainResponse.Message = await _ObjContext.SaveChangesAsync() > 0 ? SuccessMessage.MESSAGE_STATUS_UPDATED : ErrorMessages.MESSAGE_STATUS_NOT_UPDATED;
            return _MainResponse;
        }
    }
}