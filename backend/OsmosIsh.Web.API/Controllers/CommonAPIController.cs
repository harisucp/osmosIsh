using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.DTOs.Response.Common;
using OsmosIsh.Core.Shared.Helper;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Service.Common.CommonSave;
using OsmosIsh.Service.IService;
using OsmosIsh.Service.Service;
using static OsmosIsh.Service.Service.CommonService;

namespace OsmosIsh.Web.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class CommonAPIController : ControllerBase
    {
        #region readonly
        private ICommonService _CommonService;
        #endregion

        #region private
        private MainResponse _MainResponse;
        private string _JsonString = string.Empty;
        #endregion

        public CommonAPIController(ICommonService CommonService)
        {
            _CommonService = CommonService;
            _MainResponse = new MainResponse();
        }

        /// <summary>
        /// This API is used for Save/Update all Entity exists in Database.
        /// </summary>
        /// <param name="request"></param>
        //[Authorize]
       

        [HttpPost]
        [Route("SaveUpdateEntity")]
        [ActionName("SaveUpdateEntity")]
        public async Task<ActionResult> SaveUpdateEntity([FromBody]SaveRequest request)
        {
            BindPreCommonSaveEvent.BindPreEvent(request, ref _CommonService);
            _MainResponse = await _CommonService.SaveUpdateEntity(request);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
        /// <summary>
        /// This API is used for Get data for particular screen.
        /// </summary>
        /// <param name="request"></param>
        [Authorize]
        [HttpPost]
        [Route("GetData")]
        [ActionName("GetData")]
        public  ActionResult GetData([FromBody]GetRequest request)
        {
            _MainResponse =  _CommonService.GetData(request);
            _JsonString = Mapper.Convert<DataResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }


        /// <summary>
        /// This API is used for Get data for particular screen.
        /// </summary>
        /// <param name="request"></param>
        [HttpPost]
        [Route("GetUnauthorizedData")]
        [ActionName("GetUnauthorizedData")]
        public ActionResult GetUnauthorizedData([FromBody] GetRequest request)
        {
            _MainResponse =  _CommonService.GetData(request);
            _JsonString = Mapper.Convert<DataResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

        /// <summary>
        /// This API is used for Get data for particular screen.
        /// </summary>
        /// <param name="request"></param>
        [HttpPost]
        [Route("GetUnauthorizedNotifications")]
        [ActionName("GetUnauthorizedNotifications")]
        public ActionResult GetUnauthorizedNotifications([FromBody] GetRequest request)
        {
            _MainResponse = _CommonService.GetNotifications(request);
            _JsonString = Mapper.Convert<DataResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
    }
}