using AutoMapper;
using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;
using Org.BouncyCastle.Math.EC.Rfc7748;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Data.DBEntities;
using OsmosIsh.Repository.IRepository;
using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.ComTypes;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.Repository
{
    public class SessionRepository : BaseRepository<Session>, ISessionRepository
    {
        #region readonly
        private readonly IMapper _Mapper;
        #endregion

        OsmosIshContext _ObjContext;
        MainResponse _MainResponse = null;
        private string SessionImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Upload", "Session", "Image");
        private string SessionVideoPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Upload", "Session", "Video");

        public SessionRepository(OsmosIshContext ObjContext, IMapper Mapper) : base(ObjContext)
        {
            _MainResponse = new MainResponse();
            _ObjContext = ObjContext;
            _Mapper = Mapper;
        }

        public async Task<MainResponse> CreateUpdateSession(CreateUpdateSessionRequest createUpdateSessionRequest)
        {
            // Create Session 
            var session = new Session();
            if (createUpdateSessionRequest.SessionId > 0)
            {
                session = _ObjContext.Session.Where(x => x.SessionId == createUpdateSessionRequest.SessionId).FirstOrDefault();
                session.ModifiedBy = createUpdateSessionRequest.ActionPerformedBy;
                session.ModifiedDate = DateTime.UtcNow;
            }
            else
            {
                session.CreatedBy = createUpdateSessionRequest.ActionPerformedBy;
                var affiliateId = (from T in _ObjContext.Teachers
                                   join TAC in _ObjContext.TeacherAffiliateCode on T.TeacherId equals TAC.TeacherId
                                   join A in _ObjContext.Affiliates on TAC.AffiliateCode equals A.AffiliateCode
                                   where TAC.IsDeleted == "N" && A.Active == "Y" && T.TeacherId == createUpdateSessionRequest.TeacherId
                                   select new
                                   {
                                       A.AffiliateId
                                   }).FirstOrDefault();
                if (affiliateId != null)
                    session.AffiliateId = affiliateId.AffiliateId;
            }
            session.TeacherId = createUpdateSessionRequest.TeacherId;
            session.StartTime = createUpdateSessionRequest.StartTime;
            session.EndTime = createUpdateSessionRequest.StartTime.AddMinutes(createUpdateSessionRequest.Duration);
            session.Duration = createUpdateSessionRequest.Duration;
            _ObjContext.Update(session);
            _ObjContext.SaveChanges();

            // Create Session detail
            var sessionDetail = new SessionDetail();
            if (createUpdateSessionRequest.SessionId > 0)
            {
                sessionDetail = _ObjContext.SessionDetail.Where(x => x.SessionId == createUpdateSessionRequest.SessionId).FirstOrDefault();
                sessionDetail.ModifiedBy = createUpdateSessionRequest.ActionPerformedBy;
                sessionDetail.ModifiedDate = DateTime.UtcNow;
            }
            else
            {
                sessionDetail.CreatedBy = createUpdateSessionRequest.ActionPerformedBy;
            }
            sessionDetail.SessionId = session.SessionId;
            sessionDetail.SessionTitle = createUpdateSessionRequest.SessionTitle;
            sessionDetail.NumberOfJoineesAllowed = createUpdateSessionRequest.NumberOfJoineesAllowed;
            sessionDetail.SessionFee = createUpdateSessionRequest.SessionFee;
            sessionDetail.Description = createUpdateSessionRequest.Description;
            sessionDetail.Agenda = createUpdateSessionRequest.Agenda;
            sessionDetail.Language = createUpdateSessionRequest.Language;
            sessionDetail.TimeZone = createUpdateSessionRequest.TimeZone;
            sessionDetail.SessionTags = createUpdateSessionRequest.SessionTags;
            sessionDetail.SessionCategoryId = createUpdateSessionRequest.SessionCategoryId;
            sessionDetail.PrivateSession = createUpdateSessionRequest.PrivateSession;
            _ObjContext.Update(sessionDetail);


            #region Image
            int globalCodeImageTypeId = _ObjContext.GlobalCodes.Where(x => x.CodeName == FileTypes.SESSIONIMAGE).Select(x => x.GlobalCodeId).FirstOrDefault();
            // Update Image Case
            if (createUpdateSessionRequest.SessionId > 0 && createUpdateSessionRequest.IsImageUpdated)
            {
                var image = _ObjContext.Images.Where(x => x.ImageRefrenceId == createUpdateSessionRequest.SessionId && x.ImageTypeId == globalCodeImageTypeId).FirstOrDefault();
                var imageStoredPath = string.Empty;
                if (image != null)
                {
                    if (createUpdateSessionRequest.Image != null)
                    {
                        imageStoredPath = CommonFunction.UploadImage(SessionImagePath, FileTypes.SESSIONIMAGE, createUpdateSessionRequest.Image);
                    }
                    else
                    {
                        imageStoredPath = null;
                    }
                    image.ModifiedBy = createUpdateSessionRequest.ActionPerformedBy;
                    image.ModifiedDate = DateTime.UtcNow;
                    image.ImageFile = imageStoredPath;
                    _ObjContext.Update(image);
                }
                else
                {
                    image = new Images();
                    imageStoredPath = CommonFunction.UploadImage(SessionImagePath, FileTypes.SESSIONIMAGE, createUpdateSessionRequest.Image);
                    image.ImageFile = imageStoredPath;
                    image.ImageTypeId = globalCodeImageTypeId;
                    image.ImageRefrenceId = session.SessionId;
                    image.CreatedBy = createUpdateSessionRequest.ActionPerformedBy;
                    _ObjContext.Update(image);
                }
            }
            if (createUpdateSessionRequest.SessionId == -1)
            {
                if (createUpdateSessionRequest.Image != null)
                {
                    var image = new Images();
                    var imageStoredPath = CommonFunction.UploadImage(SessionImagePath, FileTypes.SESSIONIMAGE, createUpdateSessionRequest.Image);
                    image.ImageFile = imageStoredPath;
                    image.ImageTypeId = globalCodeImageTypeId;
                    image.ImageRefrenceId = session.SessionId;
                    image.CreatedBy = createUpdateSessionRequest.ActionPerformedBy;
                    _ObjContext.Update(image);
                }
                else if(createUpdateSessionRequest.CopySessionId > 0)
                {
                    var parentImage = _ObjContext.Images.Where(x => x.ImageRefrenceId == createUpdateSessionRequest.CopySessionId && x.ImageTypeId == globalCodeImageTypeId).FirstOrDefault();
                    if (parentImage != null)
                    {
                        var image = new Images();
                        image.ImageFile = parentImage.ImageFile;
                        image.ImageTypeId = parentImage.ImageTypeId;
                        image.ImageRefrenceId = session.SessionId;
                        image.CreatedBy = createUpdateSessionRequest.ActionPerformedBy;
                        _ObjContext.Update(image);
                    }
                }
            }
            #endregion

            #region Video
            int globalCodeVideoTypeId = _ObjContext.GlobalCodes.Where(x => x.CodeName == "SessionVideo").Select(x => x.GlobalCodeId).FirstOrDefault();
            // Update Image Case
            if (createUpdateSessionRequest.SessionId > 0 && createUpdateSessionRequest.IsVideoUpdated)
            {
                var video = _ObjContext.Images.Where(x => x.ImageRefrenceId == createUpdateSessionRequest.SessionId && x.ImageTypeId == globalCodeVideoTypeId).FirstOrDefault();
                var videoStoredPath = string.Empty;
                if (video != null)
                {
                    if (createUpdateSessionRequest.Video != null)
                    {
                        videoStoredPath = CommonFunction.UploadImage(SessionVideoPath, FileTypes.SERIESVIDEO, createUpdateSessionRequest.Video);
                    }
                    else
                    {
                        videoStoredPath = null;
                    }
                    video.ModifiedBy = createUpdateSessionRequest.ActionPerformedBy;
                    video.ModifiedDate = DateTime.UtcNow;
                    video.ImageFile = videoStoredPath;
                    _ObjContext.Update(video);
                }
                else
                {
                    video = new Images();
                    videoStoredPath = CommonFunction.UploadImage(SessionVideoPath, FileTypes.SESSIONVIDEO, createUpdateSessionRequest.Video);
                    video.ImageFile = videoStoredPath;
                    video.ImageTypeId = globalCodeVideoTypeId;
                    video.ImageRefrenceId = session.SessionId;
                    video.CreatedBy = createUpdateSessionRequest.ActionPerformedBy;
                    _ObjContext.Update(video);
                }
            }
            if (createUpdateSessionRequest.SessionId == null && createUpdateSessionRequest.Video != null)
            {
                var video = new Images();
                var videoStoredPath = CommonFunction.UploadImage(SessionVideoPath, FileTypes.SESSIONVIDEO, createUpdateSessionRequest.Video);
                video.ImageFile = videoStoredPath;
                video.ImageTypeId = globalCodeVideoTypeId;
                video.ImageRefrenceId = session.SessionId;
                video.CreatedBy = createUpdateSessionRequest.ActionPerformedBy;
                _ObjContext.Update(video);
            }
            #endregion

            #region Send Email
            if (session.ModifiedBy != null)
            {
                SessionUpdateTemplateresponse sessionUpdateTemplateresponse = new SessionUpdateTemplateresponse();
                var enrollmentDetails = (from e in _ObjContext.Enrollments
                                         join tr in _ObjContext.Transactions on e.TransactionId equals tr.TransactionId
                                         join s in _ObjContext.Students on e.StudentId equals s.StudentId
                                         join u in _ObjContext.Users on s.UserId equals u.UserId
                                         join se in _ObjContext.Session on e.RefrenceId equals se.SessionId
                                         join sd in _ObjContext.SessionDetail on se.SessionId equals sd.SessionId
                                         where e.RefrenceId == session.SessionId && e.RecordDeleted == "N" && tr.IsPaymentSuccess == "Y"
                                         select new SessionUpdateTemplateresponse
                                         {
                                             StudentName = u.FirstName,
                                             SessionTitle = sd.SessionTitle,
                                             StudentEmail = u.Email,
                                             StartTime = se.StartTime,
                                             EndTime = se.EndTime,
                                             StartDate = sd.Session.Series.StartDate,
                                             EndDate = sd.Session.Series.Enddate
                                         }).Distinct().ToList();
                SessionUpdateTemplateTutorResponse sessionUpdateTemplateTutorResponse = new SessionUpdateTemplateTutorResponse();
                var teacherDetail = (from se in _ObjContext.Session
                                     join te in _ObjContext.Teachers on se.TeacherId equals te.TeacherId
                                     join u1 in _ObjContext.Users on te.UserId equals u1.UserId
                                     join sd in _ObjContext.SessionDetail on se.SessionId equals sd.SessionId
                                     where se.SessionId == session.SessionId && se.RecordDeleted == "N"
                                     select new SessionUpdateTemplateTutorResponse
                                     {
                                         TeacherName = u1.FirstName,
                                         TeacherEmail = u1.Email,
                                         SessionTitle = sd.SessionTitle,
                                         StartTime = se.StartTime,
                                         EndTime = se.EndTime,
                                         StartDate = sd.Session.Series.StartDate,
                                         EndDate = sd.Session.Series.Enddate
                                     }).FirstOrDefault();
                if (enrollmentDetails.Count > 0)
                {
                    foreach (var info in enrollmentDetails)
                    {
                        var emailBody = "";
                        emailBody = CommonFunction.GetTemplateFromHtml("UpdatedSeriesSessionDetailStudent.html");
                        emailBody = emailBody.Replace("{Title}", Convert.ToString(info.SessionTitle));
                        emailBody = emailBody.Replace("{StudentName}", Convert.ToString(info.StudentName));
                        emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/StudentDashboard");
                        //NotificationHelper.SendEmail(info.StudentEmail, emailBody, "There Is An Update to Your Session", true);
                        try
                        {
                            NotificationHelper.SendEmailWithICS(info.StudentEmail, emailBody, "There Is An Update to Your Session", true, (info.StartDate.Value.Date + info.StartTime.Value.TimeOfDay), (info.EndDate.Value.Date + info.EndTime.Value.TimeOfDay), info.SessionTitle);
                        }
                        catch
                        {
                            NotificationHelper.SendEmail(info.StudentEmail, emailBody, "There Is An Update to Your Session", true);
                        }
                    }
                }
                if (teacherDetail != null)
                {
                    var emailBody = "";
                    emailBody = CommonFunction.GetTemplateFromHtml("UpdatedSeriesSessionDetailTutor.html");
                    emailBody = emailBody.Replace("{Title}", Convert.ToString(teacherDetail.SessionTitle));
                    emailBody = emailBody.Replace("{TutorName}", Convert.ToString(teacherDetail.TeacherName));
                    emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/SessionDetail/" + createUpdateSessionRequest.SessionId);
                    //NotificationHelper.SendEmail(teacherDetail.TeacherEmail, emailBody, "Your Session Has Been Updated", true);
                    try
                    {
                        NotificationHelper.SendEmailWithICS(teacherDetail.TeacherEmail, emailBody, "Your Session Has Been Updated", true, (teacherDetail.StartDate.Value.Date + teacherDetail.StartTime.Value.TimeOfDay), (teacherDetail.EndDate.Value.Date + teacherDetail.EndTime.Value.TimeOfDay), teacherDetail.SessionTitle);
                    }
                    catch
                    {
                        NotificationHelper.SendEmail(teacherDetail.TeacherEmail, emailBody, "Your Session Has Been Updated", true);
                    }
                }
            }

            if (session.ModifiedBy == null && createUpdateSessionRequest.SendMail)
            {
                //var tutorDetail = (from te in  _ObjContext.Teachers
                //                     join u1 in _ObjContext.Users on te.UserId equals u1.UserId
                //                     where te.TeacherId == createUpdateSessionRequest.TeacherId
                //                     select new SessionUpdateTemplateTutorResponse
                //                     {
                //                         TeacherName = u1.FirstName,
                //                         TeacherEmail = u1.Email,
                //                         SessionTitle = createUpdateSessionRequest.SessionTitle
                //                     }).FirstOrDefault();
                var tutorDetail = (from te in _ObjContext.Teachers
                                   join u1 in _ObjContext.Users on te.UserId equals u1.UserId
                                   where te.TeacherId == createUpdateSessionRequest.TeacherId
                                   select new SessionUpdateTemplateTutorResponse
                                   {
                                       TeacherName = u1.FirstName,
                                       TeacherEmail = u1.Email,
                                       SessionTitle = createUpdateSessionRequest.SessionTitle,
                                   }).FirstOrDefault();
                var emailBody = "";
                emailBody = CommonFunction.GetTemplateFromHtml("TutorCreatedClass.html");
                emailBody = emailBody.Replace("{Title}", Convert.ToString(tutorDetail.SessionTitle));
                emailBody = emailBody.Replace("{TutorName}", Convert.ToString(tutorDetail.TeacherName));
                emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");

                //NotificationHelper.SendEmail(tutorDetail.TeacherEmail, emailBody, "Class Created Successfully", true);
                try
                {
                    NotificationHelper.SendEmailWithICS(tutorDetail.TeacherEmail, emailBody, "Class Created Successfully", true, (session.Series.StartDate.Value.Date + session.StartTime.TimeOfDay), (session.Series.Enddate.Value.Date + session.EndTime.TimeOfDay), tutorDetail.SessionTitle);
                }
                catch
                {
                    NotificationHelper.SendEmail(tutorDetail.TeacherEmail, emailBody, "Class Created Successfully", true);
                }
            }
           #endregion
                createUpdateSessionRequest.SessionId = session.SessionId;
            _MainResponse.Message = await _ObjContext.SaveChangesAsync() > 0 ? SuccessMessage.SESSION_SAVED : ErrorMessages.SESSION_NOT_SAVED;
            return _MainResponse;
        }

        public async Task<MainResponse> ValidateSession(CreateUpdateSessionRequest createUpdateSessionRequest)
        {
            _MainResponse = ValidateSession(createUpdateSessionRequest.StartTime, createUpdateSessionRequest.Duration, createUpdateSessionRequest.SessionId, createUpdateSessionRequest.TeacherId);

            if (_MainResponse.Success)
            {
                if (createUpdateSessionRequest.OtherStartTime != null && createUpdateSessionRequest.OtherStartTime.Count > 0)
                {
                    for (int i = 0; i < createUpdateSessionRequest.OtherStartTime.Count; i++)
                    {
                        _MainResponse = ValidateSession(Convert.ToDateTime(createUpdateSessionRequest.OtherStartTime[i]), createUpdateSessionRequest.Duration, createUpdateSessionRequest.SessionId, createUpdateSessionRequest.TeacherId);
                        if (!_MainResponse.Success)
                        {
                            return _MainResponse;
                        }
                    }
                }

            }
            return _MainResponse;
        }

        private MainResponse ValidateSession(DateTime startTime, int  duration, int? sessionId, int teacherId)
        {
            if (startTime < DateTime.UtcNow)
            {
                _MainResponse.Success = false;
                _MainResponse.Message = ErrorMessages.SESSION_NOT_LESS_CURRENT_TIME;
                return _MainResponse;
            }

            var newStartDateTime = startTime;
            var newEndDateTime = startTime.AddMinutes(duration);
            var sessionExists = _ObjContext.Session.Where(x => x.SessionId != sessionId && x.TeacherId == teacherId && x.RecordDeleted == "N" && ((newStartDateTime >= x.StartTime && newStartDateTime < x.EndTime) || (newEndDateTime > x.StartTime && newEndDateTime <= x.EndTime) || (newStartDateTime <= x.StartTime && newEndDateTime >= x.EndTime))).Select(x => x.SessionId).Count();
            if (sessionExists > 0)
            {
                _MainResponse.Success = false;
                _MainResponse.Message = ErrorMessages.SESSION_NOT_OVERRIDE;
            }
            else
            {
                _MainResponse.Success = true;
            }
            return _MainResponse;
        }

        public async Task<MainResponse> ValidatePrivateSessionSlotExits(PrivateSessionRequest privateSessionRequest)
        {
            if (Convert.ToDateTime(privateSessionRequest.StartTimeUTC) < DateTime.UtcNow)
            {
                _MainResponse.Success = false;
                _MainResponse.Message = ErrorMessages.SESSION_NOT_LESS_CURRENT_TIME;
                return _MainResponse;
            }

            var newStartDateTime = Convert.ToDateTime(privateSessionRequest.StartTime);
            var newEndDateTime = Convert.ToDateTime(privateSessionRequest.StartTime).AddMinutes(privateSessionRequest.Duration);

            var validRequest = (from PSADS in _ObjContext.PrivatSessionAvailableDaySlots
                                join PSAD in _ObjContext.PrivatSessionAvailableDays on PSADS.PrivatSessionAvailableDayId equals PSAD.PrivatSessionAvailableDayId into temp
                                from tempData in temp.DefaultIfEmpty()
                                where tempData.TeacherId == privateSessionRequest.TeacherId && tempData.Day == newStartDateTime.DayOfWeek.ToString()
                                        && (newStartDateTime.TimeOfDay >= PSADS.Start && newEndDateTime.TimeOfDay <= PSADS.End)
                                select new
                                {
                                    tempData.PrivatSessionAvailableDayId
                                }).Count();

            if (validRequest > 0)
            {

                _MainResponse.Success = true;
            }
            else
            {
                _MainResponse.Success = false;
                _MainResponse.Message = ErrorMessages.PRIVATE_SESSION_TIME_SLOT_NOT_AVAILABLE;
            }
            return _MainResponse;
        }

        public async Task<MainResponse> ValidatePrivateSessionRequestOverlapping(PrivateSessionRequest privateSessionRequest)
        {
            var newStartDateTime = Convert.ToDateTime(privateSessionRequest.StartTimeUTC);
            var newEndDateTime = Convert.ToDateTime(privateSessionRequest.StartTimeUTC).AddMinutes(privateSessionRequest.Duration);
            var sessionExists = _ObjContext.PrivateSessionLog.Where(x => x.TeacherId == privateSessionRequest.TeacherId && x.RecordDeleted == "N"
            && ((newStartDateTime >= x.StartTime && newStartDateTime < x.EndTime) ||
            (newEndDateTime > x.StartTime && newEndDateTime <= x.EndTime) ||
            (newStartDateTime <= x.StartTime && newEndDateTime >= x.EndTime))).Select(x => x.PrivateSessionLogId).Count();
            if (sessionExists > 0)
            {
                _MainResponse.Success = false;
                _MainResponse.Message = ErrorMessages.PRIVATE_SESSION_OVERLAP;
            }
            else
            {
                _MainResponse.Success = true;
            }
            return _MainResponse;
        }

        public async Task<MainResponse> GeneratePrivateSessionRequest(PrivateSessionRequest privateSessionRequest)
        {
            int? TeacherUserId = _ObjContext.Teachers.Where(x => x.TeacherId == privateSessionRequest.TeacherId).Select(x => x.UserId).FirstOrDefault();
            int StudentUserId = _ObjContext.Students.Where(x => x.StudentId == privateSessionRequest.StudentId).Select(x => x.UserId).FirstOrDefault();
            if (TeacherUserId != null && StudentUserId != null)
            {
                var UserStudentDetail = _ObjContext.Users.Where(x => x.UserId == StudentUserId).FirstOrDefault();
                var UserTeacherDetail = _ObjContext.Users.Where(x => x.UserId == TeacherUserId).FirstOrDefault();
                if (UserTeacherDetail != null)
                {
                    var emailBody = CommonFunction.GetTemplateFromHtml("PrivateSession.html");
                    emailBody = emailBody.Replace("{TutorName}", UserTeacherDetail.FirstName);
                    emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/Notifications");
                    NotificationHelper.SendEmail(UserTeacherDetail.Email, emailBody, "Review New Private Session Request", true);
                }
                if (UserStudentDetail != null)
                {
                    var emailBody = CommonFunction.GetTemplateFromHtml("PrivateSessionRequestSubmit.html");
                    emailBody = emailBody.Replace("{StudentName}", UserStudentDetail.FirstName);
                    NotificationHelper.SendEmail(UserStudentDetail.Email, emailBody, "New Private Session Request Sent", true);
                }

                if (_MainResponse.Success == true)
                {
                    var privateSessionLog = new PrivateSessionLog();

                    privateSessionLog.CreatedBy = privateSessionRequest.ActionPerformedBy;
                    privateSessionLog.TeacherId = privateSessionRequest.TeacherId;
                    privateSessionLog.StudentId = privateSessionRequest.StudentId;
                    privateSessionLog.SessionTitle = privateSessionRequest.SessionTitle;
                    privateSessionLog.SessionCategoryId = privateSessionRequest.SessionCategoryId;
                    privateSessionLog.StartTime = Convert.ToDateTime(privateSessionRequest.StartTimeUTC);
                    privateSessionLog.EndTime = Convert.ToDateTime(privateSessionRequest.StartTimeUTC).AddMinutes(privateSessionRequest.Duration);
                    privateSessionLog.Notes = privateSessionRequest.Notes;
                    privateSessionLog.CreatedDate = DateTime.UtcNow;
                    _ObjContext.Update(privateSessionLog);
                    _ObjContext.SaveChanges();

                    #region Notification
                    var notification = new Notifications();
                    notification.Comment = "Request for Private Session";
                    notification.ReceiverId = privateSessionRequest.TeacherId;
                    notification.ReceiverType = _ObjContext.GlobalCodes.Where(x => x.CodeName == "Tutor").Select(x => x.GlobalCodeId).First();
                    notification.TableName = "PrivateSessionLog";
                    notification.KeyId = privateSessionLog.PrivateSessionLogId;
                    _ObjContext.Update(notification);
                    #endregion
                    _MainResponse.Message = SuccessMessage.PRIVATESESSIONREQUEST;
                    _MainResponse.Success = await _ObjContext.SaveChangesAsync() > 0 ? true : false;

                    var emailBody = CommonFunction.GetTemplateFromHtml("PrivateSession.html");
                    emailBody = emailBody.Replace("{TutorName}", UserTeacherDetail.FirstName);
                    emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/Notifications");
                    try
                    {
                        NotificationHelper.SendEmailWithICS(UserTeacherDetail.Email, emailBody, "Request for Private Session", true, (privateSessionLog.CreatedDate.Date + privateSessionLog.StartTime.TimeOfDay), (privateSessionLog.CreatedDate.Date + privateSessionLog.EndTime.Value.TimeOfDay), privateSessionLog.SessionTitle);
                    }
                    catch {
                        NotificationHelper.SendEmail(UserTeacherDetail.Email, emailBody, "Request for Private Session", true);
                    }
                    
                }
            }

            return _MainResponse;
        }

        public async Task<MainResponse> SessionReviewRating(SessionReviewRatingRequest sessionReviewRatingRequest)
        {
            var reviewData = _ObjContext.Rating.Where(x => x.StudentId == sessionReviewRatingRequest.StudentId && x.RatingRefrenceId == sessionReviewRatingRequest.SessionId).FirstOrDefault();
            if (reviewData != null)
            {
                _MainResponse.Message = ErrorMessages.RATING_ALREADY_EXISTS;
                _MainResponse.Success = false;
                return _MainResponse;
            }
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@StudentId", sessionReviewRatingRequest.StudentId);
                dynamicParameters.Add("@SessionId", sessionReviewRatingRequest.SessionId);
                dynamicParameters.Add("@Review", sessionReviewRatingRequest.Review);
                dynamicParameters.Add("@Rating", sessionReviewRatingRequest.Rating);
                dynamicParameters.Add("@ActionPerformedBy", sessionReviewRatingRequest.ActionPerformedBy);

                // Excute store procedure and get last inserted id
                int result = await db.ExecuteAsync("sp_InsertSessionReviewRating", dynamicParameters, commandType: CommandType.StoredProcedure);
                if (result > 0)
                {
                    #region Send Email
                    studentReviewTemplateResponse studentReviewTemplateResponse = new studentReviewTemplateResponse();
                    studentCancellationUpdateTutorTemplate studentCancellationUpdateTutorTemplate = new studentCancellationUpdateTutorTemplate();
                    if (_ObjContext.Session.Where(x => x.SessionId == sessionReviewRatingRequest.SessionId).Select(x => x.SeriesId).FirstOrDefault() == null)
                    {
                        var userDetail = (from Se in _ObjContext.Session
                                          join SeD in _ObjContext.SessionDetail on Se.SessionId equals SeD.SessionId
                                          join T in _ObjContext.Teachers on Se.TeacherId equals T.TeacherId
                                          join U in _ObjContext.Users on T.UserId equals U.UserId

                                          where Se.SessionId == sessionReviewRatingRequest.SessionId
                                          select new studentReviewTemplateResponse
                                          {
                                              Email = U.Email,
                                              TutorName = U.FirstName,
                                              TeacherId = Se.TeacherId
                                          }).FirstOrDefault();

                        var emailBody = "";
                        emailBody = CommonFunction.GetTemplateFromHtml("TutorRatingbyStudent.html");
                        emailBody = emailBody.Replace("{TeacherName}", Convert.ToString(userDetail.TutorName));
                        emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TutorProfile/" + userDetail.TeacherId);
                        //emailBody = emailBody.Replace("{TeacherId}", Convert.ToString(userDetail.TeacherId));
                        NotificationHelper.SendEmail(userDetail.Email, emailBody, "You've received a review!", true);
                    }
                    else
                    {
                        var userDetail = (from Se in _ObjContext.Session
                                          join SeD in _ObjContext.SeriesDetail on Se.SeriesId equals SeD.SeriesId
                                          join T in _ObjContext.Teachers on Se.TeacherId equals T.TeacherId
                                          join U in _ObjContext.Users on T.UserId equals U.UserId

                                          where Se.SessionId == sessionReviewRatingRequest.SessionId
                                          select new studentReviewTemplateResponse
                                          {
                                              Email = U.Email,
                                              TutorName = U.FirstName,
                                              TeacherId = Se.TeacherId
                                          }).FirstOrDefault();

                        var emailBody = "";
                        emailBody = CommonFunction.GetTemplateFromHtml("TutorRatingbyStudent.html");
                        emailBody = emailBody.Replace("{TeacherName}", Convert.ToString(userDetail.TutorName));
                        emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TutorProfile/" + userDetail.TeacherId);
                        //emailBody = emailBody.Replace("{TeacherId}", Convert.ToString(userDetail.TeacherId));
                        NotificationHelper.SendEmail(userDetail.Email, emailBody, "You've received a review!", true);


                    }

                    //Send template to student       
                    //if (_ObjContext.Session.Where(x => x.SessionId == sessionReviewRatingRequest.SessionId).Select(x => x.SeriesId).FirstOrDefault() == null)
                    //{
                    //    var studentDetail = (from e in _ObjContext.Enrollments
                    //                         join Se in _ObjContext.Session on e.RefrenceId equals Se.SessionId
                    //                         join SeD in _ObjContext.SessionDetail on Se.SessionId equals SeD.SessionId
                    //                         join S in _ObjContext.Students on e.StudentId equals S.StudentId
                    //                         join U in _ObjContext.Users on S.UserId equals U.UserId

                    //                         where e.RefrenceId == sessionReviewRatingRequest.SessionId && e.RefrenceType == (_ObjContext.GlobalCodes.Where(x => x.CodeName == "Session").Select(x => x.GlobalCodeId).FirstOrDefault())
                    //                         select new studentReviewSubmissionTemplate
                    //                         {
                    //                             Email = U.Email,
                    //                             StudentName = U.FirstName,
                    //                             Title = SeD.SessionTitle
                    //                         }).FirstOrDefault();
                    //    var emailStudentBody = "";
                    //    emailStudentBody = CommonFunction.GetTemplateFromHtml("StudentReviewSubmission.html");
                    //    emailStudentBody = emailStudentBody.Replace("{StudentName}", Convert.ToString(studentDetail.StudentName));
                    //    emailStudentBody = emailStudentBody.Replace("{Title}", Convert.ToString(studentDetail.Title));
                    //    emailStudentBody = emailStudentBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl);
                    //    NotificationHelper.SendEmail(studentDetail.Email, emailStudentBody, "Review Submitted Successfully", true);

                    //}
                    //else
                    //{
                    //    var studentSeriesDetail = (from e in _ObjContext.Enrollments
                    //                               join Se in _ObjContext.Session on e.RefrenceId equals Se.SeriesId
                    //                               join SeD in _ObjContext.SeriesDetail on Se.SeriesId equals SeD.SeriesId
                    //                               join S in _ObjContext.Students on e.StudentId equals S.StudentId
                    //                               join U in _ObjContext.Users on S.UserId equals U.UserId

                    //                               where e.RefrenceId == Se.SeriesId && e.RefrenceType == (_ObjContext.GlobalCodes.Where(x => x.CodeName == "Series").Select(x => x.GlobalCodeId).FirstOrDefault())
                    //                               select new studentReviewSubmissionTemplate
                    //                               {
                    //                                   Email = U.Email,
                    //                                   StudentName = U.FirstName,
                    //                                   Title = SeD.SeriesTitle
                    //                               }).FirstOrDefault();
                    //    var emailStudentBody = "";
                    //    emailStudentBody = CommonFunction.GetTemplateFromHtml("StudentReviewSubmission.html");
                    //    emailStudentBody = emailStudentBody.Replace("{StudentName}", Convert.ToString(studentSeriesDetail.StudentName));
                    //    emailStudentBody = emailStudentBody.Replace("{Title}", Convert.ToString(studentSeriesDetail.Title));
                    //    emailStudentBody = emailStudentBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl);
                    //    NotificationHelper.SendEmail(studentSeriesDetail.Email, emailStudentBody, "Review Submitted Successfully", true);

                    //}

                    #endregion
                    _MainResponse.Message = SuccessMessage.RECORD_SAVED;
                }
                else
                {
                    _MainResponse.Message = ErrorMessages.RECORD_NOT_SAVED;
                    _MainResponse.Success = false;
                }
            }
            return _MainResponse;
        }

        public async Task<MainResponse> DenyPrivateSessionRequest(DenySessionRequest denySessionRequest)
        {
            var privateSessionLog = new PrivateSessionLog();

            if (denySessionRequest.PrivateSessionLogId > 0)
            {
                privateSessionLog = _ObjContext.PrivateSessionLog.Where(x => x.PrivateSessionLogId == denySessionRequest.PrivateSessionLogId && x.RecordDeleted == "N").FirstOrDefault();
                privateSessionLog.DeletedBy = denySessionRequest.ActionPerformedBy;
                privateSessionLog.DeletedDate = DateTime.UtcNow;
                privateSessionLog.RecordDeleted = "Y";
                _ObjContext.Update(privateSessionLog);

                #region Notification
                var notification = new Notifications();
                notification.Comment = "Private Session Denied.";
                notification.ReceiverId = privateSessionLog.StudentId;
                notification.ReceiverType = _ObjContext.GlobalCodes.Where(x => x.CodeName == "Student").Select(x => x.GlobalCodeId).First();
                notification.TableName = "PrivateSessionLog";
                notification.KeyId = privateSessionLog.PrivateSessionLogId;
                _ObjContext.Update(notification);
                #endregion
                _ObjContext.SaveChanges();
                _MainResponse.Message = SuccessMessage.DENY_SESSION;

                var UserStudentDetail = (from user in _ObjContext.Users
                                         join stud in _ObjContext.Students on user.UserId equals stud.UserId
                                         where stud.StudentId == privateSessionLog.StudentId
                                         select new { user.FirstName, user.Email }).FirstOrDefault();

                var emailBody = CommonFunction.GetTemplateFromHtml("PrivateSessionRequestDenyByTutor.html");
                emailBody = emailBody.Replace("{FirstName}", UserStudentDetail.FirstName);
                emailBody = emailBody.Replace("{SessionName}", privateSessionLog.SessionTitle);
                emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/CourseSearch");
                NotificationHelper.SendEmail(UserStudentDetail.Email, emailBody, "Private Session Request Denied", true);
            }
            else
            {
                _MainResponse.Message = ErrorMessages.FAILED_DENY_SESSION;
            }

            return _MainResponse;
        }

        public async Task<MainResponse> CreateUpdatePrivateSessionAvailableSlots(PrivateSessionAvailableDayRequest privateSessionAvailableDayRequest)
        {
            var teacherDetail = _ObjContext.Teachers.Where(x => x.TeacherId == privateSessionAvailableDayRequest.TeacherId).FirstOrDefault();
            teacherDetail.PrivateSession = privateSessionAvailableDayRequest.PrivateSession;
            teacherDetail.FeePerHours = privateSessionAvailableDayRequest.FeePerHours;
            teacherDetail.PrivateSessionCategories = privateSessionAvailableDayRequest.PrivateSessionCategories;
            teacherDetail.PrivateSessionTimeZone = privateSessionAvailableDayRequest.PrivateSessionTimeZone;
            _ObjContext.Teachers.Update(teacherDetail);
            _ObjContext.SaveChanges();

            if (privateSessionAvailableDayRequest.PrivateSession == "Y")
            {
                foreach (var privateSessionAvailableDay in privateSessionAvailableDayRequest.PrivateSessionAvailableDays)
                {
                    var privatSessionAvailableDays = _ObjContext.PrivatSessionAvailableDays.Where(x => x.TeacherId == privateSessionAvailableDayRequest.TeacherId && x.Day == privateSessionAvailableDay.Day).FirstOrDefault();
                    privatSessionAvailableDays = privatSessionAvailableDays == null ? new PrivatSessionAvailableDays() : privatSessionAvailableDays;
                    privatSessionAvailableDays.Day = privateSessionAvailableDay.Day;
                    privatSessionAvailableDays.Opened = privateSessionAvailableDay.Opened;
                    privatSessionAvailableDays.TeacherId = privateSessionAvailableDayRequest.TeacherId;
                    _ObjContext.Update(privatSessionAvailableDays);
                    _ObjContext.SaveChanges();

                    using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
                    {
                        var avilableDaySlots = privateSessionAvailableDay.PrivateSessionAvailableDaySlots != null ? CommonFunction.ConvertObjectToString(privateSessionAvailableDay.PrivateSessionAvailableDaySlots) : null;
                        // Creating SP paramete list
                        var dynamicParameters = new DynamicParameters();
                        dynamicParameters.Add("@PrivatSessionAvailableDayId", privatSessionAvailableDays.PrivatSessionAvailableDayId);
                        dynamicParameters.Add("@Json", avilableDaySlots);

                        await db.ExecuteAsync("sp_UpdatePrivateSessionSlots", dynamicParameters, commandType: CommandType.StoredProcedure);
                    }
                    
                }
            }
            _MainResponse.Message = SuccessMessage.PRIVATESESSIONSLOTS_SAVED;

            return _MainResponse;
        }


        public async Task<MainResponse> AcceptPrivateSessionRequest(AcceptSessionRequest acceptSessionRequest)
        {
            var privateSessionLog = new PrivateSessionLog();
            if (acceptSessionRequest.PrivateSessionLogId > 0)
            {
                //Validate Private Session
                var createUpdateSessionRequest = new CreateUpdateSessionRequest();
                privateSessionLog = _ObjContext.PrivateSessionLog.Where(x => x.PrivateSessionLogId == acceptSessionRequest.PrivateSessionLogId && x.RecordDeleted == "N").FirstOrDefault();

                var UserTeacherDetail = (from user in _ObjContext.Users
                                         join teach in _ObjContext.Teachers on user.UserId equals teach.UserId
                                         where teach.TeacherId == privateSessionLog.TeacherId
                                         select new { user.FirstName, user.Email, teach.FeePerHours, teach.PrivateSessionTimeZone,user.Languages }).FirstOrDefault();

                createUpdateSessionRequest.SessionTitle = privateSessionLog.SessionTitle;
                createUpdateSessionRequest.SessionCategoryId = Convert.ToInt32(privateSessionLog.SessionCategoryId);
                createUpdateSessionRequest.NumberOfJoineesAllowed = 1;
                createUpdateSessionRequest.StartTime = privateSessionLog.StartTime;
                TimeSpan timeSpan = (DateTime)privateSessionLog.EndTime  - (DateTime)privateSessionLog.StartTime;
                createUpdateSessionRequest.Duration = Convert.ToInt32(timeSpan.TotalMinutes);
                createUpdateSessionRequest.TeacherId = privateSessionLog.TeacherId;
                createUpdateSessionRequest.SessionFee = Convert.ToDecimal((UserTeacherDetail.FeePerHours / 60) * createUpdateSessionRequest.Duration);
                createUpdateSessionRequest.PrivateSession = "Y";
                createUpdateSessionRequest.TimeZone = null;
                createUpdateSessionRequest.Language = UserTeacherDetail.Languages;
                _MainResponse = await ValidateSession(createUpdateSessionRequest);
                if (_MainResponse.Success)
                {
                    _MainResponse = await CreateUpdateSession(createUpdateSessionRequest);
                    if(_MainResponse.Success)
                    {
                        #region Private Session Log
                        privateSessionLog.IsAccept = "Y";
                        privateSessionLog.ModifiedDate = DateTime.UtcNow;
                        privateSessionLog.ModifiedBy = acceptSessionRequest.ActionPerformedBy;
                        privateSessionLog.SessionId = createUpdateSessionRequest.SessionId;
                        _ObjContext.Update(privateSessionLog);
                        #endregion

                        #region Notification
                        var notification = new Notifications();
                        notification.Comment = "Private Session Accepted.";
                        notification.ReceiverId = privateSessionLog.StudentId;
                        notification.ReceiverType = _ObjContext.GlobalCodes.Where(x => x.CodeName == "Student").Select(x => x.GlobalCodeId).First();
                        notification.TableName = "PrivateSessionLog";
                        notification.KeyId = privateSessionLog.PrivateSessionLogId;
                        _ObjContext.Update(notification);
                        #endregion

                        _ObjContext.SaveChanges();
                        _MainResponse.Message = SuccessMessage.ACCEPT_PRIVATE_SESSION;

                        #region EmailSend
                        var UserStudentDetail = (from user in _ObjContext.Users
                                                 join stud in _ObjContext.Students on user.UserId equals stud.UserId
                                                 where stud.StudentId == privateSessionLog.StudentId
                                                 select new { user.FirstName, user.Email }).FirstOrDefault();



                        var emailBody = CommonFunction.GetTemplateFromHtml("PrivateSessionRequestApproved.html");
                        emailBody = emailBody.Replace("{FirstName}", UserStudentDetail.FirstName);
                        emailBody = emailBody.Replace("{TutorFirstName}", UserTeacherDetail.FirstName);
                        //NotificationHelper.SendEmail(UserStudentDetail.Email, emailBody, "Private Session Request Accepted", true);
                        try
                        {
                            NotificationHelper.SendEmailWithICS(UserStudentDetail.Email, emailBody, "Private Session Request Accepted", true, (DateTime.UtcNow.Date+ createUpdateSessionRequest.StartTime.TimeOfDay), (DateTime.UtcNow.Date + privateSessionLog.EndTime.Value.TimeOfDay), createUpdateSessionRequest.SessionTitle);
                        }
                        catch
                        {
                            NotificationHelper.SendEmail(UserStudentDetail.Email, emailBody, "Private Session Request Accepted", true);
                        }
                        #endregion
                    }
                } 
            }
            else
            {
                _MainResponse.Message = ErrorMessages.FAILED_ACCEPT_SESSION;
            }

            return _MainResponse;
        }

    }
}
