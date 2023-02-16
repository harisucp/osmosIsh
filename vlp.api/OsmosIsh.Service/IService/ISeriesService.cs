using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.IService
{
    public interface ISeriesService
    {
        Task<MainResponse> CreateSeries(CreateSeriesRequest createSeriesRequest);
        Task<MainResponse> UpdateSeriesDetail(UpdateSeriesDetailRequest updateSeriesDetailRequest);
        Task<MainResponse> UpdateSeriesSessionDetail(UpdateSeriesSessionDetailRequest updateSeriesSessionDetailRequest);
    }
}
