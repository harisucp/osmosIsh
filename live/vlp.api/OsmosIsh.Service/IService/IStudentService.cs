using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.IService
{
    public interface IStudentService
    {
        Task<MainResponse> UpdateStudentProfile(UpdateStudentProfileRequest updateStudentProfileRequest);

        Task<MainResponse> UpdateStudentORTeacherProfile(UpdateStudentORTeacherRequest updateStudentORTeacherRequest);
        Task<MainResponse> CreateStudent(CreateStudentRequest createStudentRequest);
        Task<MainResponse> ValidateCouponCode(ValidateCouponRequest validateCouponRequest);
        
    }
}
