using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.IRepository
{
    public interface ISeriesRepository
    {
        Task<MainResponse> CreateSeries(CreateSeriesRequest createSeriesRequest, List<DateTime> recurrenceDates);
        Task<MainResponse> UpdateSeriesDetail(UpdateSeriesDetailRequest updateSeriesDetailRequest);
        Task<MainResponse> ValidateCreateSeries(CreateSeriesRequest createSeriesRequest);
        Task<MainResponse> UpdateSeriesSessionDetail(UpdateSeriesSessionDetailRequest updateSeriesSessionDetailRequest);
    }
}
