using Microsoft.AspNetCore.Http;
using OsmosIsh.Core.CustomDataAnnotations;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace OsmosIsh.Core.DTOs.Request
{
    public class CreateUpdateSessionRequest : BaseRequest
    {
        public int? SessionId { get; set; }
        [Required]
        public string SessionTitle { get; set; }
        [Required]
        public int SessionCategoryId { get; set; }
        public string Description { get; set; }
        [Required]
        public string Agenda { get; set; }

        [AllowedExtensions(new string[] { ".jpg", ".png", ".gif" })]
        public IFormFile Image  { get; set; }
        /// <example>false</example>
        public bool IsImageUpdated  { get; set; } = false;
        [AllowedExtensions(new string[] { ".mp4", ".webm", ".mpeg" })]
        public IFormFile Video { get; set; }
        /// <example>false</example>
        public bool IsVideoUpdated { get; set; } = false;
        [Required]
        [Range(0, Int32.MaxValue)]
        public int NumberOfJoineesAllowed { get; set; }
        [Required]
        public DateTime StartTime { get; set; }
        public List<DateTime> OtherStartTime { get; set; }
        [Required]
        [Range(0, Int32.MaxValue)]
        public int Duration { get; set; }
        [Required]
        [Range(0, Int32.MaxValue)]
        public decimal SessionFee { get; set; }
        public string Language { get; set; }
        [Required]
        public int TeacherId { get; set; }
        [Required]
        public string TimeZone { get; set; }
        public string SessionTags { get; set; }
        public int StudentId { get; set; }
        public int SessionType { get; set; }
        public string PrivateSession { get; set; } = "N";
        public bool SendMail { get; set; } = true;
        public int? CopySessionId { get; set; } = 0;
    }

    public class SessionReviewRatingRequest: BaseRequest
    {
        public int StudentId { get; set; }
        public int SessionId { get; set; }
        public string Review { get; set; }
        public int Rating { get; set; }
    }
}
