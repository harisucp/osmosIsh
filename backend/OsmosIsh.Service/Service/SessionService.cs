using AutoMapper;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Data.DBEntities;
using OsmosIsh.Repository.IRepository;
using OsmosIsh.Service.IService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.Service
{
    public class SessionService : ISessionService
    {
        #region readonly
        private readonly ISessionRepository _SessionRepository;
        private readonly IMapper _Mapper;
        #endregion

        #region Private
        private MainResponse _MainResponse;
        public OsmosIshContext _ObjContext;
        #endregion
        public SessionService(ISessionRepository UserRepository, IMapper Mapper, OsmosIshContext ObjContext)
        {
            _SessionRepository = UserRepository;
            _Mapper = Mapper;
            _MainResponse = new MainResponse();
            _ObjContext = ObjContext;
        }

        public async Task<MainResponse> CreateUpdateSession(CreateUpdateSessionRequest createUpdateSessionRequest)
        {
            _MainResponse = await _SessionRepository.ValidateSession(createUpdateSessionRequest);
            if (_MainResponse.Success)
            {
                _MainResponse = await _SessionRepository.CreateUpdateSession(createUpdateSessionRequest);
                if (createUpdateSessionRequest.OtherStartTime != null && createUpdateSessionRequest.OtherStartTime.Count > 0)
                {
                    for (int i = 0; i < createUpdateSessionRequest.OtherStartTime.Count; i++)
                    {
                        createUpdateSessionRequest.SessionId = -1;
                        createUpdateSessionRequest.StartTime = Convert.ToDateTime(createUpdateSessionRequest.OtherStartTime[i]);
                        createUpdateSessionRequest.SendMail = false;
                        _MainResponse = await _SessionRepository.CreateUpdateSession(createUpdateSessionRequest);
                    }
                }
            }
            return _MainResponse;
        }
        public async Task<MainResponse> GeneratePrivateSessionRequest(PrivateSessionRequest privateSessionRequest)
        {
            _MainResponse = await _SessionRepository.ValidatePrivateSessionSlotExits(privateSessionRequest);
            if (_MainResponse.Success)
            {
                _MainResponse = await _SessionRepository.ValidatePrivateSessionRequestOverlapping(privateSessionRequest);
                if (_MainResponse.Success)
                {
                    return await _SessionRepository.GeneratePrivateSessionRequest(privateSessionRequest);
                }
            }
            return _MainResponse;
        }

        public async Task<MainResponse> SessionReviewRating(SessionReviewRatingRequest sessionReviewRatingRequest)
        {
            return await _SessionRepository.SessionReviewRating(sessionReviewRatingRequest);
        }

        public async Task<MainResponse> DenyPrivateSessionRequest(DenySessionRequest denySessionRequest)
        {
            return await _SessionRepository.DenyPrivateSessionRequest(denySessionRequest);

        }
        
        public async Task<MainResponse> CreateUpdatePrivateSessionAvailableSlots(PrivateSessionAvailableDayRequest privateSessionAvailableDayRequest)
        {
            return await _SessionRepository.CreateUpdatePrivateSessionAvailableSlots(privateSessionAvailableDayRequest);
        }

        public async Task<MainResponse> AcceptPrivateSessionRequest(AcceptSessionRequest acceptSessionRequest)
        {
            return await _SessionRepository.AcceptPrivateSessionRequest(acceptSessionRequest);
        }

    }
}
