using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore.Metadata;
using OsmosIsh.Core.CustomDataAnnotations;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace OsmosIsh.Core.DTOs.Request
{
    public class AdminDisputedPaymentRequest : BaseRequest
    {
        public int DisputeId { get; set; }
        public int SessionId { get; set; }
        public int StudentId { get; set; }
        public int TutorId { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal Limit { get; set; }
        public decimal TutorAmount { get; set; }
        public decimal StudentAmount { get; set; }
        public int EnrollmentId { get; set; }
    }
    public class AdminCancelledPaymentRequest : BaseRequest
    {
        public int CancelledSeriesId { get; set; }
        public int SeriesId { get; set; }
        public int StudentId { get; set; }
        public int TutorId { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal Limit { get; set; }
        public decimal TutorAmount { get; set; }
        public decimal StudentAmount { get; set; }
        public int EnrollmentId { get; set; }
    }
}
