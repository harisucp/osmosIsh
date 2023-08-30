using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using PayPal.Api;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.IService
{
    public interface IPaymentService
    {
        Task<MainResponse> GetUserRequest(PaymentRequest paymentRequest);
        Task<MainResponse> GetTransactionList(int transactionId);
        Task<decimal> GetTransactionAmount(int transactionId);
        Task<MainResponse> UpdateTransactionsAfterPayment(int transactionId, AuthorizedCapturedDetail capture, string PayerID);
        Task<MainResponse> GetTeacherPayoutList();
        Task<MainResponse> UpdatePayoutAfterSession(int MeetingId, int SessionId);
        Task<MainResponse> GetRefundDetail(CancelStudentClassRequest cancelStudentClassRequest);
        Task<MainResponse> UpdateRefundtransaction(string captureId, string refundAmount, string refundId, DateTime create_time, DateTime update_time, int EnrollmentId, string state, int sessionid, int seriesid); 
            Task<MainResponse> UpdateRefundDetailsOnTutorCancellation(string captureId, string refundAmount, string refundId, DateTime create_time, DateTime update_time, int EnrollmentId, string state, int sessionid, int seriesid, int transactionId); 
         Task<MainResponse> UpdateCancelledSeriesRefundDetails(string captureId, string refundAmount, string refundId, DateTime create_time, DateTime update_time, int EnrollmentId, string state, int CancelledSeriesId);
        Task<MainResponse> GetTutorCancelledRefundDetail(TutorCancelClassRequest tutorCancelClassRequest); 
        Task<MainResponse> UpdateCancelledSessionStatus(int sessionId, string actionPerformedBy); 
        Task<MainResponse> UpdateCancelledSeriesStatus(int seriesId, string actionPerformedBy);
        Task<MainResponse> getStudentPaypalDetail(int StudentId, int DisputeId, int SessionId);
        Task<MainResponse> getTutorPaypalDetail(int TutorId, int SessionId);
        Task<MainResponse> GetCancelledSeriesTutorPaypalDetail(int TutorId);
        Task<MainResponse> saveResolvedDisputeDetail(DisputeResolvedResponse disputeResolvedResponse);
        Task<MainResponse> getTutorPayoutPaypalDetail(CancelStudentClassRequest cancelStudentClassRequest);
        Task<MainResponse> UpdatecancelledSeriesSessionPayoutDetail(CancelledSeriesSessionPayoutObject payoutObject);
        Task<MainResponse> SendTutorNoAmountTemplateSessionCancelledByTutor(CancelStudentClassRequest cancelStudentClassRequest);
        Task<MainResponse> UpdatecancelledSeriesPayoutDetail(CancelledSeriesPayoutObject cancelledSeriesPayoutObject);
        Task<MainResponse> GetAdminCancelledSeriesSpecificStudentPaypalDetail(int StudentId, int CancelledSeriesId, int SeriesId);

        Task<MainResponse> GetTutorAffiliateShare(int SessionId);
        Task<MainResponse> ValidateEnrollmentDetails(PaymentRequest paymentRequest);

    }
}
