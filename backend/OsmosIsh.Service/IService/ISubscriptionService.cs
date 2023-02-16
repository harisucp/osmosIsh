using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.IService
{
    public interface ISubscriptionService
    {
        Task<MainResponse> SubscribeEmail(SubscribeEmailRequest subscribeEmailRequest);
        Task<MainResponse> UpdateSubscribeEmail(UpdateSubscribeEmailRequest updateSubscribeEmailRequest);
        Task<MainResponse> SubscribeEmailToSendy(SubscribeEmailToSendyRequest subscribeEmailToSendyRequest);
    }
}
