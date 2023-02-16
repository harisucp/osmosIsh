using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using OsmosIsh.Service.IService;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using OsmosIsh.Core.DTOs.Response.Common;
using OsmosIsh.Core.Shared.Helper;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Service.Common.CommonSave;
using OsmosIsh.Service.Service;
using static OsmosIsh.Service.Service.CommonService;

namespace OsmosIsh.Web.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize]
    public class ChatMessageController : ControllerBase
    {
        #region readonly
        private IChatMessageService _ChatMessageService;
        #endregion

        #region private
        private MainResponse _MainResponse;
        private string _JsonString = string.Empty;
        #endregion


        public ChatMessageController(IChatMessageService ChatMessageService)
        {
            _ChatMessageService = ChatMessageService;
            _MainResponse = new MainResponse();
        }

        /// <summary>
        /// This API is used to update Teacher profile.
        /// </summary>
        /// <param name="updateTeacherProfileRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("UpdateMessageStatus")]
        [ActionName("UpdateMessageStatus")]
        public async Task<ActionResult> UpdateMessageStatus(UpdateMessageStatus updateMessageStatus)
        {
            _MainResponse = await _ChatMessageService.UpdateMessageStatus(updateMessageStatus);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
      

    }
}
