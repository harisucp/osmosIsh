using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.IRepository
{
    public interface IAmazonChimeRepository
    {
        Task<ValidateMeetingResponse> ValidateCreateMeeting(AmazonChimeMeetingRequest amazonChimeMeetingRequest);
        Task<ValidateMeetingResponse> ValidateJoinMeeting(AmazonChimeMeetingRequest amazonChimeMeetingRequest);
        Task<ValidateMeetingResponse> ValidateEndMeeting(AmazonChimeMeetingRequest amazonChimeMeetingRequest);
        Task EndMeeting(int? meetingId);
    }
}
