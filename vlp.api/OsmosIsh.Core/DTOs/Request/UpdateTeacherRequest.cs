using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore.Metadata;
using OsmosIsh.Core.CustomDataAnnotations;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace OsmosIsh.Core.DTOs.Request
{
    public class UpdateTeacherRequest 
    {
        public int TeacherId { get; set; }
        public string FeaturedTeacher { get; set; }
        public string Blocked { get; set; }
        public string Type { get; set; }
    }
    public class UpdateStudentRequest
    {
        public int StudentId { get; set; }
        public string Blocked { get; set; }
        public int UserId { get; set; }
    }
    public class UpdateSeriesRequest
    {
        public int SeriesId { get; set; }
        public string FeaturedSeries { get; set; }
        public int TeacherId { get; set; }
        public string BlockSeries { get; set; }
        public string Type { get; set; }
    }
    public class UpdateSessionRequest
    {
        public int SessionId { get; set; }
        public string BlockSession { get; set; }
        public string FeaturedSession { get; set; }
        public string Type { get; set; }
    }
    public class DisableReviewRequest
    {
        public int ReviewId { get; set; }
    }
}
