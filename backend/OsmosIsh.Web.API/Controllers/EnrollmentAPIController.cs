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
    public class EnrollmentAPIController : ControllerBase
    {

        #region readonly
        private readonly IEnrollmentService _EnrollmentService;
        private MainResponse _MainResponse;
        #endregion

        #region Private
        private string _JsonString = string.Empty;
        #endregion

        public EnrollmentAPIController(IEnrollmentService EnrollmentService)
        {
            _EnrollmentService = EnrollmentService;
            _MainResponse = new MainResponse();
        }

        /// <summary>
        /// This API is used to create and update enrollment.
        /// </summary>
        /// <param name="createUpdateSessionRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("CreateEnrollmentRequest")]
        [ActionName("CreateEnrollmentRequest")]
        public async Task<ActionResult> CreateEnrollment(CreateEnrollmentRequest createEnrollmentRequest)
        {
            _MainResponse = await _EnrollmentService.CreateEnrollment(createEnrollmentRequest);
            _JsonString = Mapper.Convert<CartResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }


        /// <summary>
        /// This API is used to create multiple enrollment.
        /// </summary>
        /// <param name="createMultipleEnrollmentsRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("CreateMultipleEnrollmentsRequest")]
        [ActionName("CreateMultipleEnrollmentsRequest")]
        public async Task<ActionResult> CreateMultipleEnrollments(CreateMultipleEnrollmentsRequest createMultipleEnrollmentsRequest)
        {
            _MainResponse = await _EnrollmentService.CreateMultipleEnrollments(createMultipleEnrollmentsRequest);
            _JsonString = Mapper.Convert<MultipleCartResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

        /// <summary>
        /// This API is used to delete enrollment.
        /// </summary>
        /// <param name="DeleteEnrollmentRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("DeleteEnrollmentRequest")]
        [ActionName("DeleteEnrollmentRequest")]
        public async Task<ActionResult> DeleteEnrollment(DeleteEnrollmentRequest deleteEnrollmentRequest)
        {
            _MainResponse = await _EnrollmentService.DeleteEnrollment(deleteEnrollmentRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }

        /// <summary>
        /// This API is used to create and update saved enrollment.
        /// </summary>
        /// <param name="savedEnrollmentRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("SavedEnrollmentRequest")]
        [ActionName("SavedEnrollmentRequest")]
        public async Task<ActionResult> EnrollmentSavedForLater(SavedEnrollmentRequest savedEnrollmentRequest)
        {
            _MainResponse = await _EnrollmentService.EnrollmentSavedForLater(savedEnrollmentRequest);
            _JsonString = Mapper.Convert<CartResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
        /// <summary>
        /// This API is used to add favourite teacher.
        /// </summary>
        /// <param name="favoriteRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("AddFavourite")]
        [ActionName("AddFavourite")]
        public async Task<ActionResult> AddFavouriteTeacher(FavoriteRequest favoriteRequest)
        {
            _MainResponse = await _EnrollmentService.AddFavouriteTeacher(favoriteRequest);
            _JsonString = Mapper.Convert<BaseResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
        /// <summary>
        /// This API is used to create and update transaction log.
        /// </summary>
        /// <param name="insertModifyTransactionLogRequest"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("InsertModifyTransactionLogRequest")]
        [ActionName("InsertModifyTransactionLogRequest")]
        public async Task<ActionResult> InsertModifyTransactionLog(InsertModifyTransactionLogRequest insertModifyTransactionLogRequest)
        {
            _MainResponse = await _EnrollmentService.InsertModifyTransactionLog(insertModifyTransactionLogRequest);
            _JsonString = Mapper.Convert<TransactionResponse>(_MainResponse);
            return new OkObjectResult(_JsonString);
        }
    }
}