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

namespace OsmosIsh.Web.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AdminFeaturedBlockAPIController : ControllerBase
    {
        #region readonly
        private ITeacherService _TeacherService;
        #endregion

        #region private
        private MainResponse _MainResponse;
        private string _JsonString = string.Empty;
        #endregion

        public AdminFeaturedBlockAPIController(ITeacherService TeacherService)
        {
            _TeacherService = TeacherService;
            _MainResponse = new MainResponse();
        }


        /// <summary>
        /// This API is used to update Teacher fields by admin.
        /// </summary>
        /// <param name="updateTeacherRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("BlockFeaturedTeacher")]
        [ActionName("BlockFeaturedTeacher")]
        public async Task<ActionResult> BlockFeaturedTeacher(UpdateTeacherRequest updateTeacherRequest)
        {
            _MainResponse = await _TeacherService.BlockFeaturedTeacher(updateTeacherRequest);
            _JsonString = Mapper.Convert<AdminTutorResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
        /// <summary>
        /// This API is used to update Student fields by admin.
        /// </summary>0
        /// <param name="updateStudentRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("BlockFeaturedStudent")]
        [ActionName("BlockFeaturedStudent")]
        public async Task<ActionResult> BlockFeaturedStudent(UpdateStudentRequest updateStudentRequest)
        {
            _MainResponse = await _TeacherService.BlockFeaturedStudent(updateStudentRequest);
            _JsonString = Mapper.Convert<AdminStudentResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

        /// <summary>
        /// This API is used to update Series fields by admin.
        /// </summary>
        /// <param name="updateSeriesRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("BlockFeaturedSeries")]
        [ActionName("BlockFeaturedSeries")]
        public async Task<ActionResult> BlockFeaturedSeries(UpdateSeriesRequest updateSeriesRequest)
        {
            _MainResponse = await _TeacherService.BlockFeaturedSeries(updateSeriesRequest);
            _JsonString = Mapper.Convert<AdminSeriesResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
        /// <summary>
        /// This API is used to update Session fields by admin.
        /// </summary>
        /// <param name="updateSessionRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("BlockFeaturedSession")]
        [ActionName("BlockFeaturedSession")]
        public async Task<ActionResult> BlockFeaturedSession(UpdateSessionRequest updateSessionRequest)
        {
            _MainResponse = await _TeacherService.BlockFeaturedSession(updateSessionRequest);
            _JsonString = Mapper.Convert<AdminSessionResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
        /// <summary>
        /// This API is used to delete review by admin.
        /// </summary>
        /// <param name="disableReviewRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("DisableTutorReview")]
        [ActionName("DisableTutorReview")]
        public async Task<ActionResult> DisableTutorReview(DisableReviewRequest disableReviewRequest)
        {
            _MainResponse = await _TeacherService.DisableTutorReview(disableReviewRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
    }
}