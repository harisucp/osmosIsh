using AutoMapper;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
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
    public class PaymentRepository : BaseRepository<Transactions>, IPaymentRepository
    {
        #region readonly
        private readonly IMapper _Mapper;
        #endregion

        OsmosIshContext _ObjContext;
        MainResponse _MainResponse = null;

        public PaymentRepository(OsmosIshContext ObjContext, IMapper Mapper) : base(ObjContext)
        {
            _MainResponse = new MainResponse();
            _ObjContext = ObjContext;
            _Mapper = Mapper;
        }

        public async Task<MainResponse> GetUserRequest(PaymentRequest paymentRequest)
        {
            int Transaction = 0;
            var transactionResponse = new TransactionResponse();
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@StudentId", paymentRequest.StudentId);
                dynamicParameters.Add("@Enrollments", paymentRequest.Enrollments);
                dynamicParameters.Add("@Amount", paymentRequest.Amount);
                dynamicParameters.Add("@Subtotal", paymentRequest.SubTotal);
                dynamicParameters.Add("@Charity", paymentRequest.Charity);
                dynamicParameters.Add("@UserCouponLogId", paymentRequest.UserCouponLogId);

                // var result = db.Query("sp_GetEnrollmentDetails", dynamicParameters, commandType: CommandType.StoredProcedure).FirstOrDefault();
                Transaction = Convert.ToInt32(db.ExecuteScalar("sp_GetEnrollmentDetails", dynamicParameters, commandType: CommandType.StoredProcedure));
                transactionResponse.TransactionId = Transaction;
                _MainResponse.Message = await _ObjContext.SaveChangesAsync() > 0 ? SuccessMessage.TUTOR_SAVED : ErrorMessages.TUTOR_NOT_SAVED;
                _MainResponse.TransactionResponse = transactionResponse;
                return _MainResponse;
            }

        }

        public async Task<MainResponse> GetTransactionList(int transactionId)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@TransactionId", transactionId);

                var result = db.Query("sp_GetEnrolledTransactionDetails", dynamicParameters, commandType: CommandType.StoredProcedure).ToList();
                _MainResponse.transactionDataResponse = CommonFunction.DeserializedDapperObject<List<TransactionDataResponse>>(result);
            }
            return _MainResponse;
        }
        public async Task<MainResponse> GetTeacherPayoutList()
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();

                var result = db.Query("sp_GetTeacherPayoutDetail", dynamicParameters, commandType: CommandType.StoredProcedure).ToList();
                _MainResponse.PayoutDataResponse = CommonFunction.DeserializedDapperObject<List<PayoutDataResponse>>(result);
            }
            return _MainResponse;
        }

        public async Task<MainResponse> GetRefundDetail(CancelStudentClassRequest cancelStudentClassRequest)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@StudentId", cancelStudentClassRequest.StudentId);
                dynamicParameters.Add("@SessionId", cancelStudentClassRequest.SessionId);
                dynamicParameters.Add("@SeriesId", cancelStudentClassRequest.SeriesId);
                dynamicParameters.Add("@CancelDate", cancelStudentClassRequest.CancelDate);

                var result = db.Query("sp_GetRefundDetail", dynamicParameters, commandType: CommandType.StoredProcedure).ToList();
                _MainResponse.RefundDataResponse = CommonFunction.DeserializedDapperObject<List<RefundDataResponse>>(result);
            }
            return _MainResponse;
        }

        public async Task<MainResponse> UpdateRefundtransaction(string captureId, string refundAmount, string refundId, DateTime create_time, DateTime update_time, int EnrollmentId, string state, int sessionid, int seriesid)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@CaptureId", captureId);
                dynamicParameters.Add("@RefundAmount", refundAmount);
                dynamicParameters.Add("@RefundId", refundId);
                dynamicParameters.Add("@CreateTime", create_time);
                dynamicParameters.Add("@UpdateTime", update_time);
                dynamicParameters.Add("@EnrollmentId", EnrollmentId);
                dynamicParameters.Add("@State", state);
                dynamicParameters.Add("@SessionId", sessionid);
                dynamicParameters.Add("@SeriesId", seriesid);

                // Excute store procedure
                await db.ExecuteAsync("sp_UpdateRefundDetails", dynamicParameters, commandType: CommandType.StoredProcedure);
                _MainResponse.Success = true;
            }

            return _MainResponse;
        }
        public async Task<MainResponse> UpdateRefundDetailsOnTutorCancellation(string captureId, string refundAmount, string refundId, DateTime create_time, DateTime update_time, int EnrollmentId, string state, int sessionid, int seriesid, int transactionId)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@CaptureId", captureId);
                dynamicParameters.Add("@RefundAmount", refundAmount);
                dynamicParameters.Add("@RefundId", refundId);
                dynamicParameters.Add("@CreateTime", create_time);
                dynamicParameters.Add("@UpdateTime", update_time);
                dynamicParameters.Add("@EnrollmentId", EnrollmentId);
                dynamicParameters.Add("@State", state);
                dynamicParameters.Add("@SessionId", sessionid);
                dynamicParameters.Add("@SeriesId", seriesid);
                dynamicParameters.Add("@TransactionId", transactionId);

                // Excute store procedure
                await db.ExecuteAsync("sp_UpdateRefundDetailsOnTutorCancellation", dynamicParameters, commandType: CommandType.StoredProcedure);
                _MainResponse.Success = true;
            }
            return _MainResponse;
        }

        public async Task<MainResponse> UpdateCancelledSeriesRefundDetails(string captureId, string refundAmount, string refundId, DateTime create_time, DateTime update_time, int EnrollmentId, string state, int CancelledSeriesId)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@CaptureId", captureId);
                dynamicParameters.Add("@RefundAmount", refundAmount);
                dynamicParameters.Add("@RefundId", refundId);
                dynamicParameters.Add("@CreateTime", create_time);
                dynamicParameters.Add("@UpdateTime", update_time);
                dynamicParameters.Add("@EnrollmentId", EnrollmentId);
                dynamicParameters.Add("@State", state);
                dynamicParameters.Add("@CancelledSeriesId", CancelledSeriesId);

                // Excute store procedure
                await db.ExecuteAsync("sp_UpdateCancelledSeriesRefundDetails", dynamicParameters, commandType: CommandType.StoredProcedure);
                _MainResponse.Success = true;
                if (Convert.ToDecimal(refundAmount) > 0)
                {

                    var userDetail = (from CSR in _ObjContext.CancelledSeriesRequest
                                      join E in _ObjContext.Enrollments on CSR.SeriesId equals E.RefrenceId
                                      join S in _ObjContext.Students on E.StudentId equals S.StudentId
                                      join U in _ObjContext.Users on S.UserId equals U.UserId
                                      join Se in _ObjContext.Session on CSR.SeriesId equals Se.SeriesId
                                      join SeD in _ObjContext.SeriesDetail on Se.SeriesId equals SeD.SeriesId
                                      where CSR.CancelledSeriesId == CancelledSeriesId && E.EnrollmentId == EnrollmentId && E.RefrenceType == (_ObjContext.GlobalCodes.Where(x => x.CodeName == "Series").Select(x => x.GlobalCodeId).FirstOrDefault())
                                      select new ResolveDisputeStudentResponse
                                      {
                                          Email = U.Email,
                                          StudentName = U.FirstName,
                                          Title = SeD.SeriesTitle
                                      }).FirstOrDefault();
                    var emailBody = "";
                    emailBody = CommonFunction.GetTemplateFromHtml("CancelledRequestResolveStudentRefund.html");
                    emailBody = emailBody.Replace("{CancellationId}", Convert.ToString(CancelledSeriesId));
                    emailBody = emailBody.Replace("{StudentName}", Convert.ToString(userDetail.StudentName));
                    emailBody = emailBody.Replace("{Title}", Convert.ToString(userDetail.Title));
                    emailBody = emailBody.Replace("{RefundId}", Convert.ToString(refundId));
                    emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");

                    NotificationHelper.SendEmail(userDetail.Email, emailBody, "Cancellation Request Approved", true);

                }
                else
                {
                    var userDetail = (from CSR in _ObjContext.CancelledSeriesRequest
                                      join E in _ObjContext.Enrollments on CSR.SeriesId equals E.RefrenceId
                                      join S in _ObjContext.Students on E.StudentId equals S.StudentId
                                      join U in _ObjContext.Users on S.UserId equals U.UserId
                                      join Se in _ObjContext.Session on CSR.SeriesId equals Se.SeriesId
                                      join SeD in _ObjContext.SeriesDetail on Se.SeriesId equals SeD.SeriesId
                                      where CSR.CancelledSeriesId == CancelledSeriesId && E.EnrollmentId == EnrollmentId && E.RefrenceType == (_ObjContext.GlobalCodes.Where(x => x.CodeName == "Series").Select(x => x.GlobalCodeId).FirstOrDefault())
                                      select new ResolveDisputeStudentResponse
                                      {
                                          Email = U.Email,
                                          StudentName = U.FirstName,
                                          Title = SeD.SeriesTitle
                                      }).FirstOrDefault();
                    var emailBody = "";
                    var couponCodeService = new CouponCodeRepository();
                    emailBody = couponCodeService.GetTemplateFromHtml_CouponCode("CancelledRequestResolveStudentNoRefund.html", userDetail.Email);
                    //emailBody = CommonFunction.GetTemplateFromHtml("CancelledRequestResolveStudentNoRefund.html");
                    emailBody = emailBody.Replace("{CancellationId}", Convert.ToString(CancelledSeriesId));
                    emailBody = emailBody.Replace("{StudentName}", Convert.ToString(userDetail.StudentName));
                    emailBody = emailBody.Replace("{Title}", Convert.ToString(userDetail.Title));
                    emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");

                    NotificationHelper.SendEmail(userDetail.Email, emailBody, "Refund Request Denied", true);
                }
            }

            return _MainResponse;
        }

        public async Task<MainResponse> GetTutorCancelledRefundDetail(TutorCancelClassRequest tutorCancelClassRequest)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@TeacherId", tutorCancelClassRequest.TeacherId);
                dynamicParameters.Add("@SessionId", tutorCancelClassRequest.SessionId);
                dynamicParameters.Add("@SeriesId", tutorCancelClassRequest.SeriesId);
                dynamicParameters.Add("@CancelDate", tutorCancelClassRequest.CancelDate);

                var result = db.Query("sp_GetTutorCancelledRefundDetail", dynamicParameters, commandType: CommandType.StoredProcedure).ToList();
                _MainResponse.TutorCancelledRefundDataResponse = CommonFunction.DeserializedDapperObject<List<TutorCancelledRefundDataResponse>>(result);
            }
            return _MainResponse;
        }
        public async Task<MainResponse> getStudentPaypalDetail(int StudentId, int DisputeId, int SessionId)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@StudentId", StudentId);
                dynamicParameters.Add("@SessionId", SessionId);
                dynamicParameters.Add("@DisputeId", DisputeId);

                var result = db.Query("sp_GetStudentPaypalDetail", dynamicParameters, commandType: CommandType.StoredProcedure).ToList();
                _MainResponse.StudentDisputeResponse = CommonFunction.DeserializedDapperObject<List<StudentDisputeResponse>>(result);
            }
            return _MainResponse;
        }
        public async Task<MainResponse> getTutorPaypalDetail(int TutorId, int SessionId)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@TutorId", TutorId);
                dynamicParameters.Add("@SessionId", SessionId);

                var result = db.Query("sp_GetTutorPaypalDetail", dynamicParameters, commandType: CommandType.StoredProcedure).ToList();
                _MainResponse.TutorDisputeResponse = CommonFunction.DeserializedDapperObject<List<TutorDisputeResponse>>(result);
            }
            return _MainResponse;
        }
        public async Task<MainResponse> GetCancelledSeriesTutorPaypalDetail(int TutorId)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@TutorId", TutorId);

                var result = db.Query("sp_GetCancelledSeriesTutorPaypalDetail", dynamicParameters, commandType: CommandType.StoredProcedure).ToList();
                _MainResponse.TutorDisputeResponse = CommonFunction.DeserializedDapperObject<List<TutorDisputeResponse>>(result);
            }
            return _MainResponse;
        }

        public async Task<MainResponse> getTutorPayoutPaypalDetail(CancelStudentClassRequest cancelStudentClassRequest)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@StudentId", cancelStudentClassRequest.StudentId);
                dynamicParameters.Add("@SessionId", cancelStudentClassRequest.SessionId);
                dynamicParameters.Add("@SeriesId", cancelStudentClassRequest.SeriesId);
                dynamicParameters.Add("@CancelDate", cancelStudentClassRequest.CancelDate);

                var result = db.Query("sp_GetTutorPayoutPaypalDetail", dynamicParameters, commandType: CommandType.StoredProcedure).ToList();
                _MainResponse.RefundPayoutDataResponse = CommonFunction.DeserializedDapperObject<List<RefundPayoutDataResponse>>(result);
            }
            return _MainResponse;
        }
        public async Task<MainResponse> GetAdminCancelledSeriesSpecificStudentPaypalDetail(int StudentId, int CancelledSeriesId, int SeriesId)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@StudentId", StudentId);
                dynamicParameters.Add("@CancelledSeriesId", CancelledSeriesId);
                dynamicParameters.Add("@SeriesId", SeriesId);

                var result = db.Query("sp_GetAdminCancelledSeriesSpecificStudentPaypalDetail", dynamicParameters, commandType: CommandType.StoredProcedure).ToList();
                _MainResponse.StudentCancelledSeriesResponse = CommonFunction.DeserializedDapperObject<List<StudentCancelledSeriesResponse>>(result);
            }
            return _MainResponse;
        }

        public async Task<MainResponse> GetTutorAffiliateShare(int SessionId)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@SessionId", SessionId);

                var result = db.Query("sp_GetTutorAffiliateShare", dynamicParameters, commandType: CommandType.StoredProcedure).ToList();
                _MainResponse.TutorAffiliateShareResponse = CommonFunction.DeserializedDapperObject<List<TutorAffiliateShareResponse>>(result).FirstOrDefault();
            }
            return _MainResponse;
        }

        public async Task<MainResponse> ValidateEnrollmentDetails(PaymentRequest paymentRequest)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@StudentId", paymentRequest.StudentId);
                dynamicParameters.Add("@Enrollments", paymentRequest.Enrollments);


                var result = db.ExecuteScalar("sp_ValidateEnrollmentDetails", dynamicParameters, commandType: CommandType.StoredProcedure);
                if(result!= null)
                {
                    _MainResponse.Success = false;
                    _MainResponse.Message = result.ToString();
                }
                
            }
            return _MainResponse;
        }

        
    }
}
