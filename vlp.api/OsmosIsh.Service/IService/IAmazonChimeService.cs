using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Data.DBEntities;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.IService
{
    public interface IAmazonChimeService
    {
        Task<MainResponse> CreateMeeting(AmazonChimeMeetingRequest amazonChimeMeetingRequest);
        Task<MainResponse> JoinMeeting(AmazonChimeMeetingRequest amazonChimeMeetingRequest);
        Task<MainResponse> EndMeeting(AmazonChimeMeetingRequest amazonChimeMeetingRequest);
    }
}
