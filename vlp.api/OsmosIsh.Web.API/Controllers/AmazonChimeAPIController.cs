using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon;
using Amazon.Chime;
using Amazon.Chime.Model;
using Amazon.Runtime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Service.IService;
using OsmosIsh.Web.API.Helpers;

namespace OsmosIsh.Web.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
     [Authorize]
    public class AmazonChimeAPIController : ControllerBase
    {

        #region readonly
        private readonly IAmazonChimeService _AmazonChimeService;
        private MainResponse _MainResponse;
        #endregion

        #region Private
        private string _JsonString = string.Empty;
        #endregion


        public AmazonChimeAPIController(IAmazonChimeService AmazonChimeService)
        {
            _AmazonChimeService = AmazonChimeService;
            _MainResponse = new MainResponse();
        }

        /// <summary>
        /// This API is used for create meeting.
        /// </summary>
        /// <param name="amazonChimeMeetingRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("CreateMeeting")]
        [ActionName("CreateMeeting")]
        public async Task<ActionResult> CreateMeeting(AmazonChimeMeetingRequest amazonChimeMeetingRequest)
        {
            amazonChimeMeetingRequest.UserId = Convert.ToInt32(User.GetUserId());
            _MainResponse = await _AmazonChimeService.CreateMeeting(amazonChimeMeetingRequest);
            _JsonString = Mapper.Convert<JoinInfo>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

        /// <summary>
        /// This API is used to for Join meeting.
        /// </summary>
        /// <param name="amazonChimeMeetingRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("JoinMeeting")]
        [ActionName("JoinMeeting")]
        public async Task<ActionResult> JoinMeeting(AmazonChimeMeetingRequest amazonChimeMeetingRequest)
        {
            amazonChimeMeetingRequest.UserId = Convert.ToInt32(User.GetUserId());
            _MainResponse = await _AmazonChimeService.JoinMeeting(amazonChimeMeetingRequest);
            _JsonString = Mapper.Convert<JoinInfo>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

        /// <summary>
        /// This API is used for end meeting.
        /// </summary>
        /// <param name="amazonChimeMeetingRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("EndMeeting")]
        [ActionName("EndMeeting")]
        public async Task<ActionResult> EndMeeting(AmazonChimeMeetingRequest amazonChimeMeetingRequest)
        {
            amazonChimeMeetingRequest.UserId = Convert.ToInt32(User.GetUserId());
            _MainResponse = await _AmazonChimeService.EndMeeting(amazonChimeMeetingRequest);
            _JsonString = Mapper.Convert<JoinInfo>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
    }
}   