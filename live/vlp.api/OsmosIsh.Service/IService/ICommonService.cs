using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.DTOs.Response.Common;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.IService
{
    public interface ICommonService
    {
        event OsmosIsh.Service.Service.CommonService.PreSaveEventHandler PreSaved;
        Task<MainResponse> SaveUpdateEntity(SaveRequest request);
        MainResponse GetData(GetRequest request);
        MainResponse GetNotifications(GetRequest request);
    }
}
