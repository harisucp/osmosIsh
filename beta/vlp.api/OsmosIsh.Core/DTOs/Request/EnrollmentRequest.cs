using Microsoft.AspNetCore.Http;
using OsmosIsh.Core.CustomDataAnnotations;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace OsmosIsh.Core.DTOs.Request
{
    public class CreateEnrollmentRequest : BaseRequest
    {
        [Required]
        public int StudentId { get; set; }
        [Required]
        public int RefrenceId { get; set; }
        [Required]
        public int RefrenceTypeId { get; set; }
    }

    public class CreateMultipleEnrollmentsRequest : BaseRequest
    {
        public string Enrollments { get; set; }
    }

    public class DeleteEnrollmentRequest : BaseRequest
    {
        [Required]
        public int EnrollmentId { get; set; }
    }
    public class SavedEnrollmentRequest : DeleteEnrollmentRequest
    {
        [Required]
        public string IsSavedForLater { get; set; }
    }
    public class FavoriteRequest : BaseRequest
    {
        [Required]
        public int StudentId { get; set; }
        [Required]
        public int RefrenceId { get; set; }
        [Required]
        public int RefrenceTypeId { get; set; }
        public string RecordDeleted { get; set; }
    }

    public class InsertModifyTransactionLogRequest : BaseRequest
    {
        public string Transactions { get; set; }
        public string Enrollments { get; set; }
        
    }
}
