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
using Microsoft.AspNetCore.Authorization;

namespace OsmosIsh.Web.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
     [Authorize]
    public class StudentAPIController : ControllerBase
    {
        #region readonly
        private IStudentService _StudentService;
        #endregion

        #region private
        private MainResponse _MainResponse;
        private string _JsonString = string.Empty;
        #endregion

        public StudentAPIController(IStudentService StudentService)
        {
            _StudentService = StudentService;
            _MainResponse = new MainResponse();
        }


        /// <summary>
        /// This API is used to update Student profile.
        /// </summary>
        /// <param name="updateStudentProfileRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("UpdateStudentProfile")]
        [ActionName("UpdateStudentProfile")]
        public async Task<ActionResult> UpdateStudentProfile([FromForm]UpdateStudentProfileRequest updateStudentProfileRequest)
        {
            _MainResponse = await _StudentService.UpdateStudentProfile(updateStudentProfileRequest);
            _JsonString = Mapper.Convert<UpdateUserResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

        [HttpPost]
        [Route("UpdateStudentORTeacherProfile")]
        [ActionName ("UpdateStudentORTeacherProfile")]
        public async Task<ActionResult>UpdateStudentORTeacherProfile([FromForm] UpdateStudentORTeacherRequest updateStudentORTeacherRequest)

        {

            _MainResponse = await _StudentService.UpdateStudentORTeacherProfile(updateStudentORTeacherRequest);
            _JsonString = Mapper.Convert<UpdateUserResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
        /// <summary>
        /// This API is used to create Student.
        /// </summary>
        /// <param name="createStudentRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("CreateStudent")]
        [ActionName("CreateStudent")]
        public async Task<ActionResult> CreateStudent(CreateStudentRequest createStudentRequest)
        {
            _MainResponse = await _StudentService.CreateStudent(createStudentRequest);
            _JsonString = Mapper.Convert<StudentResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

        /// <summary>
        /// This API is validate affiliate.
        /// </summary>
        /// <param name="valideAffiliateRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("ValidateCouponCode")]
        [ActionName("ValidateCouponCode")]
        public async Task<ActionResult> ValidateCouponCode(ValidateCouponRequest validateCouponRequest)
        {
            _MainResponse = await _StudentService.ValidateCouponCode(validateCouponRequest);
            _JsonString = Mapper.Convert<CouponValidateResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

    }
}