using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.IService
{
    public interface ITeacherService
    {
        Task<MainResponse> UpdateTeacherProfile(UpdateTeacherProfileRequest updateTeacherProfileRequest);
        Task<MainResponse> CreateTutor(CreateTutorRequest createTutorRequest);
        Task<MainResponse> BlockFeaturedTeacher(UpdateTeacherRequest updateTeacherRequest);
        Task<MainResponse> BlockFeaturedStudent(UpdateStudentRequest updateStudentRequest);
        Task<MainResponse> BlockFeaturedSeries(UpdateSeriesRequest updateSeriesRequest);
        Task<MainResponse> BlockFeaturedSession(UpdateSessionRequest updateSessionRequest);
        Task<MainResponse> DisableTutorReview(DisableReviewRequest disableReviewRequest);
    }
}
