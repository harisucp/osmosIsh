using AutoMapper;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Data.DBEntities;
using OsmosIsh.Repository.IRepository;
using OsmosIsh.Service.IService;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.Service
{
    public class EnrollmentService : IEnrollmentService
    {
        #region readonly
        private readonly IEnrollmentRepository _EnrollmentRepository;
        private readonly IMapper _Mapper;
        #endregion

        #region Private
        private MainResponse _MainResponse;
        public OsmosIshContext _ObjContext;
        #endregion
        public EnrollmentService(IEnrollmentRepository EnrollmentRepository, IMapper Mapper, OsmosIshContext ObjContext)
        {
            _EnrollmentRepository = EnrollmentRepository;
            _Mapper = Mapper;
            _MainResponse = new MainResponse();
            _ObjContext = ObjContext;
        }

        public async Task<MainResponse> CreateEnrollment(CreateEnrollmentRequest createEnrollmentRequest)
        {
            return await _EnrollmentRepository.CreateEnrollment(createEnrollmentRequest);

        }

        public async Task<MainResponse> CreateMultipleEnrollments(CreateMultipleEnrollmentsRequest createMultipleEnrollmentsRequest)
        {
            return await _EnrollmentRepository.CreateMultipleEnrollments(createMultipleEnrollmentsRequest);

        }
        public async Task<MainResponse> DeleteEnrollment(DeleteEnrollmentRequest deleteEnrollmentRequest)
        {
            return await _EnrollmentRepository.DeleteEnrollment(deleteEnrollmentRequest);

        }

        public async Task<MainResponse> EnrollmentSavedForLater(SavedEnrollmentRequest savedEnrollmentRequest)
        {
            return await _EnrollmentRepository.EnrollmentSavedForLater(savedEnrollmentRequest);
        }

        public async Task<MainResponse> AddFavouriteTeacher(FavoriteRequest favoriteRequest)
        {
            return await _EnrollmentRepository.AddFavouriteTeacher(favoriteRequest);

        }

        public async Task<MainResponse> InsertModifyTransactionLog(InsertModifyTransactionLogRequest insertModifyTransactionLogRequest)
        {
            return await _EnrollmentRepository.InsertModifyTransactionLog(insertModifyTransactionLogRequest);

        }
    }
}
