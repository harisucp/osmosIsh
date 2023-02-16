using AutoMapper;
using Dapper;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Data.DBEntities;
using OsmosIsh.Repository.IRepository;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.Repository
{
    public class TeacherRepository : BaseRepository<Teachers>, ITeacherRepository
    {
        #region readonly
        private readonly IMapper _Mapper;
        #endregion

        OsmosIshContext _ObjContext;
        MainResponse _MainResponse = null;
        private string SeriesImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Upload", "Teacher");

        public TeacherRepository(OsmosIshContext ObjContext, IMapper Mapper) : base(ObjContext)
        {
            _MainResponse = new MainResponse();
            _ObjContext = ObjContext;
            _Mapper = Mapper;
        }

        public async Task<MainResponse> UpdateTeacherProfile(UpdateTeacherProfileRequest updateTeacherProfileRequest)
        {

            #region Teacher
            var teacherDetail = _ObjContext.Teachers.Where(x => x.TeacherId == updateTeacherProfileRequest.TeacherId).FirstOrDefault();
            if (teacherDetail == null)
            {
                _MainResponse.Success = false;
                _MainResponse.Message = ErrorMessages.TURTOR_NOT_EXISTS;
                return _MainResponse;
            }

            var userDetail = _ObjContext.Users.Where(x => x.UserId == teacherDetail.UserId).FirstOrDefault();
            userDetail.FirstName = updateTeacherProfileRequest.FirstName;
            userDetail.LastName = updateTeacherProfileRequest.LastName;
            userDetail.CountryId = updateTeacherProfileRequest.CountryId;
            userDetail.Education = updateTeacherProfileRequest.Education;
            userDetail.PhoneNumber = updateTeacherProfileRequest.PhoneNumber;
            userDetail.Languages = updateTeacherProfileRequest.Languages;
            userDetail.DateOfBirth = updateTeacherProfileRequest.DateOfBirth;
            userDetail.ModifiedBy = userDetail.Email;
            userDetail.ModifiedDate = DateTime.UtcNow;
            _ObjContext.Users.Update(userDetail);


            teacherDetail.Specialization = updateTeacherProfileRequest.Specialization;
            teacherDetail.Awards = updateTeacherProfileRequest.Awards;
            teacherDetail.Interest = updateTeacherProfileRequest.Interest;
            teacherDetail.Description = updateTeacherProfileRequest.Description;
            //teacherDetail.SharedReferralCode = updateTeacherProfileRequest.SharedReferralCode;
            //teacherDetail.PrivateSession = updateTeacherProfileRequest.PrivateSession;
            //teacherDetail.FeePerHours = updateTeacherProfileRequest.FeePerHours;
            teacherDetail.PaypalAccountType = updateTeacherProfileRequest.PaypalAccountType;
            teacherDetail.PaypalAccount = updateTeacherProfileRequest.PaypalAccount;
            teacherDetail.IsProfileUpdated = "Y";
            _ObjContext.Teachers.Update(teacherDetail);
            #endregion

            #region Image
            int globalCodeImageTypeId = _ObjContext.GlobalCodes.Where(x => x.CodeName == FileTypes.USERIMAGE).Select(x => x.GlobalCodeId).FirstOrDefault();
            // Update Image Case
            if (updateTeacherProfileRequest.IsImageUpdated)
            {
                var image = _ObjContext.Images.Where(x => x.ImageRefrenceId == teacherDetail.UserId && x.ImageTypeId == globalCodeImageTypeId).FirstOrDefault();
                var imageStoredPath = string.Empty;
                if (image != null)
                {
                    if (updateTeacherProfileRequest.Image != null)
                    {
                        imageStoredPath = CommonFunction.UploadImage(SeriesImagePath, FileTypes.USERIMAGE, updateTeacherProfileRequest.Image);
                    }
                    else
                    {
                        imageStoredPath = null;
                    }
                    image.ModifiedBy = userDetail.Email;
                    image.ModifiedDate = DateTime.UtcNow;
                    image.ImageFile = imageStoredPath;
                    _ObjContext.Update(image);
                }
                else if (updateTeacherProfileRequest.Image != null)
                {
                    image = new Images();
                    image.ImageFile = CommonFunction.UploadImage(SeriesImagePath, FileTypes.USERIMAGE, updateTeacherProfileRequest.Image);
                    image.ImageTypeId = globalCodeImageTypeId;
                    image.ImageRefrenceId = Convert.ToInt32(teacherDetail.UserId);
                    image.CreatedBy = userDetail.Email;
                    _ObjContext.Update(image);
                }

            }
            #endregion


            if (await _ObjContext.SaveChangesAsync() > 0)
            {
                var updateUserDetail = new UpdateUserResponse();
                updateUserDetail.FirstName = updateTeacherProfileRequest.FirstName;
                updateUserDetail.LastName = updateTeacherProfileRequest.LastName;
                var image = _ObjContext.Images.Where(x => x.ImageRefrenceId == teacherDetail.UserId && x.ImageTypeId == globalCodeImageTypeId).FirstOrDefault();
                updateUserDetail.UserImage = image != null && image.ImageFile != null ? image.ImageFile : "/Upload/default_user.png";
                _MainResponse.UpdateUserResponse = updateUserDetail;
                _MainResponse.Message = SuccessMessage.TUTOR_SAVED;
            }
            else
            {
                _MainResponse.Message = ErrorMessages.TUTOR_NOT_SAVED;
            }

            if (updateTeacherProfileRequest.AffiliateCode != null)
            {
                var existinfReferral = _ObjContext.TeacherAffiliateCode.Where(x => x.TeacherId == updateTeacherProfileRequest.TeacherId && x.IsDeleted == "N").FirstOrDefault();
                if (existinfReferral == null)
                {
                    var createReferralCode = new TeacherAffiliateCode();
                    createReferralCode.TeacherId = updateTeacherProfileRequest.TeacherId;
                    createReferralCode.AffiliateCode = updateTeacherProfileRequest.AffiliateCode;
                    createReferralCode.CreatedDate = DateTime.UtcNow;
                    createReferralCode.CreatedBy = userDetail.FirstName;
                    createReferralCode.IsDeleted = "N";
                    createReferralCode.DeletedDate = null;
                    _ObjContext.TeacherAffiliateCode.Update(createReferralCode);
                }

            }
            await _ObjContext.SaveChangesAsync();

            return _MainResponse;
        }

        public async Task<MainResponse> CreateTutor(CreateTutorRequest createTutorRequest)
        {
            var studentDetail = _ObjContext.Teachers.Where(x => x.UserId == createTutorRequest.UserId).FirstOrDefault();
            if (studentDetail == null)
            {
                var Teachers = new Teachers()
                {
                    UserId = createTutorRequest.UserId
                };
                _ObjContext.Teachers.Add(Teachers);


                var userDetail = _ObjContext.Users.Where(x => x.UserId == createTutorRequest.UserId).FirstOrDefault();
                userDetail.IsTutor = "Y";
                _ObjContext.Users.Update(userDetail);
                await _ObjContext.SaveChangesAsync();
                var teacherResponse = new TeacherResponse();
                teacherResponse.TeacherId = Teachers.TeacherId;
                _MainResponse.TeacherResponse = teacherResponse;
                _MainResponse.Message = SuccessMessage.TUTOR_SAVED;
                _MainResponse.Success = true;
            }
            else
            {
                _MainResponse.Message = ErrorMessages.TUTOR_NOT_SAVED;
                _MainResponse.Success = false;
            }
            return _MainResponse;
        }
    }
}
