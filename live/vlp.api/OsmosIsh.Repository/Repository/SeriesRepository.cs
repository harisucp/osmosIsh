using AutoMapper;
using Org.BouncyCastle.Math.EC.Rfc7748;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Enums;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Data.DBEntities;
using OsmosIsh.Repository.IRepository;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.Repository
{
    public class SeriesRepository : BaseRepository<Series>, ISeriesRepository
    {
        #region readonly
        private readonly IMapper _Mapper;
        #endregion

        OsmosIshContext _ObjContext;
        MainResponse _MainResponse = null;
        private string SeriesImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Upload", "Series", "Image");
        private string SeriesVideoPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Upload", "Series", "Video");

        public SeriesRepository(OsmosIshContext ObjContext, IMapper Mapper) : base(ObjContext)
        {
            _MainResponse = new MainResponse();
            _ObjContext = ObjContext;
            _Mapper = Mapper;
        }

        public async Task<MainResponse> CreateSeries(CreateSeriesRequest createSeriesRequest, List<DateTime> recurrenceDates)
        {
            #region Series
            var series = new Series();
            series.CreatedBy = createSeriesRequest.ActionPerformedBy;
            series.TeacherId = createSeriesRequest.TeacherId;
            series.StartDate = recurrenceDates.First();
            series.Enddate = recurrenceDates.Last().AddMinutes(createSeriesRequest.Duration);
            _ObjContext.Add(series);
            _ObjContext.SaveChanges();
            #endregion

            #region Series detail
            var SeriesDetail = new SeriesDetail();
            SeriesDetail.CreatedBy = createSeriesRequest.ActionPerformedBy;
            SeriesDetail.SeriesId = series.SeriesId;
            SeriesDetail.SeriesTitle = createSeriesRequest.SeriesTitle;
            SeriesDetail.NumberOfJoineesAllowed = createSeriesRequest.NumberOfJoineesAllowed;
            SeriesDetail.Description = createSeriesRequest.Description;
            SeriesDetail.Agenda = createSeriesRequest.Agenda;
            SeriesDetail.Language = createSeriesRequest.Language;
            SeriesDetail.SeriesFee = createSeriesRequest.SeriesFee;
            SeriesDetail.TimeZone = createSeriesRequest.TimeZone;
            SeriesDetail.SeriesTags = createSeriesRequest.SeriesTags;
            SeriesDetail.SeriesCategoryId = createSeriesRequest.SeriesCategoryId;
            SeriesDetail.NumberOfSessions = createSeriesRequest.NumberOfSessions;
            _ObjContext.Add(SeriesDetail);
            #endregion


            var AffiliateId = (from T in _ObjContext.Teachers
                               join TAC in _ObjContext.TeacherAffiliateCode on T.TeacherId equals TAC.TeacherId
                               join A in _ObjContext.Affiliates on TAC.AffiliateCode equals A.AffiliateCode
                               where TAC.IsDeleted == "N" && A.Active == "Y" && T.TeacherId == createSeriesRequest.TeacherId
                               select new
                               {
                                   A.AffiliateId
                               }).FirstOrDefault();

            #region Session 
            foreach (DateTime date in recurrenceDates)
            {
                var session = new Session();
                session.SeriesId = series.SeriesId;
                session.TeacherId = createSeriesRequest.TeacherId;
                session.StartTime = date;
                session.EndTime = date.AddMinutes(createSeriesRequest.Duration);
                session.Duration = createSeriesRequest.Duration;
                session.CreatedBy = createSeriesRequest.ActionPerformedBy;
                if (AffiliateId != null)
                    session.AffiliateId = AffiliateId.AffiliateId;
                _ObjContext.Add(session);
            }
            #endregion

            #region Image
            int globalCodeImageTypeId = _ObjContext.GlobalCodes.Where(x => x.CodeName == FileTypes.SERIESIMAGE).Select(x => x.GlobalCodeId).FirstOrDefault();
            // Update Image Case
            if (createSeriesRequest.Image != null)
            {
                var image = new Images();
                var imageStoredPath = CommonFunction.UploadImage(SeriesImagePath, FileTypes.SERIESIMAGE, createSeriesRequest.Image);
                image.ImageFile = imageStoredPath;
                image.ImageTypeId = globalCodeImageTypeId;
                image.ImageRefrenceId = series.SeriesId;
                image.CreatedBy = createSeriesRequest.ActionPerformedBy;
                _ObjContext.Add(image);
            }
            else if (createSeriesRequest.CopySeriesId > 0)
            {
                var parentImage = _ObjContext.Images.Where(x => x.ImageRefrenceId == createSeriesRequest.CopySeriesId && x.ImageTypeId == globalCodeImageTypeId).FirstOrDefault();

                if (parentImage != null)
                {
                    var image = new Images();
                    image.ImageFile = parentImage.ImageFile;
                    image.ImageTypeId = parentImage.ImageTypeId;
                    image.ImageRefrenceId = series.SeriesId;
                    image.CreatedBy = createSeriesRequest.ActionPerformedBy;
                    _ObjContext.Update(image);
                }
            }
            #endregion

            #region Video
            int globalCodeVideoTypeId = _ObjContext.GlobalCodes.Where(x => x.CodeName == FileTypes.SERIESVIDEO).Select(x => x.GlobalCodeId).FirstOrDefault();
            if (createSeriesRequest.Video != null)
            {
                var video = new Images();
                var videoStoredPath = CommonFunction.UploadImage(SeriesVideoPath, FileTypes.SERIESVIDEO, createSeriesRequest.Video);
                video.ImageFile = videoStoredPath;
                video.ImageTypeId = globalCodeVideoTypeId;
                video.ImageRefrenceId = series.SeriesId;
                video.CreatedBy = createSeriesRequest.ActionPerformedBy;
                _ObjContext.Add(video);
            }
            #endregion
            #region Send Email

            var tutorDetail = (from te in _ObjContext.Teachers
                               join u1 in _ObjContext.Users on te.UserId equals u1.UserId
                               where te.TeacherId == createSeriesRequest.TeacherId
                               select new SessionUpdateTemplateTutorResponse
                               {
                                   TeacherName = u1.FirstName,
                                   TeacherEmail = u1.Email,
                                   SessionTitle = createSeriesRequest.SeriesTitle
                               }).FirstOrDefault();
            var emailBody = "";
            emailBody = CommonFunction.GetTemplateFromHtml("TutorCreatedClass.html");
            emailBody = emailBody.Replace("{Title}", Convert.ToString(createSeriesRequest.SeriesTitle));
            emailBody = emailBody.Replace("{TutorName}", Convert.ToString(tutorDetail.TeacherName));
            emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");

            NotificationHelper.SendEmail(tutorDetail.TeacherEmail, emailBody, "Class Created Successfully", true);
            // try
            // {
            //     NotificationHelper.SendEmailWithICS(tutorDetail.TeacherEmail, emailBody, "Class Created Successfully", true, series.StartDate, series.Enddate);
            // }
            // catch
            // {
            //     NotificationHelper.SendEmail(tutorDetail.TeacherEmail, emailBody, "Class Created Successfully", true);
            // }

            #endregion

            _MainResponse.Message = await _ObjContext.SaveChangesAsync() > 0 ? SuccessMessage.SERIES_SAVED : ErrorMessages.SERIES_NOT_CREATED;
            return _MainResponse;
        }

        public async Task<MainResponse> UpdateSeriesDetail(UpdateSeriesDetailRequest updateSeriesDetailRequest)
        {

            #region Series detail
            var seriesDetail = _ObjContext.SeriesDetail.Where(x => x.SeriesId == updateSeriesDetailRequest.SeriesId).FirstOrDefault();
            seriesDetail.ModifiedBy = updateSeriesDetailRequest.ActionPerformedBy;
            seriesDetail.ModifiedDate = DateTime.UtcNow;
            seriesDetail.SeriesTitle = updateSeriesDetailRequest.SeriesTitle;
            seriesDetail.NumberOfJoineesAllowed = updateSeriesDetailRequest.NumberOfJoineesAllowed;
            seriesDetail.Description = updateSeriesDetailRequest.Description;
            seriesDetail.Agenda = updateSeriesDetailRequest.Agenda;
            seriesDetail.Language = updateSeriesDetailRequest.Language;
            seriesDetail.SeriesFee = updateSeriesDetailRequest.SeriesFee;
            seriesDetail.TimeZone = updateSeriesDetailRequest.TimeZone;
            seriesDetail.SeriesTags = updateSeriesDetailRequest.SeriesTags;
            seriesDetail.SeriesCategoryId = updateSeriesDetailRequest.SeriesCategoryId;
            _ObjContext.Update(seriesDetail);
            #endregion

            #region Image
            int globalCodeImageTypeId = _ObjContext.GlobalCodes.Where(x => x.CodeName == FileTypes.SERIESIMAGE).Select(x => x.GlobalCodeId).FirstOrDefault();
            // Update Image Case
            if (updateSeriesDetailRequest.IsImageUpdated)
            {
                var image = _ObjContext.Images.Where(x => x.ImageRefrenceId == updateSeriesDetailRequest.SeriesId && x.ImageTypeId == globalCodeImageTypeId).FirstOrDefault();
                var imageStoredPath = string.Empty;
                if (image != null)
                {
                    if (updateSeriesDetailRequest.Image != null)
                    {
                        imageStoredPath = CommonFunction.UploadImage(SeriesImagePath, FileTypes.SERIESIMAGE, updateSeriesDetailRequest.Image);
                    }
                    else
                    {
                        imageStoredPath = null;
                    }
                    image.ModifiedBy = updateSeriesDetailRequest.ActionPerformedBy;
                    image.ModifiedDate = DateTime.UtcNow;
                    image.ImageFile = imageStoredPath;
                }
                else if (updateSeriesDetailRequest.Image != null)
                {
                    image = new Images();
                    image.ImageFile = CommonFunction.UploadImage(SeriesImagePath, FileTypes.SERIESIMAGE, updateSeriesDetailRequest.Image);
                    image.ImageTypeId = globalCodeImageTypeId;
                    image.ImageRefrenceId = seriesDetail.SeriesId;
                    image.CreatedBy = updateSeriesDetailRequest.ActionPerformedBy;
                }
                _ObjContext.Update(image);
            }
            #endregion

            #region Video
            int globalCodeVideoTypeId = _ObjContext.GlobalCodes.Where(x => x.CodeName == FileTypes.SERIESVIDEO).Select(x => x.GlobalCodeId).FirstOrDefault();
            if (updateSeriesDetailRequest.IsVideoUpdated)
            {
                var videoStoredPath = string.Empty;
                var video = _ObjContext.Images.Where(x => x.ImageRefrenceId == updateSeriesDetailRequest.SeriesId && x.ImageTypeId == globalCodeVideoTypeId).FirstOrDefault();
                if (video != null)
                {
                    if (updateSeriesDetailRequest.IsVideoUpdated)
                    {
                        if (updateSeriesDetailRequest.Video != null)
                        {
                            videoStoredPath = CommonFunction.UploadImage(SeriesVideoPath, FileTypes.SERIESVIDEO, updateSeriesDetailRequest.Video);
                        }
                        else
                        {
                            videoStoredPath = null;
                        }
                        video.ModifiedBy = updateSeriesDetailRequest.ActionPerformedBy;
                        video.ModifiedDate = DateTime.UtcNow;
                        video.ImageFile = videoStoredPath;
                        _ObjContext.Update(video);
                    }
                }
                else
                {
                    video = new Images();
                    video.ImageFile = CommonFunction.UploadImage(SeriesVideoPath, FileTypes.SERIESVIDEO, updateSeriesDetailRequest.Video);
                    video.ImageTypeId = globalCodeVideoTypeId;
                    video.ImageRefrenceId = updateSeriesDetailRequest.SeriesId;
                    video.CreatedBy = updateSeriesDetailRequest.ActionPerformedBy;
                    _ObjContext.Update(video);
                }
            }
            #endregion

            #region Send Email

            SessionUpdateTemplateresponse sessionUpdateTemplateresponse = new SessionUpdateTemplateresponse();
            var enrollmentDetails = (from e in _ObjContext.Enrollments
                                     join tr in _ObjContext.Transactions on e.TransactionId equals tr.TransactionId
                                     join s in _ObjContext.Students on e.StudentId equals s.StudentId
                                     join u in _ObjContext.Users on s.UserId equals u.UserId
                                     join se in _ObjContext.Series on e.RefrenceId equals se.SeriesId
                                     join sd in _ObjContext.SeriesDetail on se.SeriesId equals sd.SeriesId
                                     where e.RefrenceId == seriesDetail.SeriesId && e.RefrenceType == (_ObjContext.GlobalCodes.Where(x => x.CodeName == "Series").Select(x => x.GlobalCodeId).FirstOrDefault()) && e.RecordDeleted == "N" && tr.IsPaymentSuccess == "Y"
                                     select new SessionUpdateTemplateresponse
                                     {
                                         StudentName = u.FirstName,
                                         SessionTitle = sd.SeriesTitle,
                                         StudentEmail = u.Email
                                     }).Distinct().ToList();
            SessionUpdateTemplateTutorResponse sessionUpdateTemplateTutorResponse = new SessionUpdateTemplateTutorResponse();
            var teacherDetail = (from se in _ObjContext.Series
                                 join te in _ObjContext.Teachers on se.TeacherId equals te.TeacherId
                                 join u1 in _ObjContext.Users on te.UserId equals u1.UserId
                                 join sd in _ObjContext.SeriesDetail on se.SeriesId equals sd.SeriesId
                                 where se.SeriesId == seriesDetail.SeriesId && se.RecordDeleted == "N"
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
                    var emailBody = "";
                    emailBody = CommonFunction.GetTemplateFromHtml("UpdatedSeriesSessionDetailStudent.html");
                    emailBody = emailBody.Replace("{Title}", Convert.ToString(info.SessionTitle));
                    emailBody = emailBody.Replace("{StudentName}", Convert.ToString(info.StudentName));
                    emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/StudentDashboard");
                    NotificationHelper.SendEmail(info.StudentEmail, emailBody, "There Is An Update to Your Session", true);
                }
            }
            if (teacherDetail != null)
            {
                var emailBody = "";
                emailBody = CommonFunction.GetTemplateFromHtml("UpdatedSeriesSessionDetailTutor.html");
                emailBody = emailBody.Replace("{Title}", Convert.ToString(teacherDetail.SessionTitle));
                emailBody = emailBody.Replace("{TutorName}", Convert.ToString(teacherDetail.TeacherName));
                emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/SeriesDetail/" + updateSeriesDetailRequest.SeriesId);
                NotificationHelper.SendEmail(teacherDetail.TeacherEmail, emailBody, "Your Session Has Been Updated" +
                     "", true);
               
            }
            #endregion

            _MainResponse.Message = await _ObjContext.SaveChangesAsync() > 0 ? SuccessMessage.SERIES_SAVED : ErrorMessages.SERIES_NOT_CREATED;
            return _MainResponse;
        }

        public async Task<MainResponse> UpdateSeriesSessionDetail(UpdateSeriesSessionDetailRequest updateSeriesSessionDetailRequest)
        {
            if (updateSeriesSessionDetailRequest.StartDateTime < DateTime.UtcNow)
            {
                _MainResponse.Success = false;
                _MainResponse.Message = ErrorMessages.SESSION_NOT_LESS_CURRENT_TIME;
                return _MainResponse;
            }

            var newStartDateTime = updateSeriesSessionDetailRequest.StartDateTime;
            var newEndDateTime = updateSeriesSessionDetailRequest.StartDateTime.AddMinutes(updateSeriesSessionDetailRequest.Duration);
            var sessionExists = _ObjContext.Session.Where(x => x.TeacherId == updateSeriesSessionDetailRequest.TeacherId
            && x.SessionId != updateSeriesSessionDetailRequest.SessionId
            && ((newStartDateTime >= x.StartTime && newStartDateTime < x.EndTime) || (newEndDateTime >= x.StartTime && newEndDateTime <= x.EndTime) ||
            (newStartDateTime <= x.StartTime && newEndDateTime >= x.EndTime)) && x.RecordDeleted == "N").Select(x => x.SessionId).FirstOrDefault();
            if (sessionExists > 0)
            {
                _MainResponse.Success = false;
                _MainResponse.Message = ErrorMessages.SERRIES_SESSION_NOT_OVERRIDE;
                return _MainResponse;
            }

            #region Session Detail 
            if (updateSeriesSessionDetailRequest.IsAllFutureUpdate)
            {
            }
            else
            {
                var sessionDetail = _ObjContext.Session.Where(x => x.SeriesId == updateSeriesSessionDetailRequest.SeriesId
                && x.TeacherId == updateSeriesSessionDetailRequest.TeacherId
                && x.SessionId == updateSeriesSessionDetailRequest.SessionId).FirstOrDefault();
                sessionDetail.StartTime = updateSeriesSessionDetailRequest.StartDateTime;
                sessionDetail.EndTime = updateSeriesSessionDetailRequest.StartDateTime.AddMinutes(updateSeriesSessionDetailRequest.Duration);
                sessionDetail.Duration = updateSeriesSessionDetailRequest.Duration;
                sessionDetail.ModifiedDate = DateTime.UtcNow;
                sessionDetail.ModifiedBy = updateSeriesSessionDetailRequest.ActionPerformedBy;
                _ObjContext.Update(sessionDetail);
                await _ObjContext.SaveChangesAsync();

                var seriesSessionDetail = _ObjContext.Session.Where(x => x.SeriesId == updateSeriesSessionDetailRequest.SeriesId).OrderBy(x => x.StartTime).ToList();
                var seriesDetail = _ObjContext.Series.Where(x => x.SeriesId == updateSeriesSessionDetailRequest.SeriesId).FirstOrDefault();
                if (seriesSessionDetail != null && seriesDetail != null)
                {
                    seriesDetail.StartDate = seriesSessionDetail[0].StartTime;
                    seriesDetail.Enddate = seriesSessionDetail[seriesSessionDetail.Count - 1].EndTime;
                    seriesDetail.ModifiedBy = updateSeriesSessionDetailRequest.ActionPerformedBy;
                    seriesDetail.ModifiedDate = DateTime.UtcNow;
                    _ObjContext.Update(seriesDetail);

                }
            }
            #region Send Email

            SessionUpdateTemplateresponse sessionUpdateTemplateresponse = new SessionUpdateTemplateresponse();
            var enrollmentDetails = (from e in _ObjContext.Enrollments
                                     join tr in _ObjContext.Transactions on e.TransactionId equals tr.TransactionId
                                     join s in _ObjContext.Students on e.StudentId equals s.StudentId
                                     join u in _ObjContext.Users on s.UserId equals u.UserId
                                     join se in _ObjContext.Series on e.RefrenceId equals se.SeriesId
                                     join sd in _ObjContext.SeriesDetail on se.SeriesId equals sd.SeriesId
                                     where e.RecordDeleted == "N" && e.RefrenceId == updateSeriesSessionDetailRequest.SeriesId && e.RefrenceType == (_ObjContext.GlobalCodes.Where(x => x.CodeName == "Series").Select(x => x.GlobalCodeId).FirstOrDefault()) && tr.IsPaymentSuccess == "Y"
                                     select new SessionUpdateTemplateresponse
                                     {
                                         StudentName = u.FirstName,
                                         SessionTitle = sd.SeriesTitle,
                                         StudentEmail = u.Email
                                     }).Distinct().ToList();
            SessionUpdateTemplateTutorResponse sessionUpdateTemplateTutorResponse = new SessionUpdateTemplateTutorResponse();
            var teacherDetail = (from se in _ObjContext.Series
                                 join te in _ObjContext.Teachers on se.TeacherId equals te.TeacherId
                                 join u1 in _ObjContext.Users on te.UserId equals u1.UserId
                                 join sd in _ObjContext.SeriesDetail on se.SeriesId equals sd.SeriesId
                                 where se.SeriesId == updateSeriesSessionDetailRequest.SeriesId
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
                    var emailBody = "";
                    emailBody = CommonFunction.GetTemplateFromHtml("UpdatedSeriesSessionDetailStudent.html");
                    emailBody = emailBody.Replace("{Title}", Convert.ToString(info.SessionTitle));
                    emailBody = emailBody.Replace("{StudentName}", Convert.ToString(info.StudentName));
                    emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/StudentDashboard");
                    
                    try
                    {
                        NotificationHelper.SendEmailWithICS(info.StudentEmail, emailBody, "There Is An Update to Your Session", true, newStartDateTime, newEndDateTime, info.SessionTitle);
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
                emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/SeriesDetail/" + updateSeriesSessionDetailRequest.SeriesId);
               
                try
                {
                    NotificationHelper.SendEmailWithICS(teacherDetail.TeacherEmail, emailBody, "Your Session Has Been Updated", true, newStartDateTime, newEndDateTime, teacherDetail.SessionTitle);
                }
                catch
                {
                    NotificationHelper.SendEmail(teacherDetail.TeacherEmail, emailBody, "Your Session Has Been Updated" +
                    "", true);
                }
            }
            #endregion
            #endregion
            _MainResponse.Message = await _ObjContext.SaveChangesAsync() > 0 ? SuccessMessage.SERIES_SAVED : ErrorMessages.SERIES_NOT_CREATED;
            return _MainResponse;
        }

        public async Task<MainResponse> ValidateCreateSeries(CreateSeriesRequest createSeriesRequest)
        {
            if (createSeriesRequest.StartDateTime < DateTime.UtcNow)
            {
                _MainResponse.Success = false;
                _MainResponse.Message = ErrorMessages.SERIES_NOT_LESS_CURRENT_TIME;
                return _MainResponse;
            }
            List<DateTime> recurrenceDates = null;
            #region Recurrance Dates
            switch (createSeriesRequest.Repeat.ToLower())
            {
                case "daily":
                    recurrenceDates = CommonFunction.RecurrenceDays(createSeriesRequest.StartDateTime, createSeriesRequest.NumberOfSessions, createSeriesRequest.SelectedWeekDays);
                    break;
                case "weekly":
                    recurrenceDates = CommonFunction.RecurrenceWeeks(createSeriesRequest.StartDateTime, createSeriesRequest.NumberOfSessions);
                    break;
                case "monthly":
                    recurrenceDates = CommonFunction.RecurrenceMonths(createSeriesRequest.StartDateTime, createSeriesRequest.NumberOfSessions);
                    break;
            }
            #endregion
            foreach (DateTime date in recurrenceDates)
            {
                var newStartDateTime = date;
                var newEndDateTime = date.AddMinutes(createSeriesRequest.Duration);
                var sessionExists = _ObjContext.Session.Where(x => x.TeacherId == createSeriesRequest.TeacherId && x.RecordDeleted == "N" && ((newStartDateTime >= x.StartTime && newStartDateTime < x.EndTime) || (newEndDateTime > x.StartTime && newEndDateTime <= x.EndTime) || (newStartDateTime <= x.StartTime && newEndDateTime >= x.EndTime))).Select(x => x.SessionId).Count();
                if (sessionExists > 0)
                {
                    _MainResponse.Success = false;
                    _MainResponse.Message = ErrorMessages.SERRIES_SESSION_NOT_OVERRIDE;
                    return _MainResponse;
                }
            }

            if (_MainResponse.Success)
            {
                return await CreateSeries(createSeriesRequest, recurrenceDates);
            }
            return _MainResponse;
        }



    }
}
