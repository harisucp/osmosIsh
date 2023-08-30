using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace OsmosIsh.Core.DTOs.Request
{
    public class PrivateSessionRequest : BaseRequest
    {
        [Required]
        public int StudentId { get; set; }
        [Required]
        public int TeacherId { get; set; }
        [Required]
        public string SessionTitle { get; set; }
        [Required]
        public string StartTime { get; set; }
        [Required]
        public string StartTimeUTC { get; set; }
        [Required]
        [Range(0, Int32.MaxValue)]
        public int Duration { get; set; }
        public int? SessionCategoryId { get; set; }

        public string Notes { get; set; }
    }
    public class PrivateMailRequest : BaseRequest
    {
        [Required]
        public string Subject { get; set; }
        [Required]
        public string Message { get; set; }
    }
    public class DenySessionRequest : BaseRequest
    {
        [Required]
        public int PrivateSessionLogId { get; set; }
        
    }
    public class PrivateSessionAvailableDayRequest : BaseRequest
    {
        public List<PrivateSessionAvailableDay> PrivateSessionAvailableDays { get; set; }
        public int TeacherId { get; set; }
        public string PrivateSession { get; set; }
        public decimal? FeePerHours { get; set; }
        public String PrivateSessionTimeZone { get; set; }
        public string PrivateSessionCategories { get; set; }
    }

    public class PrivateSessionAvailableDay
    {
        public string Day { get; set; }
        public Boolean Opened { get; set; }
        public List<PrivateSessionAvailableDaySlot> PrivateSessionAvailableDaySlots { get; set; }

    }

    public class PrivateSessionAvailableDaySlot
    {
        public string Start { get; set; }
        public string End { get; set; }
    }
    public class AcceptSessionRequest : BaseRequest
    {
        [Required]
        public int PrivateSessionLogId { get; set; }

    }
}
