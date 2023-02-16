using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Service.IService;
using OsmosIsh.Service.Service;

namespace OsmosIsh.Web.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AdminAffiliateAPIController : ControllerBase
    {
        #region readonly
        private IAdminAffiliateService _AdminAffiliateService;
        #endregion

        #region private
        private MainResponse _MainResponse;
        private string _JsonString = string.Empty;
        #endregion

        public AdminAffiliateAPIController(IAdminAffiliateService AdminAffiliateService)
        {
            _AdminAffiliateService = AdminAffiliateService;
            _MainResponse = new MainResponse();
        }

        /// <summary>
        /// This API is used to create and update affiliate.
        /// </summary>
        /// <param name="createUpdateAffiliateRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("CreateUpdateAffiliate")]
        [ActionName("CreateUpdateAffiliate")]
        public async Task<ActionResult> CreateUpdateAffiliate(CreateUpdateAffiliateRequest createUpdateAffiliateRequest)
        {
            _MainResponse = await _AdminAffiliateService.CreateUpdateAffiliate(createUpdateAffiliateRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

        /// <summary>
        /// This API is used to block and unblock affiliate.
        /// </summary>
        /// <param name="blockUnBlockAffiliateRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("BlockUnBlockeAffiliate")]
        [ActionName("BlockUnBlockeAffiliate")]
        public async Task<ActionResult> BlockUnBlockeAffiliate(BlockUnBlockAffiliateRequest blockUnBlockAffiliateRequest)
        {
            _MainResponse = await _AdminAffiliateService.BlockUnBlockeAffiliate(blockUnBlockAffiliateRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }


        /// <summary>
        /// This API is validate affiliate.
        /// </summary>
        /// <param name="valideAffiliateRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("ValidateAffiliate")]
        [ActionName("ValidateAffiliate")]
        public async Task<ActionResult> ValidateAffiliate(ValideAffiliateRequest valideAffiliateRequest)
        {
            _MainResponse = await _AdminAffiliateService.ValidateAffiliate(valideAffiliateRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
        
    }
}