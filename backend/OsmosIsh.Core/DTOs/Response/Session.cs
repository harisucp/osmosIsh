using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.DTOs.Response
{
    public class SessionDetailResponse
    {
        public int? SessionId { get; set; }

        public string SessionTitle { get; set; }

        public int SessionCategoryId { get; set; }
        public string Description { get; set; }
        public string Agenda { get; set; }
        public string? Image { get; set; }

        public int NumberOfJoineesAllowed { get; set; }

        public int NumberOfJoineesEnrolled { get; set; }

        public DateTime StartTime { get; set; }

        public string Duration { get; set; }

        public decimal SessionFee { get; set; }
        public string Language { get; set; }

        public int TeacherId { get; set; }

        public string? TimeZone { get; set; }

        public string SessionTags { get; set; }
        public string CreatedBy { get; set; }

    }

    //Template response classes
    public class SessionUpdateTemplateresponse
    {
        public string SessionTitle { get; set; }
        public string StudentName { get; set; }
        public string StudentEmail { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
    public class SessionUpdateTemplateTutorResponse
    {
        public string TeacherName { get; set; }
        public string TeacherEmail { get; set; }
        public string SessionTitle { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
    public class SessionPrivateApprovedTemplateResponse
    {
        public string StudentName { get; set; }
        public string StudentEmail { get; set; }
    }
    public class SessionTutorId
    {
        public int TeacherId { get; set; }
        public int? EnrollmentId { get; set; }
    }
}

