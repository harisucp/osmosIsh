using AutoMapper;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Data.DBEntities;
using OsmosIsh.Repository.IRepository;
using OsmosIsh.Service.IService;
using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using System.Threading.Tasks;
using PayPal.Api;
using OsmosIsh.Core.Shared.Static;
using System.Globalization;
using Amazon.Chime.Model;

namespace OsmosIsh.Service.Service
{
    public class PaymentService : IPaymentService
    {
        #region readonly
        private readonly IPaymentRepository _PaymentRepository;
        private readonly IMapper _Mapper;
        #endregion

        #region Private
        private MainResponse _MainResponse;
        public OsmosIshContext _ObjContext;
        #endregion
        public PaymentService(IPaymentRepository PaymentRepository, IMapper Mapper, OsmosIshContext ObjContext)
        {
            _PaymentRepository = PaymentRepository;
            _Mapper = Mapper;
            _MainResponse = new MainResponse();
            _ObjContext = ObjContext;
        }

        public async Task<MainResponse> GetUserRequest(PaymentRequest paymentRequest)
        {
            return await _PaymentRepository.GetUserRequest(paymentRequest);
        }

        public async Task<MainResponse> GetTransactionList(int transactionId)
        {
            return await _PaymentRepository.GetTransactionList(transactionId);
        }
        public async Task<decimal> GetTransactionAmount(int transactionId)
        {
            var transactionDetail = _PaymentRepository.GetSingle(x => x.TransactionId == transactionId && x.RecordDeleted == "N");
            return Convert.ToDecimal(transactionDetail.AmountPaid);
        }
        public async Task<MainResponse> UpdateTransactionsAfterPayment(int transactionId, AuthorizedCapturedDetail capture, string PayerID)
        {
            //#region Transaction
            var globalSeriesId = (from gc in _ObjContext.GlobalCodes
                                  where gc.CodeName == "Series"
                                  select gc.GlobalCodeId).FirstOrDefault();
            var transactionDetail = _ObjContext.Transactions.Where(x => x.TransactionId == transactionId).ToList();
            if (transactionDetail.Count > 0 && transactionDetail != null)
            {
                foreach (var transactionInfo in transactionDetail)
                {
                    if (capture != null)
                    {
                        transactionInfo.CaptureId = capture.CaptureId;
                        transactionInfo.PaymentId = capture.PaymentId;
                        transactionInfo.State = capture.State;
                        transactionInfo.TransactionFee = capture.TransactionFee;
                        transactionInfo.CreateTime = Convert.ToDateTime(capture.CaptureCreateTime);
                        transactionInfo.UpdateTime = Convert.ToDateTime(capture.CaptureUpdateTime);

                        transactionInfo.AuthorizationId = capture.AuthorizationId;
                        transactionInfo.PaymentMode = capture.PaymentMode;
                        transactionInfo.ValidUntill = capture.ValidUntill;
                        transactionInfo.CreateTime = Convert.ToDateTime(capture.AuthorizationCreateTime);
                        transactionInfo.UpdateTime = Convert.ToDateTime(capture.AuthorizationUpdateTime);
                        transactionInfo.PayerId = PayerID;
                    }
                    transactionInfo.IsPaymentSuccess = "Y";
                    _ObjContext.Transactions.Update(transactionInfo);
                }
                // update enrolled count of items in series/session
                var enrollmentDetail = _ObjContext.Enrollments.Where(x => x.TransactionId == transactionId).ToList();
                if (enrollmentDetail.Count > 0 && enrollmentDetail != null)
                {
                    foreach (var enrolledItems in enrollmentDetail)
                    {
                        if (enrolledItems.RefrenceType == Convert.ToInt32(globalSeriesId))
                        {
                            var seriesDetail = _ObjContext.SeriesDetail.Where(x => x.SeriesId == enrolledItems.RefrenceId).FirstOrDefault();
                            seriesDetail.NumberOfJoineesEnrolled = seriesDetail.NumberOfJoineesEnrolled + 1;
                            _ObjContext.SeriesDetail.Update(seriesDetail);
                        }
                        else
                        {
                            var sessionDetail = _ObjContext.SessionDetail.Where(x => x.SessionId == enrolledItems.RefrenceId).FirstOrDefault();
                            sessionDetail.NumberOfJoineesEnrolled = sessionDetail.NumberOfJoineesEnrolled + 1;
                            _ObjContext.SessionDetail.Update(sessionDetail);
                        }
                    }
                }
                var singleTransactionDetail = transactionDetail.FirstOrDefault();
                Coupons couponCodeDetail = null;
                if (singleTransactionDetail.UserCouponLogId > 0)
                {
                    var userCouponLogDetail = _ObjContext.UserCouponLogs.Where(x => x.UserCouponLogId == singleTransactionDetail.UserCouponLogId).FirstOrDefault();
                    couponCodeDetail = _ObjContext.Coupons.Where(x => x.CouponId == userCouponLogDetail.CouponId).FirstOrDefault();

                    userCouponLogDetail.Availed = "Y";
                    _ObjContext.UserCouponLogs.Update(userCouponLogDetail);
                }
                #region Send Email
                var userDetail = (from S in _ObjContext.Students
                                  join U in _ObjContext.Users on S.UserId equals U.UserId
                                  where S.StudentId == enrollmentDetail[0].StudentId
                                  select new { U.Email, U.FirstName, U.UserId }).FirstOrDefault();
                var userEnrolledSessionDetail = (from E in _ObjContext.Enrollments
                                                 join S in _ObjContext.Session on E.RefrenceId equals S.SessionId
                                                 join SD in _ObjContext.SessionDetail on S.SessionId equals SD.SessionId
                                                 join T in _ObjContext.Teachers on S.TeacherId equals T.TeacherId
                                                 join U in _ObjContext.Users on T.UserId equals U.UserId
                                                 where E.TransactionId == transactionId && E.RefrenceType == (_ObjContext.GlobalCodes.Where(x => x.CodeName == "Session").Select(x => x.GlobalCodeId).FirstOrDefault())
                                                 select new SessionTitleAfterPaymentTemplateResponse
                                                 { SessionTitle = SD.SessionTitle, SessionFee = SD.SessionFee, TeacherFirstName = U.FirstName, TeacherEmail = U.Email, StartTime = S.StartTime, EndTime = S.EndTime, StartDate = S.Series.StartDate, EndDate = S.Series.Enddate }).ToList();
                var userEnrolledSeriesDetail = (from E in _ObjContext.Enrollments
                                                join S in _ObjContext.Series on E.RefrenceId equals S.SeriesId
                                                join SD in _ObjContext.SeriesDetail on S.SeriesId equals SD.SeriesId
                                                join T in _ObjContext.Teachers on S.TeacherId equals T.TeacherId
                                                join U in _ObjContext.Users on T.UserId equals U.UserId
                                                where E.TransactionId == transactionId && E.RefrenceType == (_ObjContext.GlobalCodes.Where(x => x.CodeName == "Series").Select(x => x.GlobalCodeId).FirstOrDefault())
                                                select new SeriesTitleAfterPaymentTemplateResponse
                                                { SeriesTitle = SD.SeriesTitle, SessionFee = SD.SeriesFee, TeacherFirstName = U.FirstName, TeacherEmail = U.Email, StartDate = S.StartDate, EndDate = S.Enddate }).ToList();
                var emailBody = "";
                var emailTitle = "";
                emailBody = CommonFunction.GetTemplateFromHtml("ReceiptStudent.html");
                emailBody = emailBody.Replace("{TransactionId}", Convert.ToString(transactionDetail[0].TransactionId));
                emailBody = emailBody.Replace("{PaymentId}", Convert.ToString(transactionDetail[0].PaymentId));
                emailBody = emailBody.Replace("{TransactionDate}", (DateTime.UtcNow).ToString("MM/dd/yyyy"));
                emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");

                Decimal totalFee = 0;
                foreach (var info in userEnrolledSessionDetail)
                {
                    if (!string.IsNullOrEmpty(info.SessionTitle))
                    {
                        var teacherEmailBody = CommonFunction.GetTemplateFromHtml("EnrollmentNotificationTutor.html");
                        teacherEmailBody = teacherEmailBody.Replace("{HostFirstName}", info.TeacherFirstName);
                        teacherEmailBody = teacherEmailBody.Replace("{ClassName}", info.SessionTitle);
                        teacherEmailBody = teacherEmailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");

                        try
                        {
                            NotificationHelper.SendEmailWithICS(info.TeacherEmail, teacherEmailBody, "Student signs up !", true, (info.StartDate.Value.Date+ info.StartTime.Value.TimeOfDay), (info.EndDate.Value.Date + info.EndTime.Value.TimeOfDay), info.SessionTitle);
                        }
                        catch
                        {
                            NotificationHelper.SendEmail(info.TeacherEmail, teacherEmailBody, "Student signs up !", true);
                        }

                        totalFee += info.SessionFee;
                        emailTitle += "<tr><td style='text-align:left; padding: 10px 0;'><b> Class Name: </b>" + Convert.ToString(info.SessionTitle) + "</td><td style='text-align:right; padding: 10px 0;'><b> Fee:</b> $" + info.SessionFee + "</td></tr>";
                    }
                }
                foreach (var info in userEnrolledSeriesDetail)
                {
                    if (!string.IsNullOrEmpty(info.SeriesTitle))
                    {
                        var teacherEmailBody = CommonFunction.GetTemplateFromHtml("EnrollmentNotificationTutor.html");
                        teacherEmailBody = teacherEmailBody.Replace("{HostFirstName}", info.TeacherFirstName);
                        teacherEmailBody = teacherEmailBody.Replace("{ClassName}", info.SeriesTitle);
                        teacherEmailBody = teacherEmailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");
                        try
                        {
                            NotificationHelper.SendEmailWithICS(info.TeacherEmail, teacherEmailBody, "Student signs up !", true, info.StartDate, info.EndDate, info.SeriesTitle);
                        }
                        catch
                        {
                            NotificationHelper.SendEmail(info.TeacherEmail, teacherEmailBody, "Student signs up !", true);
                        }

                        totalFee += info.SessionFee;
                        emailTitle += "<tr><td style='text-align:left; padding: 10px 0;'><b> Class Name: </b>" + Convert.ToString(info.SeriesTitle) + "</td><td style='text-align:right; padding: 10px 0;'><b> Fee:</b> $" + info.SessionFee + "</td></tr>";
                    }
                }
                if (couponCodeDetail != null)
                {
                    emailBody = emailBody.Replace("{DiscountedRow}", "<tr><td style='text-align:left; padding: 10px 0;'><b> Discount (" + couponCodeDetail.CouponCode + ")</b></td><td style='text-align:right; padding: 10px 0;'>$" + Convert.ToString(totalFee - transactionDetail[0].AmountPaid) + "</td></tr>");
                }
                else
                {
                    emailBody = emailBody.Replace("{DiscountedRow}", "");
                }

                emailBody = emailBody.Replace("{Title}", emailTitle);
                emailBody = emailBody.Replace("{TotalPrice}", Convert.ToString(transactionDetail[0].AmountPaid));
                _ObjContext.SaveChanges();
                NotificationHelper.SendEmail(userDetail.Email, emailBody, "Student Receipt", true);


                var transactionCount = (from T in _ObjContext.Transactions
                                        where T.IsPaymentSuccess == "Y" && T.UserId == userDetail.UserId
                                        select T.TransactionId).Count();

                var userCouponCount = (from UCL in _ObjContext.UserCouponLogs
                                       join C in _ObjContext.Coupons on UCL.CouponId equals C.CouponId
                                       join G in _ObjContext.GlobalCodes on C.CouponType equals G.GlobalCodeId
                                       where G.CodeName == "FirstTransaction"
                                       select UCL.UserCouponLogId).Count();

                if (transactionCount == 1 && userCouponCount <= Convert.ToInt32(AppSettingConfigurations.AppSettings.NumberTimeFirstTransactionCouponSent))
                {
                    var couponCodeService = new CouponCodeService();
                    var emailFirstTransactionBody = couponCodeService.GetTemplateFromHtml_CouponCode("FirstThousandTransaction_CouponCode.html", userDetail.Email);
                    emailFirstTransactionBody = emailFirstTransactionBody.Replace("{NavigationToHome}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl);
                    emailFirstTransactionBody = emailFirstTransactionBody.Replace("{FirstName}", userDetail.FirstName);
                    NotificationHelper.SendEmail(userDetail.Email, emailFirstTransactionBody, "Thank you !", true);
                }



                #endregion

                _MainResponse.Success = true;
            }
            else
            {
                _MainResponse.Success = false;
            }
            //#endregion

            return _MainResponse;
        }
        public async Task<MainResponse> GetTeacherPayoutList()
        {
            return await _PaymentRepository.GetTeacherPayoutList();
        }
        public async Task<MainResponse> UpdatePayoutAfterSession(int MeetingId, int SessionId)
        {
            //#region Transaction
            var meetingDetail = _ObjContext.Meetings.Where(x => x.MeetingId == MeetingId && x.SessionId == SessionId).FirstOrDefault();
            if (meetingDetail != null)
            {
                meetingDetail.Payoutsucceeded = "Y";
                _ObjContext.Meetings.Update(meetingDetail);

                await _ObjContext.SaveChangesAsync();
                _MainResponse.Success = true;
            }
            else
            {
                _MainResponse.Success = false;
            }

            //#endregion
            return _MainResponse;
        }

        public async Task<MainResponse> GetRefundDetail(CancelStudentClassRequest cancelStudentClassRequest)
        {
            return await _PaymentRepository.GetRefundDetail(cancelStudentClassRequest);
        }


        public async Task<MainResponse> UpdateRefundtransaction(string captureId, string refundAmount, string refundId, DateTime create_time, DateTime update_time, int EnrollmentId, string state, int sessionid, int seriesid)
        {
            if (Convert.ToDouble(refundAmount) > 0)
            {
                #region Send Email
                studentCancellationTemplate studentCancellationTemplate = new studentCancellationTemplate();
                if (sessionid > 0)
                {
                    var userDetail = (from E in _ObjContext.Enrollments
                                      join S in _ObjContext.Students on E.StudentId equals S.StudentId
                                      join U in _ObjContext.Users on S.UserId equals U.UserId
                                      join Se in _ObjContext.Session on E.RefrenceId equals Se.SessionId
                                      join SeD in _ObjContext.SessionDetail on Se.SessionId equals SeD.SessionId
                                      where E.EnrollmentId == EnrollmentId && E.RefrenceId == sessionid && E.RefrenceType == (_ObjContext.GlobalCodes.Where(x => x.CodeName == "Session").Select(x => x.GlobalCodeId).FirstOrDefault())
                                      select new studentCancellationTemplate
                                      {
                                          Email = U.Email,
                                          StudentName = U.FirstName,
                                          Title = SeD.SessionTitle
                                      }).FirstOrDefault();
                    var emailBody = "";
                    emailBody = CommonFunction.GetTemplateFromHtml("CancelledSessionByStudent.html");
                    emailBody = emailBody.Replace("{StudentName}", Convert.ToString(userDetail.StudentName));
                    emailBody = emailBody.Replace("{ClassName}", Convert.ToString(userDetail.Title));
                    emailBody = emailBody.Replace("{RefundId}", refundId);
                    NotificationHelper.SendEmail(userDetail.Email, emailBody, "Refund Request", true);
                }
                else
                {
                    var userDetail = (from E in _ObjContext.Enrollments
                                      join S in _ObjContext.Students on E.StudentId equals S.StudentId
                                      join U in _ObjContext.Users on S.UserId equals U.UserId
                                      join Se in _ObjContext.Series on E.RefrenceId equals Se.SeriesId
                                      join SeD in _ObjContext.SeriesDetail on Se.SeriesId equals SeD.SeriesId
                                      where E.EnrollmentId == EnrollmentId && E.RefrenceId == seriesid && E.RefrenceType == (_ObjContext.GlobalCodes.Where(x => x.CodeName == "Series").Select(x => x.GlobalCodeId).FirstOrDefault())
                                      select new studentCancellationTemplate
                                      {
                                          Email = U.Email,
                                          StudentName = U.FirstName,
                                          Title = SeD.SeriesTitle
                                      }).FirstOrDefault();
                    var emailBody = "";
                    emailBody = CommonFunction.GetTemplateFromHtml("CancelledSessionByStudent.html");
                    emailBody = emailBody.Replace("{StudentName}", Convert.ToString(userDetail.StudentName));
                    emailBody = emailBody.Replace("{ClassName}", Convert.ToString(userDetail.Title));
                    emailBody = emailBody.Replace("{RefundId}", refundId);
                    NotificationHelper.SendEmail(userDetail.Email, emailBody, "Refund Request", true);
                }

            }
            #endregion
            return await _PaymentRepository.UpdateRefundtransaction(captureId, refundAmount, refundId, create_time, update_time, EnrollmentId, state, sessionid, seriesid);
            //return _MainResponse;
        }
        public async Task<MainResponse> UpdateRefundDetailsOnTutorCancellation(string captureId, string refundAmount, string refundId, DateTime create_time, DateTime update_time, int EnrollmentId, string state, int sessionid, int seriesid, int transactionId)
        {
            return await _PaymentRepository.UpdateRefundDetailsOnTutorCancellation(captureId, refundAmount, refundId, create_time, update_time, EnrollmentId, state, sessionid, seriesid, transactionId);
            //return _MainResponse;
        }

        public async Task<MainResponse> UpdateCancelledSeriesRefundDetails(string captureId, string refundAmount, string refundId, DateTime create_time, DateTime update_time, int EnrollmentId, string state, int CancelledSeriesId)
        {
            return await _PaymentRepository.UpdateCancelledSeriesRefundDetails(captureId, refundAmount, refundId, create_time, update_time, EnrollmentId, state, CancelledSeriesId);
            //return _MainResponse;
        }
        public async Task<MainResponse> GetTutorCancelledRefundDetail(TutorCancelClassRequest tutorCancelClassRequest)
        {
            return await _PaymentRepository.GetTutorCancelledRefundDetail(tutorCancelClassRequest);
            //return _MainResponse;
        }
        public async Task<MainResponse> UpdateCancelledSeriesStatus(int seriesId, string actionPerformedBy)
        {
            var seriesDetail = new Series();
            seriesDetail = _ObjContext.Series.Where(x => x.SeriesId == seriesId).FirstOrDefault();
            seriesDetail.DeletedBy = actionPerformedBy;
            seriesDetail.DeletedDate = DateTime.UtcNow;
            seriesDetail.RecordDeleted = "Y";
            _ObjContext.Update(seriesDetail);

            _ObjContext.Session.Where(x => x.SeriesId == seriesId && x.StartTime > DateTime.UtcNow).ToList().ForEach(x =>
            {
                x.DeletedBy = actionPerformedBy;
                x.DeletedDate = DateTime.UtcNow;
                x.RecordDeleted = "Y";
            });

            await _ObjContext.SaveChangesAsync();
            _MainResponse.Success = true;

            return _MainResponse;
        }

        public async Task<MainResponse> UpdateCancelledSessionStatus(int sessionId, string actionPerformedBy)
        {
            var sessionDetail = new Session();
            sessionDetail = _ObjContext.Session.Where(x => x.SessionId == sessionId).FirstOrDefault();
            sessionDetail.DeletedBy = actionPerformedBy;
            sessionDetail.DeletedDate = DateTime.UtcNow;
            sessionDetail.RecordDeleted = "Y";
            _ObjContext.Update(sessionDetail);
            await _ObjContext.SaveChangesAsync();
            _MainResponse.Success = true;

            return _MainResponse;
        }
        public async Task<MainResponse> getStudentPaypalDetail(int StudentId, int DisputeId, int SessionId)
        {
            return await _PaymentRepository.getStudentPaypalDetail(StudentId, DisputeId, SessionId);
        }
        public async Task<MainResponse> getTutorPaypalDetail(int TutorId, int EnrollmentId)
        {
            return await _PaymentRepository.getTutorPaypalDetail(TutorId, EnrollmentId);
        }
        public async Task<MainResponse> GetCancelledSeriesTutorPaypalDetail(int TutorId)
        {
            return await _PaymentRepository.GetCancelledSeriesTutorPaypalDetail(TutorId);
        }
        public async Task<MainResponse> saveResolvedDisputeDetail(DisputeResolvedResponse disputeResolvedResponse)
        {
            var transactionDetail = new TransactionDetail();
            transactionDetail = _ObjContext.TransactionDetail.Where(x => x.EnrollmentId == disputeResolvedResponse.EnrollmentId).FirstOrDefault();
            transactionDetail.Isrefunded = "Y";
            transactionDetail.Refund = disputeResolvedResponse.RefundId;
            transactionDetail.RefundAmount = disputeResolvedResponse.Amount;
            transactionDetail.CreateTime = disputeResolvedResponse.CreateTime;
            transactionDetail.UpdateTime = disputeResolvedResponse.UpdateTime;
            transactionDetail.RefundState = "Completed";
            transactionDetail.CreatedDate = DateTime.UtcNow;
            transactionDetail.CreatedBy = disputeResolvedResponse.ActionPerformedBy;
            _ObjContext.Update(transactionDetail);



            // Change to payoutDetail
            var payoutDetail = new PayoutDetail();
            //payoutDetail = _ObjContext.PayoutDetail.Where(x => x.SessionId == disputeResolvedResponse.SessionId && x.StudentId == disputeResolvedResponse.StudentId && x.TeacherId == disputeResolvedResponse.TeacherId).FirstOrDefault();
            //if (payoutDetail == null)
            //{
            payoutDetail.SessionId = disputeResolvedResponse.SessionId;
            payoutDetail.StudentId = disputeResolvedResponse.StudentId;
            payoutDetail.TeacherId = disputeResolvedResponse.TeacherId;
            payoutDetail.PayoutSucceeded = "Y";
            payoutDetail.PayoutBatchId = disputeResolvedResponse.payout_batch_id;
            payoutDetail.SenderBatchId = disputeResolvedResponse.sender_batch_id;
            payoutDetail.Amount = disputeResolvedResponse.amount;
            payoutDetail.Fee = disputeResolvedResponse.fee;
            payoutDetail.BatchStatus = disputeResolvedResponse.batch_status;
            payoutDetail.TimeCreated = disputeResolvedResponse.time_created;
            payoutDetail.TimeCompleted = disputeResolvedResponse.time_completed;
            payoutDetail.Errors = disputeResolvedResponse.errors;
            payoutDetail.PaypalAccount = disputeResolvedResponse.PaypalAccount;
            payoutDetail.PaypalAccountType = disputeResolvedResponse.PaypalAccountType;
            payoutDetail.TutorAffiliatePayBack = disputeResolvedResponse.TutorAffiliatePayBack;
            payoutDetail.AffiliateShare = disputeResolvedResponse.AffiliateShare;
            payoutDetail.SessionFee = disputeResolvedResponse.SessionFee;
            payoutDetail.NumberOfStudentsEnrolled = 1;
            payoutDetail.PayoutType = "Dispute Payout";



            _ObjContext.PayoutDetail.Update(payoutDetail);

            var disputeDetail = new Disputes();
            disputeDetail = _ObjContext.Disputes.Where(x => x.DisputeId == disputeResolvedResponse.DisputeId).FirstOrDefault();
            disputeDetail.DisputeStatus = _ObjContext.GlobalCodes.Where(x => x.CodeName == "Resolved").Select(x => x.GlobalCodeId).FirstOrDefault(); ;
            disputeDetail.ModifiedBy = disputeResolvedResponse.ActionPerformedBy;
            disputeDetail.ModifiedDate = DateTime.UtcNow;
            _ObjContext.Update(disputeDetail);



            #region Send Email Student
            if (Convert.ToDouble(disputeResolvedResponse.Amount) > 0)
            {

                if (_ObjContext.Session.Where(x => x.SessionId == disputeResolvedResponse.SessionId).Select(x => x.SeriesId).FirstOrDefault() == null)
                {
                    var userDetail = (from E in _ObjContext.Enrollments
                                      join S in _ObjContext.Students on E.StudentId equals S.StudentId
                                      join U in _ObjContext.Users on S.UserId equals U.UserId
                                      join Se in _ObjContext.Session on E.RefrenceId equals Se.SessionId
                                      join SeD in _ObjContext.SessionDetail on Se.SessionId equals SeD.SessionId
                                      where E.EnrollmentId == disputeResolvedResponse.EnrollmentId && E.RefrenceId == disputeResolvedResponse.SessionId && E.RefrenceType == (_ObjContext.GlobalCodes.Where(x => x.CodeName == "Session").Select(x => x.GlobalCodeId).FirstOrDefault())
                                      select new ResolveDisputeStudentResponse
                                      {
                                          Email = U.Email,
                                          StudentName = U.FirstName,
                                          Title = SeD.SessionTitle
                                      }).FirstOrDefault();
                    var emailBody = "";
                    var couponCodeService = new CouponCodeService();
                    emailBody = couponCodeService.GetTemplateFromHtml_CouponCode("DisputeResolveStudentRefund.html", userDetail.Email);
                    //emailBody = CommonFunction.GetTemplateFromHtml("DisputeResolveStudentRefund.html");
                    emailBody = emailBody.Replace("{StudentName}", Convert.ToString(userDetail.StudentName));
                    emailBody = emailBody.Replace("{Title}", Convert.ToString(userDetail.Title));
                    emailBody = emailBody.Replace("{RefundId}", Convert.ToString(disputeResolvedResponse.RefundId));
                    emailBody = emailBody.Replace("{DisputeId}", Convert.ToString(disputeResolvedResponse.DisputeId));
                    emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");

                    NotificationHelper.SendEmail(userDetail.Email, emailBody, "Dispute Resolved", true);

                }
                else
                {
                    var userDetail = (from E in _ObjContext.Enrollments
                                      join S in _ObjContext.Students on E.StudentId equals S.StudentId
                                      join U in _ObjContext.Users on S.UserId equals U.UserId
                                      join Se in _ObjContext.Session on E.RefrenceId equals Se.SeriesId
                                      join SeD in _ObjContext.SeriesDetail on Se.SeriesId equals SeD.SeriesId
                                      where E.EnrollmentId == disputeResolvedResponse.EnrollmentId && E.RefrenceType == (_ObjContext.GlobalCodes.Where(x => x.CodeName == "Series").Select(x => x.GlobalCodeId).FirstOrDefault())
                                      select new ResolveDisputeStudentResponse
                                      {
                                          Email = U.Email,
                                          StudentName = U.FirstName,
                                          Title = SeD.SeriesTitle
                                      }).FirstOrDefault();
                    var emailBody = "";
                    //emailBody = CommonFunction.GetTemplateFromHtml("DisputeResolveStudentRefund.html");
                    var couponCodeService = new CouponCodeService();
                    emailBody = couponCodeService.GetTemplateFromHtml_CouponCode("DisputeResolveStudentRefund.html", userDetail.Email);
                    emailBody = emailBody.Replace("{StudentName}", Convert.ToString(userDetail.StudentName));
                    emailBody = emailBody.Replace("{Title}", Convert.ToString(userDetail.Title));
                    emailBody = emailBody.Replace("{RefundId}", Convert.ToString(disputeResolvedResponse.RefundId));
                    emailBody = emailBody.Replace("{DisputeId}", Convert.ToString(disputeResolvedResponse.DisputeId));
                    emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");

                    NotificationHelper.SendEmail(userDetail.Email, emailBody, "Dispute Resolved", true);

                }
            }
            else
            {
                if (_ObjContext.Session.Where(x => x.SessionId == disputeResolvedResponse.SessionId).Select(x => x.SeriesId).FirstOrDefault() == null)
                {
                    var userDetail = (from E in _ObjContext.Enrollments
                                      join S in _ObjContext.Students on E.StudentId equals S.StudentId
                                      join U in _ObjContext.Users on S.UserId equals U.UserId
                                      join Se in _ObjContext.Session on E.RefrenceId equals Se.SessionId
                                      join SeD in _ObjContext.SessionDetail on Se.SessionId equals SeD.SessionId
                                      where E.EnrollmentId == disputeResolvedResponse.EnrollmentId && E.RefrenceId == disputeResolvedResponse.SessionId && E.RefrenceType == (_ObjContext.GlobalCodes.Where(x => x.CodeName == "Session").Select(x => x.GlobalCodeId).FirstOrDefault())
                                      select new ResolveDisputeStudentResponse
                                      {
                                          Email = U.Email,
                                          StudentName = U.FirstName,
                                          Title = SeD.SessionTitle
                                      }).FirstOrDefault();
                    var emailBody = "";
                    var couponCodeService = new CouponCodeService();
                    emailBody = couponCodeService.GetTemplateFromHtml_CouponCode("DisputeResolveStudentNoRefund.html", userDetail.Email);
                    //emailBody = CommonFunction.GetTemplateFromHtml("DisputeResolveStudentNoRefund.html");
                    emailBody = emailBody.Replace("{StudentName}", Convert.ToString(userDetail.StudentName));
                    emailBody = emailBody.Replace("{Title}", Convert.ToString(userDetail.Title));
                    emailBody = emailBody.Replace("{DisputeId}", Convert.ToString(disputeResolvedResponse.DisputeId));
                    emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");

                    NotificationHelper.SendEmail(userDetail.Email, emailBody, "Dispute Resolved", true);

                }
                else
                {
                    var userDetail = (from E in _ObjContext.Enrollments
                                      join S in _ObjContext.Students on E.StudentId equals S.StudentId
                                      join U in _ObjContext.Users on S.UserId equals U.UserId
                                      join Se in _ObjContext.Session on E.RefrenceId equals Se.SeriesId
                                      join SeD in _ObjContext.SeriesDetail on Se.SeriesId equals SeD.SeriesId
                                      where E.EnrollmentId == disputeResolvedResponse.EnrollmentId && E.RefrenceType == (_ObjContext.GlobalCodes.Where(x => x.CodeName == "Series").Select(x => x.GlobalCodeId).FirstOrDefault())
                                      select new ResolveDisputeStudentResponse
                                      {
                                          Email = U.Email,
                                          StudentName = U.FirstName,
                                          Title = SeD.SeriesTitle
                                      }).FirstOrDefault();
                    var emailBody = "";
                    var couponCodeService = new CouponCodeService();
                    emailBody = couponCodeService.GetTemplateFromHtml_CouponCode("DisputeResolveStudentNoRefund.html", userDetail.Email);
                    //emailBody = CommonFunction.GetTemplateFromHtml("DisputeResolveStudentNoRefund.html");
                    emailBody = emailBody.Replace("{StudentName}", Convert.ToString(userDetail.StudentName));
                    emailBody = emailBody.Replace("{Title}", Convert.ToString(userDetail.Title));
                    emailBody = emailBody.Replace("{DisputeId}", Convert.ToString(disputeResolvedResponse.DisputeId));
                    emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");

                    NotificationHelper.SendEmail(userDetail.Email, emailBody, "Dispute Resolved", true);

                }

            }

            #endregion
            #region Send Email Tutor
            if (Convert.ToDouble(disputeResolvedResponse.amount) > 0)
            {

                if (_ObjContext.Session.Where(x => x.SessionId == disputeResolvedResponse.SessionId).Select(x => x.SeriesId).FirstOrDefault() == null)
                {
                    var userDetail = (from S in _ObjContext.Session
                                      join t in _ObjContext.Teachers on S.TeacherId equals t.TeacherId
                                      join U in _ObjContext.Users on t.UserId equals U.UserId
                                      join SeD in _ObjContext.SessionDetail on S.SessionId equals SeD.SessionId
                                      where S.TeacherId == disputeResolvedResponse.TeacherId && S.SessionId == disputeResolvedResponse.SessionId
                                      select new ResolveDisputeTutorResponse
                                      {
                                          Email = U.Email,
                                          TutorName = U.FirstName,
                                          Title = SeD.SessionTitle
                                      }).FirstOrDefault();
                    var emailBody = "";
                    emailBody = CommonFunction.GetTemplateFromHtml("DisputeResolveTutorRefund.html");
                    emailBody = emailBody.Replace("{TutorName}", Convert.ToString(userDetail.TutorName));
                    emailBody = emailBody.Replace("{Title}", Convert.ToString(userDetail.Title));
                    emailBody = emailBody.Replace("{PayoutId}", Convert.ToString(disputeResolvedResponse.payout_batch_id));
                    emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");

                    NotificationHelper.SendEmail(userDetail.Email, emailBody, "Dispute Resolved", true);

                }
                else
                {
                    var userDetail = (from S in _ObjContext.Session
                                      join t in _ObjContext.Teachers on S.TeacherId equals t.TeacherId
                                      join U in _ObjContext.Users on t.UserId equals U.UserId
                                      join SeD in _ObjContext.SeriesDetail on S.SeriesId equals SeD.SeriesId
                                      where S.TeacherId == disputeResolvedResponse.TeacherId && S.SessionId == disputeResolvedResponse.SessionId
                                      select new ResolveDisputeStudentResponse
                                      {
                                          Email = U.Email,
                                          StudentName = U.FirstName,
                                          Title = SeD.SeriesTitle
                                      }).FirstOrDefault();
                    var emailBody = "";
                    emailBody = CommonFunction.GetTemplateFromHtml("DisputeResolveTutorRefund.html");
                    emailBody = emailBody.Replace("{TutorName}", Convert.ToString(userDetail.StudentName));
                    emailBody = emailBody.Replace("{Title}", Convert.ToString(userDetail.Title));
                    emailBody = emailBody.Replace("{PayoutId}", Convert.ToString(disputeResolvedResponse.payout_batch_id));
                    emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");

                    NotificationHelper.SendEmail(userDetail.Email, emailBody, "Dispute Resolved", true);

                }
            }
            else
            {
                if (_ObjContext.Session.Where(x => x.SessionId == disputeResolvedResponse.SessionId).Select(x => x.SeriesId).FirstOrDefault() == null)
                {
                    var userDetail = (from S in _ObjContext.Session
                                      join t in _ObjContext.Teachers on S.TeacherId equals t.TeacherId
                                      join U in _ObjContext.Users on t.UserId equals U.UserId
                                      join SeD in _ObjContext.SessionDetail on S.SessionId equals SeD.SessionId
                                      where S.TeacherId == disputeResolvedResponse.TeacherId && S.SessionId == disputeResolvedResponse.SessionId
                                      select new ResolveDisputeTutorResponse
                                      {
                                          Email = U.Email,
                                          TutorName = U.FirstName,
                                          Title = SeD.SessionTitle
                                      }).FirstOrDefault();
                    var emailBody = "";
                    emailBody = CommonFunction.GetTemplateFromHtml("DisputeResolveTutorNoRefund.html");
                    emailBody = emailBody.Replace("{TutorName}", Convert.ToString(userDetail.TutorName));
                    emailBody = emailBody.Replace("{Title}", Convert.ToString(userDetail.Title));
                    emailBody = emailBody.Replace("{DisputeId}", Convert.ToString(disputeResolvedResponse.DisputeId));
                    emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");

                    NotificationHelper.SendEmail(userDetail.Email, emailBody, "Dispute Resolved", true);

                }
                else
                {
                    var userDetail = (from S in _ObjContext.Session
                                      join t in _ObjContext.Teachers on S.TeacherId equals t.TeacherId
                                      join U in _ObjContext.Users on t.UserId equals U.UserId
                                      join SeD in _ObjContext.SeriesDetail on S.SeriesId equals SeD.SeriesId
                                      where S.TeacherId == disputeResolvedResponse.TeacherId && S.SessionId == disputeResolvedResponse.SessionId
                                      select new ResolveDisputeStudentResponse
                                      {
                                          Email = U.Email,
                                          StudentName = U.FirstName,
                                          Title = SeD.SeriesTitle
                                      }).FirstOrDefault();
                    var emailBody = "";
                    emailBody = CommonFunction.GetTemplateFromHtml("DisputeResolveTutorNoRefund.html");
                    emailBody = emailBody.Replace("{TutorName}", Convert.ToString(userDetail.StudentName));
                    emailBody = emailBody.Replace("{Title}", Convert.ToString(userDetail.Title));
                    emailBody = emailBody.Replace("{DisputeId}", Convert.ToString(disputeResolvedResponse.DisputeId));
                    emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");

                    NotificationHelper.SendEmail(userDetail.Email, emailBody, "Dispute Resolved", true);

                }

            }

            #endregion

            await _ObjContext.SaveChangesAsync();
            _MainResponse.Success = true;

            return _MainResponse;
        }
        public async Task<MainResponse> getTutorPayoutPaypalDetail(CancelStudentClassRequest cancelStudentClassRequest)
        {
            return await _PaymentRepository.getTutorPayoutPaypalDetail(cancelStudentClassRequest);
        }
        public async Task<MainResponse> UpdatecancelledSeriesSessionPayoutDetail(CancelledSeriesSessionPayoutObject payoutObject)
        {
            studentCancellationUpdateTutorTemplate studentCancellationUpdateTutorTemplate = new studentCancellationUpdateTutorTemplate();

            var payoutDetail = new PayoutDetail();
            payoutDetail.SessionId = payoutObject.SessionId;
            payoutDetail.StudentId = payoutObject.StudentId;
            payoutDetail.TeacherId = payoutObject.TeacherId;
            payoutDetail.PayoutSucceeded = "Y";
            payoutDetail.PayoutBatchId = payoutObject.payout_batch_id;
            payoutDetail.SenderBatchId = payoutObject.sender_batch_id;
            payoutDetail.Amount = payoutObject.amount;
            payoutDetail.Fee = payoutObject.fee;
            payoutDetail.BatchStatus = payoutObject.batch_status;
            payoutDetail.TimeCreated = payoutObject.time_created;
            payoutDetail.TimeCompleted = payoutObject.time_completed;
            payoutDetail.Errors = payoutObject.errors;
            payoutDetail.CreatedDate = DateTime.UtcNow;

            payoutDetail.PaypalAccount = payoutObject.PaypalAccount;
            payoutDetail.PaypalAccountType = payoutObject.PaypalAccountType;
            payoutDetail.TutorAffiliatePayBack = payoutObject.TutorAffiliatePayBack;
            payoutDetail.AffiliateShare = payoutObject.AffiliateShare;
            payoutDetail.SessionFee = payoutObject.SessionFee;
            payoutDetail.NumberOfStudentsEnrolled = 1;
            payoutDetail.ServiceFee = payoutObject.ServiceFee;
            payoutDetail.PayoutType = payoutObject.PayoutType;

            _ObjContext.PayoutDetail.Update(payoutDetail);
            await _ObjContext.SaveChangesAsync();

            #region Send Email
            if (_ObjContext.Session.Where(x => x.SessionId == payoutObject.SessionId).Select(x => x.SeriesId).FirstOrDefault() == null)
            {
                var userDetail = (from E in _ObjContext.Enrollments
                                  join S in _ObjContext.Students on E.StudentId equals S.StudentId
                                  join U in _ObjContext.Users on S.UserId equals U.UserId
                                  join Se in _ObjContext.Session on E.RefrenceId equals Se.SessionId
                                  join SeD in _ObjContext.SessionDetail on Se.SessionId equals SeD.SessionId
                                  join T in _ObjContext.Teachers on Se.TeacherId equals T.TeacherId
                                  join U1 in _ObjContext.Users on T.UserId equals U1.UserId
                                  where S.StudentId == payoutObject.StudentId && E.RefrenceId == payoutObject.SessionId && E.RefrenceType == (_ObjContext.GlobalCodes.Where(x => x.CodeName == "Session").Select(x => x.GlobalCodeId).FirstOrDefault())
                                  select new studentCancellationUpdateTutorTemplate
                                  {
                                      Email = U1.Email,
                                      TutorName = U1.FirstName,
                                      Title = SeD.SessionTitle
                                  }).FirstOrDefault();
                if (payoutObject.amount != null && Convert.ToDouble(payoutObject.amount) > 0)
                {
                    var emailTutorPaymentBody = "";
                    emailTutorPaymentBody = CommonFunction.GetTemplateFromHtml("CancelledSessionByStudentUpdateTutorPayment.html");
                    emailTutorPaymentBody = emailTutorPaymentBody.Replace("{TutorName}", Convert.ToString(userDetail.TutorName));
                    emailTutorPaymentBody = emailTutorPaymentBody.Replace("{ClassName}", Convert.ToString(userDetail.Title));
                    emailTutorPaymentBody = emailTutorPaymentBody.Replace("{PayoutId}", payoutObject.payout_batch_id);
                    emailTutorPaymentBody = emailTutorPaymentBody.Replace("{PaymentProgress}", Convert.ToString("The payment is in progress."));

                    NotificationHelper.SendEmail(userDetail.Email, emailTutorPaymentBody, "Cancellation", true);
                }
                else
                {
                    var emailBody = "";
                    emailBody = CommonFunction.GetTemplateFromHtml("CancelledSessionByStudentUpdateTutor.html");
                    emailBody = emailBody.Replace("{TutorName}", Convert.ToString(userDetail.TutorName));
                    emailBody = emailBody.Replace("{ClassName}", Convert.ToString(userDetail.Title));
                    emailBody = emailBody.Replace("{PaymentProgress}", Convert.ToString("The payment is in progress."));

                    NotificationHelper.SendEmail(userDetail.Email, emailBody, "Cancellation", true);
                }
            }
            else
            {
                var userDetail = (from E in _ObjContext.Enrollments
                                  join S in _ObjContext.Students on E.StudentId equals S.StudentId
                                  join U in _ObjContext.Users on S.UserId equals U.UserId
                                  join Se in _ObjContext.Session on E.RefrenceId equals Se.SeriesId
                                  join SeD in _ObjContext.SeriesDetail on Se.SeriesId equals SeD.SeriesId
                                  join T in _ObjContext.Teachers on Se.TeacherId equals T.TeacherId
                                  join U1 in _ObjContext.Users on T.UserId equals U1.UserId
                                  where S.StudentId == payoutObject.StudentId && E.RefrenceId == (_ObjContext.Session.Where(x => x.SessionId == payoutObject.SessionId).Select(x => x.SeriesId).FirstOrDefault()) && E.RefrenceType == (_ObjContext.GlobalCodes.Where(x => x.CodeName == "Series").Select(x => x.GlobalCodeId).FirstOrDefault())
                                  select new studentCancellationUpdateTutorTemplate
                                  {
                                      Email = U1.Email,
                                      TutorName = U1.FirstName,
                                      Title = SeD.SeriesTitle
                                  }).FirstOrDefault();
                if (payoutObject.amount != null && Convert.ToDouble(payoutObject.amount) > 0)
                {
                    var emailBody = "";
                    emailBody = CommonFunction.GetTemplateFromHtml("CancelledSessionByStudentUpdateTutorPayment.html");
                    emailBody = emailBody.Replace("{TutorName}", Convert.ToString(userDetail.TutorName));
                    emailBody = emailBody.Replace("{ClassName}", Convert.ToString(userDetail.Title));
                    emailBody = emailBody.Replace("{PayoutId}", payoutObject.payout_batch_id);
                    emailBody = emailBody.Replace("{PaymentProgress}", Convert.ToString("The payment is in progress."));
                    NotificationHelper.SendEmail(userDetail.Email, emailBody, "Cancellation", true);
                }
                else
                {
                    var emailBody = "";
                    emailBody = CommonFunction.GetTemplateFromHtml("CancelledSessionByStudentUpdateTutor.html");
                    emailBody = emailBody.Replace("{TutorName}", Convert.ToString(userDetail.TutorName));
                    emailBody = emailBody.Replace("{ClassName}", Convert.ToString(userDetail.Title));
                    emailBody = emailBody.Replace("{PaymentProgress}", Convert.ToString(""));

                    NotificationHelper.SendEmail(userDetail.Email, emailBody, "Cancellation", true);
                }
            }
            #endregion

            return _MainResponse;
        }
        public async Task<MainResponse> SendTutorNoAmountTemplateSessionCancelledByTutor(CancelStudentClassRequest cancelStudentClassRequest)
        {
            studentCancellationUpdateTutorTemplate studentCancellationUpdateTutorTemplate = new studentCancellationUpdateTutorTemplate();

            #region Send Email
            if (cancelStudentClassRequest.SeriesId != null && cancelStudentClassRequest.SeriesId > 0)
            {
                var userDetail = (from E in _ObjContext.Enrollments
                                  join S in _ObjContext.Students on E.StudentId equals S.StudentId
                                  join U in _ObjContext.Users on S.UserId equals U.UserId
                                  join Se in _ObjContext.Session on E.RefrenceId equals Se.SeriesId
                                  join SeD in _ObjContext.SeriesDetail on Se.SeriesId equals SeD.SeriesId
                                  join T in _ObjContext.Teachers on Se.TeacherId equals T.TeacherId
                                  join U1 in _ObjContext.Users on T.UserId equals U1.UserId
                                  where S.StudentId == cancelStudentClassRequest.StudentId && E.RefrenceId == cancelStudentClassRequest.SeriesId && E.RefrenceType == (_ObjContext.GlobalCodes.Where(x => x.CodeName == "Series").Select(x => x.GlobalCodeId).FirstOrDefault())
                                  select new studentCancellationUpdateTutorTemplate
                                  {
                                      Email = U1.Email,
                                      TutorName = U1.FirstName,
                                      Title = SeD.SeriesTitle
                                  }).FirstOrDefault();

                var emailBody = "";
                emailBody = CommonFunction.GetTemplateFromHtml("CancelledSessionByStudentUpdateTutor.html");
                emailBody = emailBody.Replace("{TutorName}", Convert.ToString(userDetail.TutorName));
                emailBody = emailBody.Replace("{ClassName}", Convert.ToString(userDetail.Title));
                emailBody = emailBody.Replace("{PaymentProgress}", Convert.ToString(""));

                NotificationHelper.SendEmail(userDetail.Email, emailBody, "Cancellation", true);
            }
            #endregion

            return _MainResponse;
        }

        public async Task<MainResponse> UpdatecancelledSeriesPayoutDetail(CancelledSeriesPayoutObject cancelledSeriesPayoutObject)
        {
            var payoutDetail = new PayoutDetail();
            payoutDetail.SeriesId = cancelledSeriesPayoutObject.SeriesId;
            payoutDetail.StudentId = cancelledSeriesPayoutObject.StudentId;
            payoutDetail.TeacherId = cancelledSeriesPayoutObject.TeacherId;
            payoutDetail.PayoutSucceeded = "Y";
            payoutDetail.PayoutBatchId = cancelledSeriesPayoutObject.payout_batch_id;
            payoutDetail.SenderBatchId = cancelledSeriesPayoutObject.sender_batch_id;
            payoutDetail.Amount = cancelledSeriesPayoutObject.amount;
            payoutDetail.Fee = cancelledSeriesPayoutObject.fee;
            payoutDetail.BatchStatus = cancelledSeriesPayoutObject.batch_status;
            payoutDetail.TimeCreated = cancelledSeriesPayoutObject.time_created;
            payoutDetail.TimeCompleted = cancelledSeriesPayoutObject.time_completed;
            payoutDetail.Errors = cancelledSeriesPayoutObject.errors;
            payoutDetail.CreatedDate = DateTime.UtcNow;
            payoutDetail.PayoutType = "Series Cancellation Payout";
            _ObjContext.PayoutDetail.Update(payoutDetail);

            if (Convert.ToDecimal(cancelledSeriesPayoutObject.amount) > 0 && Convert.ToDecimal(cancelledSeriesPayoutObject.StudentShare) < 1)
            {
                var userDetail = (from Se in _ObjContext.Series
                                  join SeD in _ObjContext.SeriesDetail on Se.SeriesId equals SeD.SeriesId
                                  join T in _ObjContext.Teachers on Se.TeacherId equals T.TeacherId
                                  join U1 in _ObjContext.Users on T.UserId equals U1.UserId
                                  where Se.SeriesId == cancelledSeriesPayoutObject.SeriesId
                                  select new studentCancellationUpdateTutorTemplate
                                  {
                                      Email = U1.Email,
                                      TutorName = U1.FirstName,
                                      Title = SeD.SeriesTitle
                                  }).FirstOrDefault();
                var emailBody = "";
                emailBody = CommonFunction.GetTemplateFromHtml("CancelledRequestResolveTutorPayout.html");
                emailBody = emailBody.Replace("{TutorName}", Convert.ToString(userDetail.TutorName));
                emailBody = emailBody.Replace("{Title}", Convert.ToString(userDetail.Title));
                emailBody = emailBody.Replace("{PayoutId}", Convert.ToString(cancelledSeriesPayoutObject.payout_batch_id));
                emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");

                NotificationHelper.SendEmail(userDetail.Email, emailBody, "Refund Request Denied", true);

            }
            else if (Convert.ToDecimal(cancelledSeriesPayoutObject.amount) > 0 && Convert.ToDecimal(cancelledSeriesPayoutObject.StudentShare) > 1)
            {
                var userDetail = (from Se in _ObjContext.Series
                                  join SeD in _ObjContext.SeriesDetail on Se.SeriesId equals SeD.SeriesId
                                  join T in _ObjContext.Teachers on Se.TeacherId equals T.TeacherId
                                  join U1 in _ObjContext.Users on T.UserId equals U1.UserId
                                  where Se.SeriesId == cancelledSeriesPayoutObject.SeriesId
                                  select new studentCancellationUpdateTutorTemplate
                                  {
                                      Email = U1.Email,
                                      TutorName = U1.FirstName,
                                      Title = SeD.SeriesTitle
                                  }).FirstOrDefault();
                var emailBody = "";
                emailBody = CommonFunction.GetTemplateFromHtml("CancelledRequestResolveTutorBothPayment.html");
                emailBody = emailBody.Replace("{TutorName}", Convert.ToString(userDetail.TutorName));
                emailBody = emailBody.Replace("{Title}", Convert.ToString(userDetail.Title));
                emailBody = emailBody.Replace("{PayoutId}", Convert.ToString(cancelledSeriesPayoutObject.payout_batch_id));
                emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");

                NotificationHelper.SendEmail(userDetail.Email, emailBody, "Cancellation Request Approved", true);

            }
            else
            {
                var userDetail = (from Se in _ObjContext.Series
                                  join SeD in _ObjContext.SeriesDetail on Se.SeriesId equals SeD.SeriesId
                                  join T in _ObjContext.Teachers on Se.TeacherId equals T.TeacherId
                                  join U1 in _ObjContext.Users on T.UserId equals U1.UserId
                                  where Se.SeriesId == cancelledSeriesPayoutObject.SeriesId
                                  select new studentCancellationUpdateTutorTemplate
                                  {
                                      Email = U1.Email,
                                      TutorName = U1.FirstName,
                                      Title = SeD.SeriesTitle
                                  }).FirstOrDefault();
                var emailBody = "";
                emailBody = CommonFunction.GetTemplateFromHtml("CancelledRequestResolveTutorNoPayout.html");
                emailBody = emailBody.Replace("{TutorName}", Convert.ToString(userDetail.TutorName));
                emailBody = emailBody.Replace("{Title}", Convert.ToString(userDetail.Title));
                emailBody = emailBody.Replace("{CancellationId}", Convert.ToString(cancelledSeriesPayoutObject.CancelledSeriesId));
                emailBody = emailBody.Replace("{NavigationUrl}", AppSettingConfigurations.AppSettings.ReactAppliactionUrl + "/TermCondition");

                NotificationHelper.SendEmail(userDetail.Email, emailBody, "Cancellation Request Approved", true);

            }

            await _ObjContext.SaveChangesAsync();

            return _MainResponse;
        }
        public async Task<MainResponse> GetAdminCancelledSeriesSpecificStudentPaypalDetail(int StudentId, int CancelledSeriesId, int SeriesId)
        {
            return await _PaymentRepository.GetAdminCancelledSeriesSpecificStudentPaypalDetail(StudentId, CancelledSeriesId, SeriesId);
        }
        public async Task<MainResponse> GetTutorAffiliateShare(int SessionId)
        {
            return await _PaymentRepository.GetTutorAffiliateShare(SessionId);
        }

        public async Task<MainResponse> ValidateEnrollmentDetails(PaymentRequest paymentRequest)
        {
            return await _PaymentRepository.ValidateEnrollmentDetails(paymentRequest);
        }
    }

}
