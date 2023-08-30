using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.IService
{
    public interface IEnrollmentService
    {
        Task<MainResponse> CreateEnrollment(CreateEnrollmentRequest createEnrollmentRequest);
        Task<MainResponse> CreateMultipleEnrollments(CreateMultipleEnrollmentsRequest createMultipleEnrollmentsRequest);

        Task<MainResponse> DeleteEnrollment(DeleteEnrollmentRequest deleteEnrollmentRequest);
        Task<MainResponse> EnrollmentSavedForLater(SavedEnrollmentRequest savedEnrollmentRequest);
        Task<MainResponse> AddFavouriteTeacher(FavoriteRequest favoriteRequest);

        Task<MainResponse> InsertModifyTransactionLog(InsertModifyTransactionLogRequest insertModifyTransactionLogRequest);

    }
}
