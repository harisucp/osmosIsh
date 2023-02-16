using AutoMapper;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Repository.IRepository;
using OsmosIsh.Service.IService;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.Service
{
    public class StudentService : IStudentService
    {
        #region readonly
        private readonly IStudentRepository _StudentRepository;
        private readonly IMapper _Mapper;
        #endregion

        #region Private
        private MainResponse _MainResponse;
        public OsmosIshContext _ObjContext;
        #endregion
        public StudentService(IStudentRepository UserRepository, IMapper Mapper, OsmosIshContext ObjContext)
        {
            _StudentRepository = UserRepository;
            _Mapper = Mapper;
            _MainResponse = new MainResponse();
            _ObjContext = ObjContext;
        }

        public Task<MainResponse> UpdateStudentProfile(UpdateStudentProfileRequest updateStudentProfileRequest)
        {
            return _StudentRepository.UpdateStudentProfile(updateStudentProfileRequest);
        }

        public Task<MainResponse>UpdateStudentORTeacherProfile(UpdateStudentORTeacherRequest updateStudentORTeacherRequest)
        {
            return _StudentRepository.UpdateStudentORTeacherProfile(updateStudentORTeacherRequest);
        } 
        public Task<MainResponse> CreateStudent(CreateStudentRequest createStudentRequest)
        {
            return _StudentRepository.CreateStudent(createStudentRequest);
        }

        public Task<MainResponse> ValidateCouponCode(ValidateCouponRequest validateCouponRequest)
        {
            return _StudentRepository.ValidateCouponCode(validateCouponRequest);
        }
        

    }
}
