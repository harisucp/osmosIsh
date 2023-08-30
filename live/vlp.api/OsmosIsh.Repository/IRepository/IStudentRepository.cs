using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Data.DBEntities;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.IRepository
{
    public interface IStudentRepository : IBaseRepository<Students>
    {
        Task<MainResponse> UpdateStudentProfile(UpdateStudentProfileRequest updateStudentProfileRequest);

        Task<MainResponse> UpdateStudentORTeacherProfile(UpdateStudentORTeacherRequest updateStudentORTeacherRequest);
        Task<MainResponse> CreateStudent(CreateStudentRequest createStudentRequest);
        Task<MainResponse> ValidateCouponCode(ValidateCouponRequest validateCouponRequest);

    }
}
