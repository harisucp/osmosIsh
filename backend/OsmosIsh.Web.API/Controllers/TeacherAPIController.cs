using System;
using System.Collections.Generic;
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
    public class TeacherAPIController : ControllerBase
    {
        #region readonly
        private ITeacherService _TeacherService;
        #endregion

        #region private
        private MainResponse _MainResponse;
        private string _JsonString = string.Empty;
        #endregion

        public TeacherAPIController(ITeacherService TeacherService)
        {
            _TeacherService = TeacherService;
            _MainResponse = new MainResponse();
        }


        /// <summary>
        /// This API is used to update Teacher profile.
        /// </summary>
        /// <param name="updateTeacherProfileRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("UpdateTeacherProfile")]
        [ActionName("UpdateTeacherProfile")]
        public async Task<ActionResult> UpdateTeacherProfile([FromForm]UpdateTeacherProfileRequest updateTeacherProfileRequest)
        {
            _MainResponse = await _TeacherService.UpdateTeacherProfile(updateTeacherProfileRequest);
            _JsonString = Mapper.Convert<UpdateUserResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

        /// <summary>
        /// This API is used to create tutor.
        /// </summary>
        /// <param name="createTutorRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("CreateTutorRequest")]
        [ActionName("CreateTutorRequest")]
        public async Task<ActionResult> CreateTutor(CreateTutorRequest createTutorRequest)
        {
            _MainResponse = await _TeacherService.CreateTutor(createTutorRequest);
            _JsonString = Mapper.Convert<TeacherResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
    }
}