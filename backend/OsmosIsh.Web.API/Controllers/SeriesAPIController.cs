using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using OsmosIsh.Core.Shared.Static;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Service.IService;
using Microsoft.AspNetCore.Authorization;

namespace OsmosIsh.Web.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize]
    public class SeriesAPIController : ControllerBase
    {
        #region readonly
        private readonly ISeriesService _SeriesService;
        private MainResponse _MainResponse;
        #endregion

        #region Private
        private string _JsonString = string.Empty;
        #endregion


        public SeriesAPIController(ISeriesService SeriesService)
        {
            _SeriesService = SeriesService;
            _MainResponse = new MainResponse();
        }

        /// <summary>
        /// This API is used to create Series.
        /// </summary>
        /// <param name="createSeriesRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("CreateSeries")]
        [ActionName("CreateSeries")]
        public async Task<ActionResult> CreateSeries([FromForm]CreateSeriesRequest createSeriesRequest)
        {
            _MainResponse = await _SeriesService.CreateSeries(createSeriesRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

        /// <summary>
        /// This API is used to update Series.
        /// </summary>
        /// <param name="UpdateSeriesDetail"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("UpdateSeriesDetail")]
        [ActionName("UpdateSeriesDetail")]
        public async Task<ActionResult> UpdateSeriesDetail([FromForm]UpdateSeriesDetailRequest updateSeriesDetailRequest)
        {
            _MainResponse = await _SeriesService.UpdateSeriesDetail(updateSeriesDetailRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

        /// <summary>
        /// This API is used to update Series session.
        /// </summary>
        /// <param name="updateSeriesSessionDetailRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("UpdateSeriesSessionDetail")]
        [ActionName("UpdateSeriesSessionDetail")]
        public async Task<ActionResult> UpdateSeriesSessionDetail([FromForm]UpdateSeriesSessionDetailRequest updateSeriesSessionDetailRequest)
        {
            _MainResponse = await _SeriesService.UpdateSeriesSessionDetail(updateSeriesSessionDetailRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
    }
}