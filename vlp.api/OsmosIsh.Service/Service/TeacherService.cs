using AutoMapper;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Data.DBEntities;
using OsmosIsh.Repository.IRepository;
using OsmosIsh.Service.IService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.Service
{
    public class TeacherService : ITeacherService
    {
        #region readonly
        private readonly ITeacherRepository _TeacherRepository;
        private readonly IMapper _Mapper;
        #endregion

        #region Private
        private MainResponse _MainResponse;
        public OsmosIshContext _ObjContext;
        #endregion
        public TeacherService(ITeacherRepository UserRepository, IMapper Mapper, OsmosIshContext ObjContext)
        {
            _TeacherRepository = UserRepository;
            _Mapper = Mapper;
            _MainResponse = new MainResponse();
            _ObjContext = ObjContext;
        }

        public Task<MainResponse> UpdateTeacherProfile(UpdateTeacherProfileRequest updateTeacherProfileRequest)
        {
            return _TeacherRepository.UpdateTeacherProfile(updateTeacherProfileRequest);
        }
        public Task<MainResponse> CreateTutor(CreateTutorRequest createTutorRequest)
        {
            return _TeacherRepository.CreateTutor(createTutorRequest);
        }
        public async Task<MainResponse> BlockFeaturedTeacher(UpdateTeacherRequest updateTeacherRequest)
        {
            try
            {
                var teacherDetail = new Teachers();
                teacherDetail = _ObjContext.Teachers.Where(x => x.TeacherId == updateTeacherRequest.TeacherId).FirstOrDefault();
                teacherDetail.FeaturedTeacher = updateTeacherRequest.FeaturedTeacher;
                teacherDetail.Blocked = updateTeacherRequest.Blocked;
                teacherDetail.ModifiedBy = "Admin";
                teacherDetail.ModifiedDate = DateTime.UtcNow;
                _ObjContext.Update(teacherDetail);
                await _ObjContext.SaveChangesAsync();
                #region Send Email
                if (updateTeacherRequest.Type == "Block")
                {
                    var tutorDetail = (from te in _ObjContext.Teachers
                                       join u1 in _ObjContext.Users on te.UserId equals u1.UserId
                                       where te.TeacherId == updateTeacherRequest.TeacherId
                                       select new AdminBlockUnBlockTutorResponse
                                       {
                                           TeacherName = u1.FirstName,
                                           TeacherEmail = u1.Email
                                       }).FirstOrDefault();

                    if (updateTeacherRequest.Blocked == "Y")
                    {
                        var emailBody = "";
                        emailBody = CommonFunction.GetTemplateFromHtml("BlockTutor.html");
                        emailBody = emailBody.Replace("{TutorName}", Convert.ToString(tutorDetail.TeacherName));
                        emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");

                        NotificationHelper.SendEmail(tutorDetail.TeacherEmail, emailBody, "Blocked", true);
                    }
                    else
                    {
                        var emailBody = "";
                        emailBody = CommonFunction.GetTemplateFromHtml("UnBlockTutor.html");
                        emailBody = emailBody.Replace("{TutorName}", Convert.ToString(tutorDetail.TeacherName));
                        emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");

                        NotificationHelper.SendEmail(tutorDetail.TeacherEmail, emailBody, "Unblocked", true);
                    }
                }
                #endregion
                var adminTutorResponse = new AdminTutorResponse();
                adminTutorResponse.TeacherId = teacherDetail.TeacherId;
                _MainResponse.AdminTutorResponse = adminTutorResponse;
                _MainResponse.Success = true;
                _MainResponse.Message = "Record saved successfully.";
            }
            catch(Exception ex)
            {
                _MainResponse.Success = false;
                _MainResponse.Message = ex.Message;
            }
            return _MainResponse;
        }
        public async Task<MainResponse> BlockFeaturedStudent(UpdateStudentRequest updateStudentRequest)
        {
            var studentDetail = new Students();
            studentDetail = _ObjContext.Students.Where(x => x.StudentId == updateStudentRequest.StudentId).FirstOrDefault();
            studentDetail.Blocked = updateStudentRequest.Blocked;
            studentDetail.ModifiedBy = "Admin";
            studentDetail.ModifiedDate = DateTime.UtcNow;
            _ObjContext.Update(studentDetail);
            await _ObjContext.SaveChangesAsync();
            #region Send Email
            var studentAdminDetail = (from s in _ObjContext.Students
                                      join u1 in _ObjContext.Users on s.UserId equals u1.UserId
                                      where s.StudentId == updateStudentRequest.StudentId
                                      select new AdminBlockUnBlockStudentResponse
                                      {
                                          StudentName = u1.FirstName,
                                          StudentEmail = u1.Email
                                      }).FirstOrDefault();

            if (updateStudentRequest.Blocked == "Y")
            {
                var emailBody = "";
                emailBody = CommonFunction.GetTemplateFromHtml("BlockStudent.html");
                emailBody = emailBody.Replace("{StudentName}", Convert.ToString(studentAdminDetail.StudentName));
                emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");

                NotificationHelper.SendEmail(studentAdminDetail.StudentEmail, emailBody, "Blocked", true);
            }
            else
            {
                var emailBody = "";
                emailBody = CommonFunction.GetTemplateFromHtml("UnBlockStudent.html");
                emailBody = emailBody.Replace("{StudentName}", Convert.ToString(studentAdminDetail.StudentName));
                emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");

                NotificationHelper.SendEmail(studentAdminDetail.StudentEmail, emailBody, "Unblocked", true);
            }
            #endregion
            var adminStudentResponse = new AdminStudentResponse();
            adminStudentResponse.StudentId = studentDetail.StudentId;
            _MainResponse.AdminStudentResponse = adminStudentResponse;
            _MainResponse.Success = true;
            _MainResponse.Message = "Record saved successfully.";

            return _MainResponse;
        }
        public async Task<MainResponse> BlockFeaturedSeries(UpdateSeriesRequest updateSeriesRequest)
        {
            var seriesDetail = new Series();
            seriesDetail = _ObjContext.Series.Where(x => x.SeriesId == updateSeriesRequest.SeriesId).FirstOrDefault();
            seriesDetail.BlockSeries = updateSeriesRequest.BlockSeries;
            seriesDetail.FeaturedSeries = updateSeriesRequest.FeaturedSeries;
            seriesDetail.ModifiedBy = "Admin";
            seriesDetail.ModifiedDate = DateTime.UtcNow;
            _ObjContext.Update(seriesDetail);
            await _ObjContext.SaveChangesAsync();
            #region Send Email
            if (updateSeriesRequest.Type == "Block")
            {
                SessionUpdateTemplateresponse sessionUpdateTemplateresponse = new SessionUpdateTemplateresponse();
                var enrollmentDetails = (from e in _ObjContext.Enrollments
                                         join s in _ObjContext.Students on e.StudentId equals s.StudentId
                                         join u in _ObjContext.Users on s.UserId equals u.UserId
                                         join se in _ObjContext.Series on e.RefrenceId equals se.SeriesId
                                         join sd in _ObjContext.SeriesDetail on se.SeriesId equals sd.SeriesId
                                         where e.RefrenceId == updateSeriesRequest.SeriesId && e.RefrenceType == (_ObjContext.GlobalCodes.Where(x => x.CodeName == "Series").Select(x => x.GlobalCodeId).FirstOrDefault()) && e.RecordDeleted == "N"
                                         select new SessionUpdateTemplateresponse
                                         {
                                             StudentName = u.FirstName,
                                             SessionTitle = sd.SeriesTitle,
                                             StudentEmail = u.Email
                                         }).ToList();
                SessionUpdateTemplateTutorResponse sessionUpdateTemplateTutorResponse = new SessionUpdateTemplateTutorResponse();
                var teacherDetail = (from se in _ObjContext.Series
                                     join te in _ObjContext.Teachers on se.TeacherId equals te.TeacherId
                                     join u1 in _ObjContext.Users on te.UserId equals u1.UserId
                                     join sd in _ObjContext.SeriesDetail on se.SeriesId equals sd.SeriesId
                                     where se.SeriesId == updateSeriesRequest.SeriesId
                                     select new SessionUpdateTemplateTutorResponse
                                     {
                                         TeacherName = u1.FirstName,
                                         TeacherEmail = u1.Email,
                                         SessionTitle = sd.SeriesTitle
                                     }).FirstOrDefault();
                if (enrollmentDetails.Count > 0)
                {
                    foreach (var info in enrollmentDetails)
                    {
                        if (updateSeriesRequest.BlockSeries == "Y")
                        {
                            var emailBody = "";
                            emailBody = CommonFunction.GetTemplateFromHtml("SessionBlockStudent.html");
                            emailBody = emailBody.Replace("{Title}", Convert.ToString(info.SessionTitle));
                            emailBody = emailBody.Replace("{StudentName}", Convert.ToString(info.StudentName));
                            emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");

                            NotificationHelper.SendEmail(info.StudentEmail, emailBody, "Blocked Session By Admin", true);
                        }
                        else
                        {
                            var emailBody = "";
                            emailBody = CommonFunction.GetTemplateFromHtml("SessionUnBlockStudent.html");
                            emailBody = emailBody.Replace("{Title}", Convert.ToString(info.SessionTitle));
                            emailBody = emailBody.Replace("{StudentName}", Convert.ToString(info.StudentName));
                            emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");
                            NotificationHelper.SendEmail(info.StudentEmail, emailBody, "UnBlocked Session By Admin", true);
                        }
                    }
                }
                if (teacherDetail != null)
                {
                    if (updateSeriesRequest.BlockSeries == "Y")
                    {
                        var emailBody = "";
                        emailBody = CommonFunction.GetTemplateFromHtml("SessionBlockTutor.html");
                        emailBody = emailBody.Replace("{Title}", Convert.ToString(teacherDetail.SessionTitle));
                        emailBody = emailBody.Replace("{TutorName}", Convert.ToString(teacherDetail.TeacherName));
                        emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");
                        NotificationHelper.SendEmail(teacherDetail.TeacherEmail, emailBody, "Your Session Has Been Blocked", true);
                    }
                    else
                    {
                        var emailBody = "";
                        emailBody = CommonFunction.GetTemplateFromHtml("SessionUnBlockTutor.html");
                        emailBody = emailBody.Replace("{Title}", Convert.ToString(teacherDetail.SessionTitle));
                        emailBody = emailBody.Replace("{TutorName}", Convert.ToString(teacherDetail.TeacherName));
                        emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");
                        NotificationHelper.SendEmail(teacherDetail.TeacherEmail, emailBody, "Your Session Has Been UnBlocked", true);
                    }
                }
            }
            #endregion
            var adminSeriesResponse = new AdminSeriesResponse();
            adminSeriesResponse.SeriesId = seriesDetail.SeriesId;
            _MainResponse.AdminSeriesResponse = adminSeriesResponse;
            _MainResponse.Success = true;
            _MainResponse.Message = "Record saved successfully.";

            return _MainResponse;
        }
        public async Task<MainResponse> BlockFeaturedSession(UpdateSessionRequest updateSessionRequest)
        {
            var sessionDetail = new Session();
            sessionDetail = _ObjContext.Session.Where(x => x.SessionId == updateSessionRequest.SessionId).FirstOrDefault();
            sessionDetail.BlockSession = updateSessionRequest.BlockSession;
            sessionDetail.FeaturedSession = updateSessionRequest.FeaturedSession;
            sessionDetail.ModifiedBy = "Admin";
            sessionDetail.ModifiedDate = DateTime.UtcNow;
            _ObjContext.Update(sessionDetail);
            await _ObjContext.SaveChangesAsync();
            #region Send Email
            if (updateSessionRequest.Type == "Block")
            {
                SessionUpdateTemplateresponse sessionUpdateTemplateresponse = new SessionUpdateTemplateresponse();
                var enrollmentDetails = (from e in _ObjContext.Enrollments
                                         join s in _ObjContext.Students on e.StudentId equals s.StudentId
                                         join u in _ObjContext.Users on s.UserId equals u.UserId
                                         join se in _ObjContext.Session on e.RefrenceId equals se.SessionId
                                         join sd in _ObjContext.SessionDetail on se.SessionId equals sd.SessionId
                                         where e.RefrenceId == updateSessionRequest.SessionId && e.RecordDeleted == "N"
                                         select new SessionUpdateTemplateresponse
                                         {
                                             StudentName = u.FirstName,
                                             SessionTitle = sd.SessionTitle,
                                             StudentEmail = u.Email
                                         }).ToList();
                SessionUpdateTemplateTutorResponse sessionUpdateTemplateTutorResponse = new SessionUpdateTemplateTutorResponse();
                var teacherDetail = (from se in _ObjContext.Session
                                     join te in _ObjContext.Teachers on se.TeacherId equals te.TeacherId
                                     join u1 in _ObjContext.Users on te.UserId equals u1.UserId
                                     join sd in _ObjContext.SessionDetail on se.SessionId equals sd.SessionId
                                     where se.SessionId == updateSessionRequest.SessionId
                                     select new SessionUpdateTemplateTutorResponse
                                     {
                                         TeacherName = u1.FirstName,
                                         TeacherEmail = u1.Email,
                                         SessionTitle = sd.SessionTitle
                                     }).FirstOrDefault();
                if (enrollmentDetails.Count > 0)
                {
                    foreach (var info in enrollmentDetails)
                    {
                        if (updateSessionRequest.BlockSession == "Y")
                        {
                            var emailBody = "";
                            emailBody = CommonFunction.GetTemplateFromHtml("SessionBlockStudent.html");
                            emailBody = emailBody.Replace("{Title}", Convert.ToString(info.SessionTitle));
                            emailBody = emailBody.Replace("{StudentName}", Convert.ToString(info.StudentName));
                            NotificationHelper.SendEmail(info.StudentEmail, emailBody, "Blocked Session By Admin", true);
                        }
                        else
                        {
                            var emailBody = "";
                            emailBody = CommonFunction.GetTemplateFromHtml("SessionUnBlockStudent.html");
                            emailBody = emailBody.Replace("{Title}", Convert.ToString(info.SessionTitle));
                            emailBody = emailBody.Replace("{StudentName}", Convert.ToString(info.StudentName));
                            NotificationHelper.SendEmail(info.StudentEmail, emailBody, "UnBlocked Session By Admin", true);
                        }
                    }
                }
                if (teacherDetail != null)
                {
                    if (updateSessionRequest.BlockSession == "Y")
                    {
                        var emailBody = "";
                        emailBody = CommonFunction.GetTemplateFromHtml("SessionBlockTutor.html");
                        emailBody = emailBody.Replace("{Title}", Convert.ToString(teacherDetail.SessionTitle));
                        emailBody = emailBody.Replace("{TutorName}", Convert.ToString(teacherDetail.TeacherName));
                        emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");
                        NotificationHelper.SendEmail(teacherDetail.TeacherEmail, emailBody, "Your Session Has Been Blocked", true);
                    }
                    else
                    {
                        var emailBody = "";
                        emailBody = CommonFunction.GetTemplateFromHtml("SessionUnBlockTutor.html");
                        emailBody = emailBody.Replace("{Title}", Convert.ToString(teacherDetail.SessionTitle));
                        emailBody = emailBody.Replace("{TutorName}", Convert.ToString(teacherDetail.TeacherName));
                        NotificationHelper.SendEmail(teacherDetail.TeacherEmail, emailBody, "Your Session Has Been UnBlocked", true);
                    }
                }
            }
            #endregion
            var adminSessionResponse = new AdminSessionResponse();
            adminSessionResponse.SessionId = sessionDetail.SessionId;
            _MainResponse.AdminSessionResponse = adminSessionResponse;
            _MainResponse.Success = true;
            _MainResponse.Message = "Record saved successfully.";

            return _MainResponse;
        }
        public async Task<MainResponse> DisableTutorReview(DisableReviewRequest disableReviewRequest)
        {
            var reviewDetail = new Reviews();
            reviewDetail = _ObjContext.Reviews.Where(x => x.ReviewId == disableReviewRequest.ReviewId).FirstOrDefault();
            reviewDetail.RecordDeleted = "Y";
            reviewDetail.DeletedBy = "Admin";
            reviewDetail.DeletedDate = DateTime.UtcNow;
            _ObjContext.Update(reviewDetail);
            await _ObjContext.SaveChangesAsync();
            _MainResponse.Success = true;
            _MainResponse.Message = "Record saved successfully.";

            return _MainResponse;
        }
    }
}
