using OsmosIsh.Core.DTOs.Response.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.DTOs.Response
{
    /// <summary>
    /// This class will contain common property that is used by all API response in the application.
    /// </summary>
    public class BaseResponse
    {
        public string Message { get; set; }
        public bool Success { get; set; } = true;
    }


    public class MainResponse : BaseResponse
    {
        public BaseResponse BaseResponse { get; set; }
        public UserResponse UserResponse { get; set; }
        public AdminUserResponse AdminUserResponse { get; set; }
        public DataResponse DataResponse { get; set; }
        public AuditResponse AuditResponse { get; set; }
        public StudentResponse StudentResponse { get; set; }
        public TeacherResponse TeacherResponse { get; set; }
        public CartResponse CartResponse { get; set; }
        public TransactionResponse TransactionResponse { get; set; }
        public MultipleCartResponse MultipleCartResponse { get; set; }
        public JoinInfo JoinInfo { get; set; }
        public UpdateUserResponse UpdateUserResponse { get; set; }
        public EnrollmentPayment enrollmentPayment { get; set; }
        public List<TransactionDataResponse> transactionDataResponse { get; set; }
        public List<PayoutDataResponse> PayoutDataResponse { get; set; }
        public List<RefundDataResponse> RefundDataResponse { get; set; }
        public List<TutorCancelledRefundDataResponse> TutorCancelledRefundDataResponse { get; set; }
        public List<StudentDisputeResponse> StudentDisputeResponse { get; set; }
        public List<TutorDisputeResponse> TutorDisputeResponse { get; set; }
        public List<RefundPayoutDataResponse> RefundPayoutDataResponse { get; set; }
        public List<StudentCancelledSeriesResponse> StudentCancelledSeriesResponse { get; set; }
        public AdminSeriesResponse AdminSeriesResponse { get; set; }
        public AdminStudentResponse AdminStudentResponse { get; set; }
        public AdminSessionResponse AdminSessionResponse { get; set; }
        public AdminTutorResponse AdminTutorResponse { get; set; }
        public TutorAffiliateShareResponse TutorAffiliateShareResponse { get; set; }
        public CouponValidateResponse CouponValidateResponse { get; set; }

        public RefershTokenResponse RefershTokenResponse { get; set; }
        
        

    }

    public class Response<T> : BaseResponse
    {
        public T Data { get; set; }

    }
  }
