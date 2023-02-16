using AutoMapper;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Repository.IRepository;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.IService
{
    public class SeriesService: ISeriesService
    {
        #region readonly
        private readonly ISeriesRepository _SeriesRepository;
        private readonly IMapper _Mapper;
        #endregion

        #region Private
        private MainResponse _MainResponse;
        public OsmosIshContext _ObjContext;
        #endregion
        public SeriesService(ISeriesRepository UserRepository, IMapper Mapper, OsmosIshContext ObjContext)
        {
            _SeriesRepository = UserRepository;
            _Mapper = Mapper;
            _MainResponse = new MainResponse();
            _ObjContext = ObjContext;
        }

        public async Task<MainResponse> CreateSeries(CreateSeriesRequest createSeriesRequest)
        {
            _MainResponse = await _SeriesRepository.ValidateCreateSeries(createSeriesRequest);
            return _MainResponse;
        }

        public async Task<MainResponse> UpdateSeriesDetail(UpdateSeriesDetailRequest updateSeriesDetailRequest)
        {
            return await _SeriesRepository.UpdateSeriesDetail(updateSeriesDetailRequest);
        }

        public async Task<MainResponse> UpdateSeriesSessionDetail(UpdateSeriesSessionDetailRequest updateSeriesSessionDetailRequest)
        {
            return await _SeriesRepository.UpdateSeriesSessionDetail(updateSeriesSessionDetailRequest);
        }
    }
}
