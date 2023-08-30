using AutoMapper;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.DTOs.Response.Common;
using OsmosIsh.Core.Shared.Helper;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Repository.IRepository;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.Repository
{

    public class CommonRepository : ICommonRepository
    {
        #region readonly
        private readonly IMapper _Mapper;
        #endregion

        #region Private
        private MainResponse _MainResponse;
        #endregion

        #region public
        public OsmosIshContext _ObjContext;
        public List<EntriesState> _EntriesStates = null;
        #endregion

        public CommonRepository(OsmosIshContext ObjContext, IMapper Mapper)
        {
            _ObjContext = ObjContext;
            _MainResponse = new MainResponse();
            _Mapper = Mapper;
        }

        #region Delegates
        //Define a delegate
        public delegate PostSaveResponse PostSaveEventHandler(object source, PostSaveEventArgs args);


        //Define event based on that delefate
        public event PostSaveEventHandler PostSaved;
        #endregion
        public async Task<MainResponse> SaveUpdateEntity(SaveRequest request)
        {
            var readDataJsonFile = new ReadDataJsonFile();
            var mappedDataWithEntityName = readDataJsonFile.CheckMappingSpecificEntityName(request.EntityName);
            if (mappedDataWithEntityName != null && mappedDataWithEntityName.MappedStoreProcedureData != null && !string.IsNullOrEmpty(mappedDataWithEntityName.MappedStoreProcedureData.StoredProcedure))
            {
                return await SaveUpdateWithStorePorcedure(request, mappedDataWithEntityName.MappedStoreProcedureData.StoredProcedure, mappedDataWithEntityName.MappedStoreProcedureData.SqlParameters);
            }
            else
            {
                return await SaveUpdateWithEntity(request);
            }
        }

        private async Task<MainResponse> SaveUpdateWithStorePorcedure(SaveRequest request, string StoredProcedure, IList<string> SqlParameters)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                if (request.Data != null && SqlParameters != null)
                {
                    var sqlParameterCollection = CommonFunction.GetSQLParameters(CommonFunction.ConvertObjectToString(request.Data.FirstOrDefault()));
                    foreach (var sqlParameter in SqlParameters)
                    {
                        dynamicParameters.Add("@" + sqlParameter, sqlParameterCollection.Where(x => x.Key.ToLower() == sqlParameter.ToLower()).FirstOrDefault().Value);
                    }
                }

                // Excute store procedure and get last inserted id
                int result = await db.ExecuteAsync(StoredProcedure, dynamicParameters, commandType: CommandType.StoredProcedure);
                if (result > 0)
                {
                    OnPostSaved(request, _ObjContext.ChangeTracker.Entries());
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

        private async Task<MainResponse> SaveUpdateWithEntity(SaveRequest request)
        {
            string entityPath = CommonFunction.GetEntityPath(request.EntityName);
            Type type = CommonFunction.GetType(entityPath);
            foreach (object obj in request.Data)
            {
                var entity = JsonConvert.DeserializeObject(CommonFunction.ConvertObjectToString(obj), type);
                _ObjContext.Update(entity);
            }
            PreSaveUpdates(_ObjContext.ChangeTracker.Entries(), request);
            int result = await _ObjContext.SaveChangesAsync();
            if (result > 0)
            {
                OnPostSaved(request, _ObjContext.ChangeTracker.Entries());
                _MainResponse.Message = SuccessMessage.RECORD_SAVED;
            }
            else
            {
                _MainResponse.Message = ErrorMessages.RECORD_NOT_SAVED;
                _MainResponse.Success = false;
            }
            return _MainResponse;

        }

        private void PreSaveUpdates(IEnumerable<EntityEntry> entries, SaveRequest request)
        {
            _EntriesStates = new List<EntriesState>();
            // List of all Entites that are changed.
            foreach (var entry in entries)
            {
                //Console.WriteLine($"Entity: {entry.Entity.GetType().Name},State: { entry.State.ToString()}");
                var entityName = entry.Entity.GetType().Name;

                if (entry.State.ToString() == "Added")
                {
                    if (entry.Entity.GetType().GetProperty(BaseEntityConstant.CREATEBY) != null)
                    {
                        entry.Property(BaseEntityConstant.CREATEBY).CurrentValue = request.AdditionalFields.UserName;
                    }
                    if (entry.Entity.GetType().GetProperty(BaseEntityConstant.CREATEDATE) != null)
                    {
                        entry.Property(BaseEntityConstant.CREATEDATE).CurrentValue = DateTime.UtcNow;
                    }
                    _EntriesStates.Add(new EntriesState { EntityName = entry.Entity.GetType().Name.ToString(), EntityState = entry.State.ToString() });
                }
                else if (entry.State.ToString() == "Modified")
                {
                    var databaseValues = entry.GetDatabaseValues();
                    if (entry.Entity.GetType().GetProperty(BaseEntityConstant.RECORDDELETED) != null && entry.CurrentValues[BaseEntityConstant.RECORDDELETED] != null && entry.CurrentValues[BaseEntityConstant.RECORDDELETED] != databaseValues[BaseEntityConstant.RECORDDELETED])
                    {
                        databaseValues[BaseEntityConstant.RECORDDELETED] = entry.CurrentValues[BaseEntityConstant.RECORDDELETED];
                        entry.CurrentValues.SetValues(databaseValues);
                        _EntriesStates.Add(new EntriesState { EntityName = entry.Entity.GetType().Name.ToString(), EntityState = "Deleted", OldValues = databaseValues });
                    }
                    else
                    {
                        _EntriesStates.Add(new EntriesState { EntityName = entry.Entity.GetType().Name.ToString(), EntityState = entry.State.ToString(), OldValues = databaseValues });
                    }
                    // loop through all property that are modified
                    foreach (var prop in entry.OriginalValues.Properties)
                    {
                        //var originalValue = databaseValues[prop.Name] != null ? databaseValues[prop.Name].ToString() : null;
                        //var currentValue = entry.CurrentValues[prop.Name] != null ? entry.CurrentValues[prop.Name].ToString() : null;            
                        switch (prop.Name)
                        {
                            case BaseEntityConstant.CREATEBY:
                            case BaseEntityConstant.CREATEDATE:
                                entry.CurrentValues[prop.Name] = databaseValues[prop.Name];
                                break;
                            case BaseEntityConstant.ACTIVE:
                                if (entry.CurrentValues[BaseEntityConstant.ACTIVE] == null)
                                {
                                    entry.CurrentValues[prop.Name] = databaseValues[prop.Name];
                                }
                                break;
                            case BaseEntityConstant.RECORDDELETED:
                                if (entry.CurrentValues[BaseEntityConstant.RECORDDELETED] != null && entry.CurrentValues[BaseEntityConstant.RECORDDELETED].ToString() == "Y")
                                {
                                    entry.CurrentValues[BaseEntityConstant.RECORDDELETED] = "Y";
                                    entry.CurrentValues[BaseEntityConstant.DELETEDBY] = request.AdditionalFields.UserName;
                                    entry.CurrentValues[BaseEntityConstant.DELETEDDATE] = DateTime.UtcNow;
                                    entry.CurrentValues[BaseEntityConstant.MODIFIEDBY] = databaseValues[BaseEntityConstant.MODIFIEDBY];
                                    entry.CurrentValues[BaseEntityConstant.MODIFIEDDATE] = databaseValues[BaseEntityConstant.MODIFIEDDATE];
                                }
                                else
                                {
                                    entry.CurrentValues[BaseEntityConstant.RECORDDELETED] = "N";
                                    entry.CurrentValues[BaseEntityConstant.DELETEDBY] = null;
                                    entry.CurrentValues[BaseEntityConstant.DELETEDDATE] = null;
                                    entry.CurrentValues[BaseEntityConstant.MODIFIEDBY] = request.AdditionalFields.UserName;
                                    entry.CurrentValues[BaseEntityConstant.MODIFIEDDATE] = DateTime.UtcNow;
                                }
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
        }

        /// <summary>
        /// This method used for Get data for particular screen.
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        public MainResponse GetData(GetRequest request)
        {
           
            var readDataJsonFile = new ReadDataJsonFile();

            // Get all data mapped with screen
            var mappingResult = readDataJsonFile.CheckMappingSpecificKeyName(request.KeyName);

            if (mappingResult != null && mappingResult.MappedKeyData != null && !string.IsNullOrEmpty(mappingResult.MappedKeyData.StoredProcedure))
            {
                // Creating connection
                using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
                {
                    // Creating SP paramete list
                    var dynamicParameters = new DynamicParameters();
                    if (request.Data != null && mappingResult.MappedKeyData.SqlParameters != null)
                    {
                        var sqlParameterCollection = CommonFunction.GetSQLParameters(request.Data.ToString());
                        foreach (var sqlParameter in mappingResult.MappedKeyData.SqlParameters)
                        {
                            dynamicParameters.Add("@" + sqlParameter, sqlParameterCollection.Where(x => x.Key.ToLower() == sqlParameter.ToLower()).FirstOrDefault().Value);
                        }
                    }
                    else
                    {
                        _MainResponse.Success = false;
                        _MainResponse.Message = ErrorMessages.INVALID_REQUEST;
                        return _MainResponse;
                    }

                    // Excute store procedure

                    dynamic dataList = null;
                    try
                    {
                         dataList = (IEnumerable<dynamic>)db.Query(mappingResult.MappedKeyData.StoredProcedure, dynamicParameters, commandType: CommandType.StoredProcedure, commandTimeout: 0).ToList();
                    }
                    catch
                    {
                        _MainResponse.Message = ErrorMessages.RECORD_NOT_EXIST;
                        _MainResponse.Success = false;
                        return _MainResponse;
                    }


                    if (dataList != null && dataList.Count > 0)
                    {
                        if (!string.IsNullOrWhiteSpace(mappingResult.MappedKeyData.MappedEntityClassPath))
                        {
                            _MainResponse.DataResponse = new DataResponse();
                            // Mapped dynamic object to mapped entity type.
                            var entityTypeMapped = CommonFunction.MapWithSpecificEntityType(mappingResult.MappedKeyData.MappedEntityClassPath, dataList);
                            _MainResponse.DataResponse.ResultDataList = entityTypeMapped != null ? entityTypeMapped : null;
                        }
                    }
                    else
                    {
                        _MainResponse.Success = true;
                        _MainResponse.Message = ErrorMessages.ZERO_RECORDS;
                        return _MainResponse;
                    }
                }
            }
            else
            {
                _MainResponse.Message = ErrorMessages.DATA_NOT_MAPPED_SCREEN;
                _MainResponse.Success = false;
            }
            return _MainResponse;
        }

        /// <summary>
        /// This method used for Get data for particular screen.
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        public MainResponse GetNotifications(GetRequest request)
        {

            var readDataJsonFile = new ReadDataJsonFile();
            // Get all data mapped with screen
            var mappingResult = readDataJsonFile.CheckMappingSpecificKeyName(request.KeyName);

            if (mappingResult != null && mappingResult.MappedKeyData != null && !string.IsNullOrEmpty(mappingResult.MappedKeyData.StoredProcedure))
            {
                // Creating connection
                using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
                {
                    // Creating SP paramete list
                    var dynamicParameters = new DynamicParameters();
                    if (request.Data != null && mappingResult.MappedKeyData.SqlParameters != null)
                    {
                        var sqlParameterCollection = CommonFunction.GetSQLParameters(request.Data.ToString());
                        foreach (var sqlParameter in mappingResult.MappedKeyData.SqlParameters)
                        {
                            dynamicParameters.Add("@" + sqlParameter, sqlParameterCollection.Where(x => x.Key.ToLower() == sqlParameter.ToLower()).FirstOrDefault().Value);
                        }
                    }

                    // Excute store procedure
                    var dataList = (IEnumerable<dynamic>)db.Query(mappingResult.MappedKeyData.StoredProcedure, dynamicParameters, commandType: CommandType.StoredProcedure, commandTimeout: 90).ToList();

                    if (dataList != null && dataList.Count() > 0)
                    {
                        if (!string.IsNullOrWhiteSpace(mappingResult.MappedKeyData.MappedEntityClassPath))
                        {
                            _MainResponse.DataResponse = new DataResponse();
                            // Mapped dynamic object to mapped entity type.
                            var entityTypeMapped = CommonFunction.MapWithSpecificEntityType(mappingResult.MappedKeyData.MappedEntityClassPath, dataList);
                            _MainResponse.DataResponse.ResultDataList = entityTypeMapped != null ? entityTypeMapped : null;

                        }
                    }
                }
            }
            else
            {
                _MainResponse.Message = ErrorMessages.DATA_NOT_MAPPED_SCREEN;
                _MainResponse.Success = false;
            }
            return _MainResponse;
        }




        #region Pre save Event
        protected virtual PostSaveResponse OnPostSaved(SaveRequest saveRequest, IEnumerable<EntityEntry> modifiedEntities)
        {
            var PostSaveResponse = new PostSaveResponse();

            #region Send Email Templates
            var disputeDataRequest = new DisputeDataRequest();
            var cancelledSeriesRequestDataRequest = new CancelledSeriesRequestDataRequest();

            if (saveRequest.EntityName == "Disputes" || saveRequest.EntityName == "CancelledSeriesRequest")
            {
                string entityPath = CommonFunction.GetEntityPath(saveRequest.EntityName);
                Type type = CommonFunction.GetType(entityPath);
                foreach (object obj in saveRequest.Data)
                {
                    var entity = JsonConvert.DeserializeObject(obj.ToString(), type);
                    if (saveRequest.EntityName == "Disputes")
                    {
                        disputeDataRequest.TeacherId = Convert.ToInt32(entity.GetType().GetProperty("TeacherId").GetValue(entity));
                        disputeDataRequest.StudentId = Convert.ToInt32(entity.GetType().GetProperty("StudentId").GetValue(entity));
                        disputeDataRequest.Createddate = DateTime.UtcNow;
                        disputeDataRequest.DisputeReason = Convert.ToString(entity.GetType().GetProperty("Reason").GetValue(entity));
                        disputeDataRequest.SessionId = Convert.ToInt32(entity.GetType().GetProperty("Sessionid").GetValue(entity));
                        disputeDataRequest.TutorResponse = Convert.ToString(entity.GetType().GetProperty("TutorResponse").GetValue(entity));
                    }
                    if (saveRequest.EntityName == "CancelledSeriesRequest")
                    {
                        cancelledSeriesRequestDataRequest.StudentId = Convert.ToInt32(entity.GetType().GetProperty("StudentId").GetValue(entity));
                        cancelledSeriesRequestDataRequest.TeacherId = Convert.ToInt32(entity.GetType().GetProperty("TeacherId").GetValue(entity));
                        cancelledSeriesRequestDataRequest.Createddate = DateTime.UtcNow;
                        cancelledSeriesRequestDataRequest.SeriesId = Convert.ToInt32(entity.GetType().GetProperty("SeriesId").GetValue(entity));
                    }
                }
                if (saveRequest.EntityName == "Disputes" && disputeDataRequest.TutorResponse == "N")
                {
                    if (_ObjContext.Session.Where(x => x.SessionId == disputeDataRequest.SessionId).Select(x => x.SeriesId).FirstOrDefault() == null)
                    {
                        var disputeDetail = (from D in _ObjContext.Disputes
                                             join S in _ObjContext.Session on D.Sessionid equals S.SessionId
                                             join SD in _ObjContext.SessionDetail on S.SessionId equals SD.SessionId
                                             join T in _ObjContext.Teachers on S.TeacherId equals T.TeacherId
                                             join U in _ObjContext.Users on T.UserId equals U.UserId
                                             join St in _ObjContext.Students on D.StudentId equals St.StudentId
                                             join U1 in _ObjContext.Users on St.UserId equals U1.UserId
                                             where D.Sessionid == disputeDataRequest.SessionId && D.StudentId == disputeDataRequest.StudentId && D.TeacherId == disputeDataRequest.TeacherId
                                             select new DisputeDataRequest
                                             {
                                                 TeacherEmail = U.Email,
                                                 StudentEmail = U1.Email,
                                                 TutorName = U.FirstName,
                                                 StudentName = U1.FirstName,
                                                 DisputeId = D.DisputeId,
                                                 SessionName = SD.SessionTitle,
                                                 DisputeReason = D.Reason
                                             }).FirstOrDefault();
                        var emailDisputeStudentBody = "";
                        emailDisputeStudentBody = CommonFunction.GetTemplateFromHtml("DisputeSubmissionStudent.html");
                        emailDisputeStudentBody = emailDisputeStudentBody.Replace("{StudentName}", Convert.ToString(disputeDetail.StudentName));
                        emailDisputeStudentBody = emailDisputeStudentBody.Replace("{DisputReason}", Convert.ToString(disputeDetail.DisputeReason));
                        emailDisputeStudentBody = emailDisputeStudentBody.Replace("{DisputeId}", Convert.ToString(disputeDetail.DisputeId));

                        var emailDisputeTutorBody = "";
                        emailDisputeTutorBody = CommonFunction.GetTemplateFromHtml("DisputeSubmitted.html");
                        emailDisputeTutorBody = emailDisputeTutorBody.Replace("{TutorName}", Convert.ToString(disputeDetail.TutorName));
                        emailDisputeTutorBody = emailDisputeTutorBody.Replace("{DisputeReason}", Convert.ToString(disputeDetail.DisputeReason));
                        emailDisputeTutorBody = emailDisputeTutorBody.Replace("{DisputeId}", Convert.ToString(disputeDetail.DisputeId));
                        emailDisputeTutorBody = emailDisputeTutorBody.Replace("{ClassName}", Convert.ToString(disputeDetail.SessionName));
                        emailDisputeTutorBody = emailDisputeTutorBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TutorDashboard");
                        NotificationHelper.SendEmail(disputeDetail.StudentEmail, emailDisputeStudentBody, "Dispute Submitted For Review", true);
                        NotificationHelper.SendEmail(disputeDetail.TeacherEmail, emailDisputeTutorBody, "Dispute Submitted For Review", true);
                    }
                    else
                    {
                        var disputeDetail = (from D in _ObjContext.Disputes
                                             join S in _ObjContext.Session on D.Sessionid equals S.SessionId
                                             join Se in _ObjContext.SeriesDetail on S.SeriesId equals Se.SeriesId
                                             join T in _ObjContext.Teachers on S.TeacherId equals T.TeacherId
                                             join U in _ObjContext.Users on T.UserId equals U.UserId
                                             join St in _ObjContext.Students on D.StudentId equals St.StudentId
                                             join U1 in _ObjContext.Users on St.UserId equals U1.UserId
                                             where D.Sessionid == disputeDataRequest.SessionId && D.StudentId == disputeDataRequest.StudentId && D.TeacherId == disputeDataRequest.TeacherId
                                             select new DisputeDataRequest
                                             {
                                                 TeacherEmail = U.Email,
                                                 StudentEmail = U1.Email,
                                                 TutorName = U.FirstName,
                                                 StudentName = U1.FirstName,
                                                 DisputeId = D.DisputeId,
                                                 SessionName = Se.SeriesTitle,
                                                 DisputeReason = D.Reason
                                             }).FirstOrDefault();

                        var emailDisputeStudentBody = "";
                        emailDisputeStudentBody = CommonFunction.GetTemplateFromHtml("DisputeSubmissionStudent.html");
                        emailDisputeStudentBody = emailDisputeStudentBody.Replace("{StudentName}", Convert.ToString(disputeDetail.StudentName));
                        emailDisputeStudentBody = emailDisputeStudentBody.Replace("{DisputReason}", Convert.ToString(disputeDetail.DisputeReason));
                        emailDisputeStudentBody = emailDisputeStudentBody.Replace("{DisputeId}", Convert.ToString(disputeDetail.DisputeId));

                        var emailDisputeTutorBody = "";
                        emailDisputeTutorBody = CommonFunction.GetTemplateFromHtml("DisputeSubmitted.html");
                        emailDisputeTutorBody = emailDisputeTutorBody.Replace("{TutorName}", Convert.ToString(disputeDetail.TutorName));
                        emailDisputeTutorBody = emailDisputeTutorBody.Replace("{DisputeReason}", Convert.ToString(disputeDetail.DisputeReason));
                        emailDisputeTutorBody = emailDisputeTutorBody.Replace("{ClassName}", Convert.ToString(disputeDetail.SessionName));
                        emailDisputeTutorBody = emailDisputeTutorBody.Replace("{DisputeId}", Convert.ToString(disputeDetail.DisputeId));
                        emailDisputeTutorBody = emailDisputeTutorBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TutorDashboard");
                        NotificationHelper.SendEmail(disputeDetail.StudentEmail, emailDisputeStudentBody, "Dispute Submitted For Review", true);
                        NotificationHelper.SendEmail(disputeDetail.TeacherEmail, emailDisputeTutorBody, "Dispute Submitted For Review", true);

                    }
                    //var emailDisputeStudentBody = "";
                    //emailDisputeStudentBody = CommonFunction.GetTemplateFromHtml("DisputeSubmissionStudent.html");
                    //emailDisputeStudentBody = emailDisputeStudentBody.Replace("{StudentName}", Convert.ToString(disputeDataRequest.StudentName));
                    //emailDisputeStudentBody = emailDisputeStudentBody.Replace("{DisputReason}", Convert.ToString(disputeDataRequest.DisputeReason));
                    //emailDisputeStudentBody = emailDisputeStudentBody.Replace("{DisputeId}", Convert.ToString(disputeDataRequest.DisputeId));

                    //var emailDisputeTutorBody = "";
                    //emailDisputeTutorBody = CommonFunction.GetTemplateFromHtml("DisputeSubmitted.html");
                    //emailDisputeTutorBody = emailDisputeTutorBody.Replace("{TutorName}", Convert.ToString(disputeDataRequest.TutorName));
                    //emailDisputeTutorBody = emailDisputeTutorBody.Replace("{DisputeReason}", Convert.ToString(disputeDataRequest.DisputeReason));
                    //emailDisputeTutorBody = emailDisputeTutorBody.Replace("{ClassName}", Convert.ToString(disputeDataRequest.SessionName));

                    //NotificationHelper.SendEmail(disputeDataRequest.StudentEmail, emailDisputeStudentBody, "Dispute submitted", true);
                    //NotificationHelper.SendEmail(disputeDataRequest.TeacherEmail, emailDisputeTutorBody, "Dispute submitted", true);
                }
                if (saveRequest.EntityName == "CancelledSeriesRequest")
                {
                    var cancelledRequestDetail = (from CSR in _ObjContext.CancelledSeriesRequest
                                                  join S in _ObjContext.Series on CSR.SeriesId equals S.SeriesId
                                                  join Se in _ObjContext.SeriesDetail on S.SeriesId equals Se.SeriesId
                                                  join T in _ObjContext.Teachers on S.TeacherId equals T.TeacherId
                                                  join U in _ObjContext.Users on T.UserId equals U.UserId
                                                  join St in _ObjContext.Students on CSR.StudentId equals St.StudentId
                                                  join U1 in _ObjContext.Users on St.UserId equals U1.UserId
                                                  where CSR.SeriesId == cancelledSeriesRequestDataRequest.SeriesId && CSR.StudentId == cancelledSeriesRequestDataRequest.StudentId && CSR.TeacherId == cancelledSeriesRequestDataRequest.TeacherId
                                                  select new CancelledSeriesRequestDataRequest
                                                  {
                                                      TeacherEmail = U.Email,
                                                      StudentEmail = U1.Email,
                                                      TutorName = U.FirstName,
                                                      StudentName = U1.FirstName,
                                                      CancelledSeriesId = CSR.CancelledSeriesId,
                                                      SeriesName = Se.SeriesTitle
                                                  }).FirstOrDefault();

                   var seriesDetail = _ObjContext.SeriesDetail.Where(x => x.SeriesId == cancelledSeriesRequestDataRequest.SeriesId).FirstOrDefault();
                    if (seriesDetail != null)
                    {
                        seriesDetail.NumberOfJoineesEnrolled = seriesDetail.NumberOfJoineesEnrolled - 1;
                        _ObjContext.SeriesDetail.Update(seriesDetail);
                        _ObjContext.SaveChanges();
                    }

                    var emailCancelledRequestStudentBody = "";
                    emailCancelledRequestStudentBody = CommonFunction.GetTemplateFromHtml("CancelSeriesRequestSubmissionStudent.html");
                    emailCancelledRequestStudentBody = emailCancelledRequestStudentBody.Replace("{StudentName}", Convert.ToString(cancelledRequestDetail.StudentName));
                    emailCancelledRequestStudentBody = emailCancelledRequestStudentBody.Replace("{CancellationId}", Convert.ToString(cancelledRequestDetail.CancelledSeriesId));
                    emailCancelledRequestStudentBody = emailCancelledRequestStudentBody.Replace("{ClassName}", Convert.ToString(cancelledRequestDetail.SeriesName));

                    var emailCancelledRequestTutorBody = "";
                    emailCancelledRequestTutorBody = CommonFunction.GetTemplateFromHtml("CancelSeriesRequestSubmitted.html");
                    emailCancelledRequestTutorBody = emailCancelledRequestTutorBody.Replace("{TutorName}", Convert.ToString(cancelledRequestDetail.TutorName));
                    emailCancelledRequestTutorBody = emailCancelledRequestTutorBody.Replace("{ClassName}", Convert.ToString(cancelledRequestDetail.SeriesName));

                    NotificationHelper.SendEmail(cancelledRequestDetail.StudentEmail, emailCancelledRequestStudentBody, "Refund Request", true);
                    NotificationHelper.SendEmail(cancelledRequestDetail.TeacherEmail, emailCancelledRequestTutorBody, "You Have Received A Cancellation Request", true);
                }
            }
            #endregion

            if (PostSaved != null)
                PostSaved(this, new PostSaveEventArgs() { SaveRequest = saveRequest, ModifiedEntities = modifiedEntities.Where(x => x.Metadata.ClrType.Name != "Apilogs") });
            return PostSaveResponse;
        }

        #endregion
    }
}
