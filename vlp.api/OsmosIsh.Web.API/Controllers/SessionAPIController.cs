using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Service.IService;

namespace OsmosIsh.Web.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize]
    public class SessionAPIController : ControllerBase
    {

        #region readonly
        private readonly ISessionService _SessionService;
        private MainResponse _MainResponse;
        #endregion

        #region Private
        private string _JsonString = string.Empty;
        #endregion


        public SessionAPIController(ISessionService SessionService)
        {
            _SessionService = SessionService;
            _MainResponse = new MainResponse();
        }

        /// <summary>
        /// This API is used to create and update session.
        /// </summary>
        /// <param name="createUpdateSessionRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("CreateUpdateSession")]
        [ActionName("CreateUpdateSession")]
        public async Task<ActionResult> CreateUpdateSession([FromForm]CreateUpdateSessionRequest createUpdateSessionRequest)
        {
            _MainResponse = await _SessionService.CreateUpdateSession(createUpdateSessionRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
        /// <summary>
        /// This API is used to generate private session request.
        /// </summary>
        /// <param name="privateSessionRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("PrivateSessionRequest")]
        [ActionName("PrivateSessionRequest")]
        public async Task<ActionResult> GeneratePrivateSessionRequest(PrivateSessionRequest privateSessionRequest)
        {
            _MainResponse = await _SessionService.GeneratePrivateSessionRequest(privateSessionRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

        /// <summary>
        /// This API is used to generate private session request.
        /// </summary>
        /// <param name="denySessionRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("DenyPrivateSessionRequest")]
        [ActionName("DenyPrivateSessionRequest")]
        public async Task<ActionResult> DenyPrivateSessionRequest(DenySessionRequest drivateSessionRequest)
        {
            _MainResponse = await _SessionService.DenyPrivateSessionRequest(drivateSessionRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }


        /// <summary>
        /// This API is used for session review request.
        /// </summary>
        /// <param name="sessionReviewRatingRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("SessionReviewRating")]
        [ActionName("SessionReviewRating")]
        public async Task<ActionResult> SessionReviewRating(SessionReviewRatingRequest sessionReviewRatingRequest)
        {
            _MainResponse = await _SessionService.SessionReviewRating(sessionReviewRatingRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

        // <summary>
        /// This API is used for select availability private session.
        /// </summary>
        /// <param name="sessionReviewRatingRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("CreateUpdatePrivateSessionAvailableSlots")]
        [ActionName("CreateUpdatePrivateSessionAvailableSlots")]
        public async Task<ActionResult> CreateUpdatePrivateSessionAvailableSlots(PrivateSessionAvailableDayRequest privateSessionAvailableDayRequest)
        {
            _MainResponse = await _SessionService.CreateUpdatePrivateSessionAvailableSlots(privateSessionAvailableDayRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }



        // <summary>
        /// This API is used for accepet private session.
        /// </summary>
        /// <param name="acceptSessionRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("AcceptPrivateSessionRequest")]
        [ActionName("AcceptPrivateSessionRequest")]
        public async Task<ActionResult> AcceptPrivateSessionRequest(AcceptSessionRequest acceptSessionRequest)
        {
            _MainResponse = await _SessionService.AcceptPrivateSessionRequest(acceptSessionRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
    }
}