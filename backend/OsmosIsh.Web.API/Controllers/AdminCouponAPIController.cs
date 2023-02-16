using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Service.IService;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Core.DTOs.Request;

namespace OsmosIsh.Web.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AdminCouponAPIController : ControllerBase
    {
        #region readonly
        private IAdminCouponService _AdminCouponService;
        #endregion

        #region private
        private MainResponse _MainResponse;
        private string _JsonString = string.Empty;
        #endregion

        public AdminCouponAPIController(IAdminCouponService AdminCouponService)
        {
            _AdminCouponService = AdminCouponService;
            _MainResponse = new MainResponse();
        }

        /// <summary>
        /// This API is used to create and update coupon.
        /// </summary>
        /// <param name="createUpdateCouponRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("CreateUpdateCoupon")]
        [ActionName("CreateUpdateCoupon")]
        public async Task<ActionResult> CreateUpdateCoupon(CreateUpdateCouponRequest createUpdateCouponRequest)
        {
            _MainResponse = await _AdminCouponService.CreateUpdateCoupon(createUpdateCouponRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

        /// <summary>
        /// This API is used to block and unblock coupon.
        /// </summary>
        /// <param name="blockUnBlockCouponRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("BlockUnBlockCoupon")]
        [ActionName("BlockUnBlockCoupon")]
        public async Task<ActionResult> BlockUnBlockCoupon(BlockUnBlockCouponRequest blockUnBlockCouponRequest)
        {
            _MainResponse = await _AdminCouponService.BlockUnBlockCoupon(blockUnBlockCouponRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
    }
}