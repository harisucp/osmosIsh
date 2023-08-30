using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Service.IService;
using OsmosIsh.Core.Shared.Static;

namespace OsmosIsh.Web.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class SubscriptionAPIController : ControllerBase
    {

        #region readonly
        private readonly ISubscriptionService _SubscriptionService;
        private MainResponse _MainResponse;
        #endregion

        #region Private
        private string _JsonString = string.Empty;
        #endregion


        public SubscriptionAPIController(ISubscriptionService SubscriptionService)
        {
            _SubscriptionService = SubscriptionService;
            _MainResponse = new MainResponse();
        }


        /// <summary>
        /// This API is used to scribed user with application.
        /// </summary>
        /// <param name="subscribeEmailRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("SubscribeEmail")]
        [ActionName("SubscribeEmail")]
        public async Task<ActionResult> SubscribeEmail(SubscribeEmailRequest subscribeEmailRequest)
        {
            _MainResponse = await _SubscriptionService.SubscribeEmail(subscribeEmailRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }


        /// <summary>
        /// This API is used to unsubscribed email.
        /// </summary>
        /// <param name="UpdateSubscribeEmailRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("UpdateSubscribeEmail")]
        [ActionName("UpdateSubscribeEmail")]
        public async Task<ActionResult> UpdateSubscribeEmail(UpdateSubscribeEmailRequest updateSubscribeEmailRequest)
        {
            _MainResponse = await _SubscriptionService.UpdateSubscribeEmail(updateSubscribeEmailRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
        
        /// <summary>
        /// This API is used to scribed user with application and sendy.
        /// </summary>
        /// <param name="subscribeEmailToSendyRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("SubscribeEmailToSendy")]
        [ActionName("SubscribeEmailToSendy")]
        public async Task<ActionResult> SubscribeEmailToSendy(SubscribeEmailToSendyRequest subscribeEmailToSendyRequest)
        {
            _MainResponse = await _SubscriptionService.SubscribeEmailToSendy(subscribeEmailToSendyRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
    }
}