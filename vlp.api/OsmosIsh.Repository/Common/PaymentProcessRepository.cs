using AutoMapper;
using Dapper;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Data.DBEntities;
using OsmosIsh.Repository.Repository;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.Common
{
    public class PaymentProcessRepository
    {
        #region readonly
        private readonly IMapper _Mapper;
        #endregion
        MainResponse _MainResponse = null;
        public OsmosIshContext _ObjContext;
        //public PaymentProcessRepository(OsmosIshContext ObjContext, IMapper Mapper)
        //{

        //    _MainResponse = new MainResponse();
        //    _ObjContext = ObjContext;
        //    _Mapper = Mapper;
        //}

        //public List<TutorPayoutDetail> GetTeacherPayoutList()
        //{
        //    List<TutorPayoutDetail> resultData = new List<TutorPayoutDetail>();
        //    using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
        //    {
        //        // Creating SP paramete list
        //        var dynamicParameters = new DynamicParameters();

        //        var result = db.Query("sp_GetTeacherPayoutDetail", dynamicParameters, commandType: CommandType.StoredProcedure).ToList();
        //        resultData = CommonFunction.DeserializedDapperObject<List<TutorPayoutDetail>>(result);
        //    }
        //    return resultData;
        //}
        public List<TutorPayoutDetail> GetTeacherPayoutList()
        {
            List<TutorPayoutDetail> resultData = new List<TutorPayoutDetail>();
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();

                var result = db.Query("sp_GetTeacherPayoutDetailEdited", dynamicParameters, commandType: CommandType.StoredProcedure).ToList();
                resultData = CommonFunction.DeserializedDapperObject<List<TutorPayoutDetail>>(result);
            }
            return resultData;
        }

        private string GenerateExceptionMessage(Exception exception, string croneJobName)
        {
            return "CroneJobName : " + croneJobName + System.Environment.NewLine + "Error Message : " + exception.Message + System.Environment.NewLine + "Inner Exception : " + exception.InnerException + System.Environment.NewLine +
           "Source : " + exception.Source + System.Environment.NewLine + "StackTrace : " + exception.StackTrace;
        }
        public void LogExceptionInDB(Exception exception, string croneJobName)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@apilogid", -1);
                dynamicParameters.Add("@success", false);
                dynamicParameters.Add("@exceptionmsg", exception.Message);
                dynamicParameters.Add("@exceptiontype", exception.GetType().Name);
                dynamicParameters.Add("@exceptionsource", GenerateExceptionMessage(exception, croneJobName));
                db.Execute("sp_UpdateAPILog", dynamicParameters, commandType: CommandType.StoredProcedure);
            }
        }
        public List<TutorMissedSessionRefundDetail> GetTutorMissedSessionRefundDetail()
        {
            List<TutorMissedSessionRefundDetail> resultData = new List<TutorMissedSessionRefundDetail>();
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();

                var result = db.Query("sp_GetTutorMissedSessionRefundDetail", dynamicParameters, commandType: CommandType.StoredProcedure).ToList();
                resultData = CommonFunction.DeserializedDapperObject<List<TutorMissedSessionRefundDetail>>(result);
            }
            return resultData;
        }



        public List<ReCaptureDetail> GetReCaptureDetail()
        {
            List<ReCaptureDetail> resultData = new List<ReCaptureDetail>();
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();

                var result = db.Query("sp_GetReCaptureDetail", dynamicParameters, commandType: CommandType.StoredProcedure).ToList();
                resultData = CommonFunction.DeserializedDapperObject<List<ReCaptureDetail>>(result);
            }
            return resultData;
        }

        public async Task UpdatePayoutDetails(CronJobPayoutObject payoutObject)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@Sessionid", payoutObject.SessionId);
                dynamicParameters.Add("@PayoutBatchId", payoutObject.payout_batch_id);
                dynamicParameters.Add("@SenderBatchId", payoutObject.sender_batch_id);
                dynamicParameters.Add("@Amount", payoutObject.amount);
                dynamicParameters.Add("@Fee", payoutObject.fee);
                dynamicParameters.Add("@BatchStatus", payoutObject.batch_status);
                dynamicParameters.Add("@TimeCreated", payoutObject.time_created);
                dynamicParameters.Add("@TimeCompleted", payoutObject.time_completed);
                dynamicParameters.Add("@Errors", payoutObject.errors);
                dynamicParameters.Add("@TeacherId", payoutObject.TeacherId);
                dynamicParameters.Add("@StudentId", payoutObject.StudentId);
                dynamicParameters.Add("@TutorAffiliatePayBack", payoutObject.TutorAffiliatePayBack);
                dynamicParameters.Add("@PaypalAccountType", payoutObject.PaypalAccountType);
                dynamicParameters.Add("@PaypalAccount", payoutObject.PaypalAccount);
                dynamicParameters.Add("@AffiliateShare", payoutObject.AffiliateShare);
                dynamicParameters.Add("@SessionFee", payoutObject.SessionFee);
                dynamicParameters.Add("@ServiceFee", payoutObject.ServiceFee);
                dynamicParameters.Add("@NumberOfStudentsEnrolled", payoutObject.NumberOfStudentsEnrolled);
                dynamicParameters.Add("@PayoutType", payoutObject.PayoutType);


                await db.ExecuteAsync("sp_UpdatePayoutDetailsEdited", dynamicParameters, commandType: CommandType.StoredProcedure);

                //#region Send Email

                //    // Creating SP paramete list
                //    var dynamicStoredParameters = new DynamicParameters();
                //dynamicStoredParameters.Add("@Sessionid", payoutObject.SessionId);
                //dynamicStoredParameters.Add("@TeacherId", payoutObject.TeacherId);
                //dynamicStoredParameters.Add("@StudentId", payoutObject.StudentId);
                //var result = db.Query("sp_TutorPayoutEmailDetail", dynamicStoredParameters, commandType: CommandType.StoredProcedure).ToList();
                //var resultResponseData = CommonFunction.DeserializedDapperObject<TutorEmailPayoutResponse>(result);


                //    var emailBody = "";
                //    emailBody = CommonFunction.GetTemplateFromHtml("ReceiptTutor.html");
                //    emailBody = emailBody.Replace("{SessionId}", Convert.ToString(payoutObject.SessionId));
                //    emailBody = emailBody.Replace("{TeacherRecievingDate}", Convert.ToString(payoutObject.time_completed));
                //    emailBody = emailBody.Replace("{SessionPrice}", Convert.ToString(resultResponseData.Fee));
                //    emailBody = emailBody.Replace("{ServiceFee}", Convert.ToString(resultResponseData.ServiceFee));
                //    emailBody = emailBody.Replace("{SessionName}", Convert.ToString(resultResponseData.Title));
                //    emailBody = emailBody.Replace("{NumberOfStudentsEnrolled}", Convert.ToString(resultResponseData.NumberOfJoinees));

                //    //emailBody = emailBody.Replace("{Total}", Convert.ToString(payoutObject.amount));

                //    NotificationHelper.SendEmail(resultResponseData.UserEmail, emailBody, "Osmos-ish: Review Your Payment Summary", true);


                ////var userDetail = (from T in _ObjContext.Teachers
                ////                  join U in _ObjContext.Users on T.UserId equals U.UserId
                ////                  where T.TeacherId == payoutObject.TeacherId
                ////                  select U.Email).FirstOrDefault();
                ////if (_ObjContext.Session.Where(x => x.SessionId == payoutObject.SessionId).Select(x => x.SeriesId).FirstOrDefault() == null)
                ////{
                ////    var sessionFeeDetail = (from S in _ObjContext.Session
                ////                            join SD in _ObjContext.SessionDetail on S.SessionId equals SD.SessionId
                ////                            where S.SessionId == payoutObject.SessionId
                ////                            select new SessionTutorPaymentTemplateResponse
                ////                            {
                ////                                SessionFee = SD.SessionFee,
                ////                                NumberOfJoinees = SD.NumberOfJoineesEnrolled,
                ////                                SeriesSessionName = SD.SessionTitle
                ////                            }).FirstOrDefault();
                ////    var serviceFee = Convert.ToDouble(sessionFeeDetail.SessionFee) - Convert.ToDouble(payoutObject.amount);
                ////    var emailBody = "";
                ////    emailBody = CommonFunction.GetTemplateFromHtml("ReceiptTutor.html");
                ////    emailBody = emailBody.Replace("{SessionId}", Convert.ToString(payoutObject.SessionId));
                ////    emailBody = emailBody.Replace("{TeacherRecievingDate}", Convert.ToString(payoutObject.time_completed));
                ////    emailBody = emailBody.Replace("{SessionPrice}", Convert.ToString(sessionFeeDetail.SessionFee));
                ////    emailBody = emailBody.Replace("{ServiceFee}", Convert.ToString(serviceFee));
                ////    emailBody = emailBody.Replace("{SessionName}", Convert.ToString(sessionFeeDetail.SeriesSessionName));
                ////    emailBody = emailBody.Replace("{NumberOfStudentsEnrolled}", Convert.ToString(sessionFeeDetail.NumberOfJoinees));

                ////    //emailBody = emailBody.Replace("{Total}", Convert.ToString(payoutObject.amount));

                ////    NotificationHelper.SendEmail(userDetail.ToString(), emailBody, "Osmos-ish: Review Your Payment Summary", true);
                ////}
                ////else
                ////{
                ////    var sessionFeeDetail = (from S in _ObjContext.Session
                ////                            join SD in _ObjContext.SeriesDetail on S.SeriesId equals SD.SeriesId
                ////                            where S.SessionId == payoutObject.SessionId
                ////                            select new SeriesTutorPaymentTemplateResponse
                ////                            {
                ////                                SessionFee = SD.SeriesFee,
                ////                                NumberOfJoinees = SD.NumberOfJoineesEnrolled,
                ////                                SeriesSessionName = SD.SeriesTitle
                ////                            }).FirstOrDefault();
                ////    var serviceFee = Convert.ToDouble(sessionFeeDetail.SessionFee) - Convert.ToDouble(payoutObject.amount);
                ////    var emailBody = "";
                ////    emailBody = CommonFunction.GetTemplateFromHtml("ReceiptTutor.html");
                ////    emailBody = emailBody.Replace("{SessionId}", Convert.ToString(payoutObject.SessionId));
                ////    emailBody = emailBody.Replace("{TeacherRecievingDate}", Convert.ToString(payoutObject.time_completed));
                ////    emailBody = emailBody.Replace("{SessionPrice}", Convert.ToString(sessionFeeDetail.SessionFee));
                ////    emailBody = emailBody.Replace("{ServiceFee}", Convert.ToString(serviceFee));
                ////    emailBody = emailBody.Replace("{SessionName}", Convert.ToString(sessionFeeDetail.SeriesSessionName));
                ////    emailBody = emailBody.Replace("{NumberOfStudentsEnrolled}", Convert.ToString(sessionFeeDetail.NumberOfJoinees));

                ////    NotificationHelper.SendEmail(userDetail.ToString(), emailBody, "Osmos-ish: Review Your Payment Summary", true);
                ////}

                //#endregion
            }
        }
        public async Task UpdateTutorMissedSessionRefundtransaction(TutorMissedSessionRefundResponse tutorMissedSessionRefundResponse)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@CaptureId", tutorMissedSessionRefundResponse.CaptureId);
                dynamicParameters.Add("@RefundedAmount", tutorMissedSessionRefundResponse.RefundedAmount);
                dynamicParameters.Add("@RefundId", tutorMissedSessionRefundResponse.RefundId);
                dynamicParameters.Add("@createtime", tutorMissedSessionRefundResponse.create_time);
                dynamicParameters.Add("@updatetime", tutorMissedSessionRefundResponse.update_time);
                dynamicParameters.Add("@EnrollmentId", tutorMissedSessionRefundResponse.EnrollmentId);
                dynamicParameters.Add("@state", tutorMissedSessionRefundResponse.state);
                dynamicParameters.Add("@SessionId", tutorMissedSessionRefundResponse.SessionId);

                await db.ExecuteAsync("sp_UpdateMissedTutorSessionRefundDetail", dynamicParameters, commandType: CommandType.StoredProcedure);

                #region Send Email
                var dynamicParameters1 = new DynamicParameters();
                dynamicParameters1.Add("@EnrollmentId", tutorMissedSessionRefundResponse.EnrollmentId);
                dynamicParameters1.Add("@SessionId", tutorMissedSessionRefundResponse.SessionId);

                //await db.ExecuteAsync("sp_UpdateMissedTutorSessionRefundDetail", dynamicParameters, commandType: CommandType.StoredProcedure);
                var result = db.Query("sp_TutorMissedEmailDetail", dynamicParameters1, commandType: CommandType.StoredProcedure).FirstOrDefault();
                var resultResponseData = CommonFunction.DeserializedDapperObject<TutorMissedShow>(result);

                var emailBody = "";
                //emailBody = CommonFunction.GetTemplateFromHtml("TutorNoShowToStudent.html");
                var couponCodeRepository = new CouponCodeRepository();
                emailBody = couponCodeRepository.GetTemplateFromHtml_CouponCode("TutorNoShowToStudent.html", resultResponseData.UserEmail);
                emailBody = emailBody.Replace("{StudentName}", Convert.ToString(resultResponseData.FirstName));
                emailBody = emailBody.Replace("{ClassName}", Convert.ToString(resultResponseData.Title));
                emailBody = emailBody.Replace("{RefundId}", Convert.ToString(tutorMissedSessionRefundResponse.RefundId));
                emailBody = emailBody.Replace("{SessionDate}", resultResponseData.StartTime.ToString("MM/dd/yyyy"));
                //emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");


                //emailBody = emailBody.Replace("{Total}", Convert.ToString(payoutObject.amount));

                NotificationHelper.SendEmail(resultResponseData.UserEmail, emailBody, "We're Sorry...", true);


                #endregion
            }

        }
        public async Task UpdateReCaptureDetails(ReCapturePaypalResponse reCapturePaypalResponse)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@AuthorizationId", reCapturePaypalResponse.AuthorizationId);
                dynamicParameters.Add("@CaptureId", reCapturePaypalResponse.CaptureId);
                dynamicParameters.Add("@CaptureUpdateTime", reCapturePaypalResponse.CaptureCreateTime);
                dynamicParameters.Add("@CaptureCreateTime", reCapturePaypalResponse.CaptureUpdateTime);
                dynamicParameters.Add("@TotalAmount", reCapturePaypalResponse.TotalAmount);

                await db.ExecuteAsync("sp_UpdateReCapturePaymentDetails", dynamicParameters, commandType: CommandType.StoredProcedure);

            }

        }

        // Session Reminders
        public List<ReminderTutorDetail> GetSessionReminderTutorDetail()
        {
            List<ReminderTutorDetail> resultData = new List<ReminderTutorDetail>();
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();

                var result = db.Query("sp_GetSessionRemindersForTutor", dynamicParameters, commandType: CommandType.StoredProcedure).ToList();
                resultData = CommonFunction.DeserializedDapperObject<List<ReminderTutorDetail>>(result);
            }
            return resultData;
        }
        public List<ReminderStudentDetail> GetSessionReminderStudentDetail()
        {
            List<ReminderStudentDetail> resultData = new List<ReminderStudentDetail>();
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();

                var result = db.Query("sp_GetSessionRemindersForStudent", dynamicParameters, commandType: CommandType.StoredProcedure).ToList();
                resultData = CommonFunction.DeserializedDapperObject<List<ReminderStudentDetail>>(result);
            }
            return resultData;
        }

        // Affiliate Region
        public async Task UpdateAffiliatePayoutDetail(CronJobAffilaitePayoutObject payoutObject, AffiliatePayoutDetail affiliatePayoutDetail)
        {
            List<AffiliatePayoutDetails> affiliatePayoutDetails = new List<AffiliatePayoutDetails>();


            #region SendEmail
            var emailBody = "";
            var emailAffilaiteSession = "";
            emailBody = CommonFunction.GetTemplateFromHtml("AffiliatePayout.html");
            emailBody = emailBody.Replace("{Total}", Convert.ToString(affiliatePayoutDetail.TotalAffiliateShare));
            var sessionDetailJson = JsonConvert.DeserializeObject<List<AffiliateJsonArrayResponse>>(affiliatePayoutDetail.AffiliateShareSessionsDetail);
            var count = 0;
            foreach (var session in sessionDetailJson)
            {

                ++count;
                emailAffilaiteSession += "<tr><td style='text-align:left; padding: 10px 0; border-bottom: 1px solid #eee;'><b>" + count.ToString() + ".  Tutor Name: " + session.TeacherName + "</b></td><td style = 'text-align:right; padding: 10px 0; border-bottom: 1px solid #eee;'></td></tr>";
                emailAffilaiteSession += "<tr><td style ='text-align:left; padding: 10px 0; border-bottom: 1px solid #eee;' ><b> Session Name: " + session.Title + "</b>(Earning = "+session.AffiliateEarningPercentage + "%)</td><td style='text-align:right; padding: 10px 0; border-bottom: 1px solid #eee;' >$" + session.SessionTotalAffiliateShare + "</td></tr>";
                foreach (var payoutId in session.SessionPayoutIds.Split(','))
                {
                    var AffiliatePayoutDetail = new AffiliatePayoutDetails();
                    AffiliatePayoutDetail.PaypalAccountType = affiliatePayoutDetail.AffiliatePaypalAccountType;
                    AffiliatePayoutDetail.PaypalAccount = affiliatePayoutDetail.AffiliatePaypalAccount;
                    AffiliatePayoutDetail.AffiliateId = session.AffiliateId;
                    AffiliatePayoutDetail.AffiliatePayoutJson = affiliatePayoutDetail.AffiliateShareSessionsDetail;
                    AffiliatePayoutDetail.Amount = payoutObject.Amount;
                    AffiliatePayoutDetail.BatchStatus = payoutObject.Batch_status;
                    AffiliatePayoutDetail.Errors = payoutObject.Errors;
                    AffiliatePayoutDetail.Fee = payoutObject.Fee;
                    AffiliatePayoutDetail.PayoutBatchId = payoutObject.payout_batch_id;
                    AffiliatePayoutDetail.SenderBatchId = payoutObject.sender_batch_id;
                    AffiliatePayoutDetail.TimeCompleted = payoutObject.Time_completed;
                    AffiliatePayoutDetail.TimeCreated = payoutObject.Time_created;
                    AffiliatePayoutDetail.PayoutSucceeded = "Y";
                    AffiliatePayoutDetail.CreatedDate = DateTime.UtcNow;
                    AffiliatePayoutDetail.PayoutId = Convert.ToInt32(payoutId);
                    affiliatePayoutDetails.Add(AffiliatePayoutDetail);
                }
            }

            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@json", JsonConvert.SerializeObject(affiliatePayoutDetails));

                await db.ExecuteAsync("sp_UpdateAffiliatePayoutDetail", dynamicParameters, commandType: CommandType.StoredProcedure);

            }

            emailBody = emailBody.Replace("{PayoutSessions}", emailAffilaiteSession);
            emailBody = emailBody.Replace("{Total}", Convert.ToString(affiliatePayoutDetail.TotalAffiliateShare));
            emailBody = emailBody.Replace("{CurrentDate}", DateTime.Now.ToString("MM/dd/yyyy"));
            NotificationHelper.SendEmail(affiliatePayoutDetail.AffiliateEmail, emailBody, "Osmos-ish: Affiliate Receipt", true);

            #endregion


        }

        public List<AffiliatePayoutDetail> GetAffiliateList()
        {
            List<AffiliatePayoutDetail> resultData = new List<AffiliatePayoutDetail>();
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();

                var result = db.Query("sp_GetAffiliatePayoutDetail", dynamicParameters, commandType: CommandType.StoredProcedure).ToList();
                resultData = CommonFunction.DeserializedDapperObject<List<AffiliatePayoutDetail>>(result);
            }
            return resultData;
        }

        
    }
}
