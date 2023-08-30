using AutoMapper;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Repository.IRepository;
using OsmosIsh.Service.IService;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.Service
{
    public class ChatMessageService : IChatMessageService
    {
        #region readonly
        private readonly IChatMessageRepository _ChatMessageRepository;
        private readonly IMapper _Mapper;
        #endregion

        #region Private
        private MainResponse _MainResponse;
        public OsmosIshContext _ObjContext;
        #endregion
        public ChatMessageService(IChatMessageRepository UserRepository, IMapper Mapper, OsmosIshContext ObjContext)
        {
            _ChatMessageRepository = UserRepository;
            _Mapper = Mapper;
            _MainResponse = new MainResponse();
            _ObjContext = ObjContext;
        }

        public Task<MainResponse> UpdateMessageStatus(UpdateMessageStatus updateMessageStatus)
        {
            return _ChatMessageRepository.UpdateMessageStatus(updateMessageStatus);
        }
        

    }
}
