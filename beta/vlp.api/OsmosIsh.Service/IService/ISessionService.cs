using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.IService
{
    public interface ISessionService
    {
        Task<MainResponse> CreateUpdateSession(CreateUpdateSessionRequest createUpdateSessionRequest);
        Task<MainResponse> GeneratePrivateSessionRequest(PrivateSessionRequest privateSessionRequest);
        Task<MainResponse> DenyPrivateSessionRequest(DenySessionRequest denySessionRequest);
        Task<MainResponse> SessionReviewRating(SessionReviewRatingRequest sessionReviewRatingRequest);
        Task<MainResponse> CreateUpdatePrivateSessionAvailableSlots(PrivateSessionAvailableDayRequest privateSessionAvailableDayRequest);
        Task<MainResponse> AcceptPrivateSessionRequest(AcceptSessionRequest acceptSessionRequest);
    }
}
