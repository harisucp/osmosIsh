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
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.ComTypes;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.Repository
{
    public class EnrollmentRepository : BaseRepository<Enrollments>, IEnrollmentRepository
    {
        #region readonly
        private readonly IMapper _Mapper;
        #endregion

        OsmosIshContext _ObjContext;
        MainResponse _MainResponse = null;

        public EnrollmentRepository(OsmosIshContext ObjContext, IMapper Mapper) : base(ObjContext)
        {
            _MainResponse = new MainResponse();
            _ObjContext = ObjContext;
            _Mapper = Mapper;
        }

        //public async Task<MainResponse> CreateEnrollment(CreateEnrollmentRequest createEnrollmentRequest)
        //{
        //    // Create Enrollment
        //    var enrollments = new Enrollments();

        //    enrollments.CreatedBy = createEnrollmentRequest.ActionPerformedBy;
        //    enrollments.RefrenceId = createEnrollmentRequest.RefrenceId;
        //    enrollments.StudentId = createEnrollmentRequest.StudentId;
        //    enrollments.RefrenceType = createEnrollmentRequest.RefrenceTypeId;
        //    _ObjContext.Update(enrollments);
        //    _ObjContext.SaveChanges();

        //    //_MainResponse.Message = await _ObjContext.SaveChangesAsync() > 0 ? SuccessMessage.ENROLLMENT_SAVED : ErrorMessages.ENROLLMENT_NOT_SAVED;
        //    await _ObjContext.SaveChangesAsync();
        //    var enrollmentDetail = _ObjContext.Enrollments.Where(x => x.StudentId == createEnrollmentRequest.StudentId && x.RefrenceId == createEnrollmentRequest.RefrenceId).FirstOrDefault();
        //    if (enrollmentDetail == null)
        //    {
        //        _MainResponse.Success = false;
        //        _MainResponse.Message = ErrorMessages.ENROLLMENT_NOT_SAVED;
        //    }
        //    else
        //    {
        //        var cartResponse = new CartResponse();
        //        cartResponse.EnrollmentId = enrollments.EnrollmentId;
        //        _MainResponse.CartResponse = cartResponse;
        //        _MainResponse.Success = true;
        //        _MainResponse.Message = SuccessMessage.ENROLLMENT_SAVED;
        //    }
        //    return _MainResponse;
        //}

        public async Task<MainResponse> CreateEnrollment(CreateEnrollmentRequest createEnrollmentRequest)
        {
            // Create Enrollment
            //var studentDetail = _ObjContext.Students.Where(x => x.StudentId == createEnrollmentRequest.StudentId).FirstOrDefault();
            //var sessionData = _ObjContext.Session.Where(x => x.SessionId == createEnrollmentRequest.RefrenceId).FirstOrDefault();
            //var teacherDetail = _ObjContext.Teachers.Where(x => x.TeacherId == sessionData.TeacherId).FirstOrDefault();
            var seriesDetail = 0;
            var sessionDetail = 0;
            var userDetail = _ObjContext.Students.Where(x => x.StudentId == createEnrollmentRequest.StudentId).Select(x => x.UserId).FirstOrDefault();

            if (_ObjContext.GlobalCodes.Where(x => x.GlobalCodeId == createEnrollmentRequest.RefrenceTypeId).Select(x => x.CodeName).FirstOrDefault() == "Series")
            {
                seriesDetail = (from Se in _ObjContext.Series
                                join T in _ObjContext.Teachers on Se.TeacherId equals T.TeacherId
                                join U in _ObjContext.Users on T.UserId equals U.UserId

                                where Se.SeriesId == createEnrollmentRequest.RefrenceId
                                select U.UserId).FirstOrDefault();
            }
            else
            {
                var privateSession = _ObjContext.PrivateSessionLog.Where(x => x.SessionId == createEnrollmentRequest.RefrenceId).FirstOrDefault();
                if (privateSession != null && privateSession.StudentId != createEnrollmentRequest.StudentId)
                {
                    _MainResponse.Success = false;
                    _MainResponse.Message = ErrorMessages.ENROLLMENNT_NOT_ALLOWED;
                    return _MainResponse;
                }
                sessionDetail = (from Se in _ObjContext.Session
                                 join T in _ObjContext.Teachers on Se.TeacherId equals T.TeacherId
                                 join U in _ObjContext.Users on T.UserId equals U.UserId

                                 where Se.SessionId == createEnrollmentRequest.RefrenceId
                                 select U.UserId).FirstOrDefault();
            }
            if (seriesDetail > 0 && userDetail == seriesDetail)
            {
                _MainResponse.Success = false;
                _MainResponse.Message = ErrorMessages.ENROLLMENNT_NOT_ALLOWED;
                return _MainResponse;
            }
            else if (sessionDetail > 0 && userDetail == sessionDetail)
            {
                _MainResponse.Success = false;
                _MainResponse.Message = ErrorMessages.ENROLLMENNT_NOT_ALLOWED;
                return _MainResponse;
            }
            var checkEnrollmentDetail = _ObjContext.Enrollments.Where(x => x.StudentId == createEnrollmentRequest.StudentId && x.RefrenceId == createEnrollmentRequest.RefrenceId && x.RefrenceType == createEnrollmentRequest.RefrenceTypeId && x.RecordDeleted == "N").FirstOrDefault();
            string refrenceType = _ObjContext.GlobalCodes.Where(x => x.GlobalCodeId == createEnrollmentRequest.RefrenceTypeId).Select(x => x.CodeName).FirstOrDefault();

            if (checkEnrollmentDetail == null)
            {
                var enrollments = new Enrollments();

                enrollments.CreatedBy = createEnrollmentRequest.ActionPerformedBy;
                enrollments.RefrenceId = createEnrollmentRequest.RefrenceId;
                enrollments.StudentId = createEnrollmentRequest.StudentId;
                enrollments.RefrenceType = createEnrollmentRequest.RefrenceTypeId;
                _ObjContext.Update(enrollments);
                _ObjContext.SaveChanges();

                //_MainResponse.Message = await _ObjContext.SaveChangesAsync() > 0 ? SuccessMessage.ENROLLMENT_SAVED : ErrorMessages.ENROLLMENT_NOT_SAVED;
                await _ObjContext.SaveChangesAsync();
                var enrollmentDetail = _ObjContext.Enrollments.Where(x => x.StudentId == createEnrollmentRequest.StudentId && x.RefrenceId == createEnrollmentRequest.RefrenceId).FirstOrDefault();
                if (enrollmentDetail == null)
                {
                    //if (refrenceType == "Session")
                    //{
                    //    var sessionDetail = _ObjContext.SessionDetail.Where(x => x.SessionId == createEnrollmentRequest.RefrenceId).FirstOrDefault();
                    //    if (sessionDetail != null)
                    //    {
                    //        //var sessionDetailTable = new SessionDetail();
                    //        sessionDetail.NumberOfJoineesEnrolled = Convert.ToInt32(sessionDetail.NumberOfJoineesEnrolled) + 1;
                    //        sessionDetail.ModifiedDate = DateTime.Now;
                    //        sessionDetail.ModifiedBy = createEnrollmentRequest.ActionPerformedBy;
                    //        _ObjContext.Update(sessionDetail);
                    //        _ObjContext.SaveChanges();
                    //    }
                    //}
                    //else
                    //{
                    //    var seriesDetail = _ObjContext.SeriesDetail.Where(x => x.SeriesId == createEnrollmentRequest.RefrenceId).FirstOrDefault();
                    //    if (seriesDetail != null)
                    //    {
                    //        //var seriesDetailTable = new SeriesDetail();
                    //        seriesDetail.NumberOfJoineesEnrolled = Convert.ToInt32(seriesDetail.NumberOfJoineesEnrolled) + 1;
                    //        seriesDetail.ModifiedDate = DateTime.Now;
                    //        seriesDetail.ModifiedBy = createEnrollmentRequest.ActionPerformedBy;
                    //        _ObjContext.Update(seriesDetail);
                    //        _ObjContext.SaveChanges();
                    //    }
                    //}

                    _MainResponse.Success = false;
                    _MainResponse.Message = ErrorMessages.ENROLLMENT_NOT_SAVED;
                }
                else
                {
                    var cartResponse = new CartResponse();
                    cartResponse.EnrollmentId = enrollments.EnrollmentId;
                    _MainResponse.CartResponse = cartResponse;
                    _MainResponse.Success = true;
                    _MainResponse.Message = SuccessMessage.ENROLLMENT_SAVED;
                }
            }
            else
            {
                _MainResponse.Success = false;
                _MainResponse.Message = ErrorMessages.ALREADY_ENROLLED;
            }
            return _MainResponse;
        }

        public async Task<MainResponse> CreateMultipleEnrollments(CreateMultipleEnrollmentsRequest createMultipleEnrollmentsRequest)
        {
            int count = 0;
            var multipleCartResponse = new MultipleCartResponse();
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@json", createMultipleEnrollmentsRequest.Enrollments);

                // Excute store procedure
                // var dataList = (IEnumerable<dynamic>)db.Query("sp_CreateMultipleEnrollments", dynamicParameters, commandType: CommandType.StoredProcedure).ToList();
                count = Convert.ToInt32(db.ExecuteScalar("sp_CreateMultipleEnrollmentDetails", dynamicParameters, commandType: CommandType.StoredProcedure));
                multipleCartResponse.Count = count;
            }
            _MainResponse.Message = await _ObjContext.SaveChangesAsync() > 0 ? SuccessMessage.CART_ITEMS_ADDED : ErrorMessages.CART_ITEMS_NOT_ADDED;


            _MainResponse.MultipleCartResponse = multipleCartResponse;
            return _MainResponse;
        }



        public async Task<MainResponse> DeleteEnrollment(DeleteEnrollmentRequest deleteEnrollmentRequest)
        {
            // Create Enrollment
            var enrollments = new Enrollments();

            if (deleteEnrollmentRequest.EnrollmentId > 0)
            {
                enrollments = _ObjContext.Enrollments.Where(x => x.EnrollmentId == deleteEnrollmentRequest.EnrollmentId).FirstOrDefault();
                enrollments.RecordDeleted = "Y";
                enrollments.ModifiedBy = deleteEnrollmentRequest.ActionPerformedBy;
                enrollments.ModifiedDate = DateTime.UtcNow;
                enrollments.DeletedBy = deleteEnrollmentRequest.ActionPerformedBy;
                enrollments.DeletedDate = DateTime.UtcNow;
                _ObjContext.Update(enrollments);
            }
            _MainResponse.Message = await _ObjContext.SaveChangesAsync() > 0 ? SuccessMessage.ENROLLMENT_REMOVED_SAVED : ErrorMessages.ENROLLMENT_NOT_REMOVED;
            return _MainResponse;
        }

        public async Task<MainResponse> EnrollmentSavedForLater(SavedEnrollmentRequest savedEnrollmentRequest)
        {
            // Create Enrollment
            var enrollments = new Enrollments();

            if (savedEnrollmentRequest.EnrollmentId > 0)
            {
                enrollments = _ObjContext.Enrollments.Where(x => x.EnrollmentId == savedEnrollmentRequest.EnrollmentId).FirstOrDefault();
                enrollments.IsSavedForLater = savedEnrollmentRequest.IsSavedForLater;
                enrollments.ModifiedBy = savedEnrollmentRequest.ActionPerformedBy;
                enrollments.ModifiedDate = DateTime.UtcNow;
                _ObjContext.Update(enrollments);
                _ObjContext.SaveChanges();

                await _ObjContext.SaveChangesAsync();
            }
            var enrollmentDetail = _ObjContext.Enrollments.Where(x => x.EnrollmentId == savedEnrollmentRequest.EnrollmentId).FirstOrDefault();
            if (enrollmentDetail == null)
            {
                _MainResponse.Success = false;
                _MainResponse.Message = ErrorMessages.ENROLLMENT_NOT_SAVED;
            }
            else
            {
                var cartResponse = new CartResponse();
                cartResponse.EnrollmentId = enrollments.EnrollmentId;
                _MainResponse.CartResponse = cartResponse;
                _MainResponse.Success = true;
                _MainResponse.Message = SuccessMessage.ENROLLMENT_SAVED;
            }
            return _MainResponse;
        }
        public async Task<MainResponse> AddFavouriteTeacher(FavoriteRequest favoriteRequest)
        {
            var favorites = new Favorites();
            var favouriteDetail = _ObjContext.Favorites.Where(x => x.StudentId == favoriteRequest.StudentId && x.RefrenceType == favoriteRequest.RefrenceTypeId && x.RefrenceId == favoriteRequest.RefrenceId).FirstOrDefault();
            if (favouriteDetail == null)
            {
                favorites.CreatedBy = favoriteRequest.ActionPerformedBy;
                favorites.RefrenceId = favoriteRequest.RefrenceId;
                favorites.StudentId = favoriteRequest.StudentId;
                favorites.RefrenceType = favoriteRequest.RefrenceTypeId;
                favorites.CreatedDate = DateTime.UtcNow;
                favorites.ModifiedDate = DateTime.UtcNow;
            }
            else
            {
                favorites = favouriteDetail;
                favorites.RecordDeleted = favoriteRequest.RecordDeleted;
                favorites.DeletedBy = favoriteRequest.ActionPerformedBy;
                favorites.DeletedDate = DateTime.UtcNow;
                favorites.ModifiedDate = DateTime.UtcNow;
                favorites.CreatedDate = DateTime.UtcNow;
            }
            _ObjContext.Update(favorites);
            await _ObjContext.SaveChangesAsync();
            _MainResponse.Message = favoriteRequest.RecordDeleted == "N" ? SuccessMessage.ADDED_FAVOURITE : SuccessMessage.Removed_FAVOURITE;
            return _MainResponse;
        }


        public async Task<MainResponse> InsertModifyTransactionLog(InsertModifyTransactionLogRequest insertModifyTransactionLogRequest)
        {

            int Transaction = 0;
            var transactionResponse = new TransactionResponse();
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@json", insertModifyTransactionLogRequest.Transactions);
                dynamicParameters.Add("@enrollments", insertModifyTransactionLogRequest.Enrollments);
                dynamicParameters.Add("@user", insertModifyTransactionLogRequest.ActionPerformedBy);

                // Excute store procedure
                //TransactionId = Convert.ToInt32(db.ExecuteScalar("sp_CreateMultipleEnrollmentDetails", dynamicParameters, commandType: CommandType.StoredProcedure));
                Transaction = Convert.ToInt32(db.ExecuteScalar("sp_InsertModifyTransactionDetail", dynamicParameters, commandType: CommandType.StoredProcedure));
                transactionResponse.TransactionId = Transaction;
            }
            _MainResponse.Message = await _ObjContext.SaveChangesAsync() > 0 ? SuccessMessage.TUTOR_SAVED : ErrorMessages.TUTOR_NOT_SAVED;


            _MainResponse.TransactionResponse = transactionResponse;
            return _MainResponse;
        }

    }
}
