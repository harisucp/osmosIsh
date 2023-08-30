using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;

namespace OsmosIsh.Service.IService
{
    public interface IChatMessageService
    {
        Task<MainResponse> UpdateMessageStatus(UpdateMessageStatus updateMessageStatus);
        
    }
}
