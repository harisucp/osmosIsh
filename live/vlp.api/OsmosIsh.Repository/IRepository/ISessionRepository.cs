using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.IRepository
{
    public interface ISessionRepository
    {
        Task<MainResponse> CreateUpdateSession(CreateUpdateSessionRequest createUpdateSessionRequest);
        Task<MainResponse> ValidateSession(CreateUpdateSessionRequest createUpdateSessionRequest);
        Task<MainResponse> GeneratePrivateSessionRequest(PrivateSessionRequest privateSessionRequest);
        Task<MainResponse> SessionReviewRating(SessionReviewRatingRequest sessionReviewRatingRequest);
        Task<MainResponse> DenyPrivateSessionRequest(DenySessionRequest denySessionRequest);
        Task<MainResponse> CreateUpdatePrivateSessionAvailableSlots(PrivateSessionAvailableDayRequest privateSessionAvailableDayRequest);
        Task<MainResponse> ValidatePrivateSessionSlotExits(PrivateSessionRequest privateSessionRequest);
        Task<MainResponse> ValidatePrivateSessionRequestOverlapping(PrivateSessionRequest privateSessionRequest);
        Task<MainResponse> AcceptPrivateSessionRequest(AcceptSessionRequest acceptSessionRequest);
    }
}
