using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.DTOs.Response.Common;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.IRepository
{
    public interface ICommonRepository
    {
        Task<MainResponse> SaveUpdateEntity(SaveRequest request);
        event OsmosIsh.Repository.Repository.CommonRepository.PostSaveEventHandler PostSaved;
        MainResponse GetData(GetRequest request);
        MainResponse GetNotifications(GetRequest request);
    }
}
