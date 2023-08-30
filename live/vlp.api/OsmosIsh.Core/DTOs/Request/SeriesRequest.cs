using Microsoft.AspNetCore.Http;
using OsmosIsh.Core.CustomDataAnnotations;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace OsmosIsh.Core.DTOs.Request
{
    public class CreateSeriesRequest : BaseRequest
    {
        [Required]
        public string SeriesTitle { get; set; }
        [Required]
        public int SeriesCategoryId { get; set; }
        public string Description { get; set; }
        [Required]
        public string Agenda { get; set; }
        [AllowedExtensions(new string[] { ".jpg", ".png", ".gif" })]
        public IFormFile Image  { get; set; }
        [AllowedExtensions(new string[] { ".mp4", ".webm", ".mpeg" })]
        public IFormFile Video { get; set; }
        [Required]
        public int NumberOfJoineesAllowed { get; set; }
        [Required]
        public DateTime StartDateTime { get; set; }
        [Required]
        [Range(0, Int32.MaxValue)]
        public int Duration { get; set; }
        [Required]
        [Range(0, Int32.MaxValue)]
        public decimal SeriesFee { get; set; }
        public string Language { get; set; }
        [Required]
        public int TeacherId { get; set; }
        [Required]
        public string TimeZone { get; set; }
        public string SeriesTags { get; set; }
        [Required]
        [Range(0, Int32.MaxValue)]
        public int NumberOfSessions { get; set; }
        [Required]
        public string Repeat { get; set; }
        public String SelectedWeekDays { get; set; }
        public int? CopySeriesId { get; set; }

    }

    public class UpdateSeriesDetailRequest : BaseRequest
    {
        [Required]
        public int SeriesId { get; set; }
        [Required]
        public string SeriesTitle { get; set; }
        [Required]
        public int SeriesCategoryId { get; set; }
        public string Description { get; set; }
        [Required]
        public string Agenda { get; set; }

        [AllowedExtensions(new string[] { ".jpg", ".png", ".gif" })]
        public IFormFile Image { get; set; }
        /// <example>false</example>
        public bool IsImageUpdated { get; set; } = false;
        [AllowedExtensions(new string[] { ".mp4", ".webm", ".mpeg" })]
        public IFormFile Video { get; set; }
        /// <example>false</example>
        public bool IsVideoUpdated { get; set; } = false;
        [Required]
        [Range(0, Int32.MaxValue)]
        public int NumberOfJoineesAllowed { get; set; }
        [Required]
        [Range(0, Int32.MaxValue)]
        public decimal SeriesFee { get; set; }
        public string Language { get; set; }
        [Required]
        public string TimeZone { get; set; }
        public string SeriesTags { get; set; }
    }

    public class UpdateSeriesSessionDetailRequest : BaseRequest
    {
        [Required]
        public int SessionId { get; set; }
        [Required]
        public int SeriesId { get; set; }
        [Required]
        public int TeacherId { get; set; }
        [Required]
        public DateTime StartDateTime { get; set; }
        [Required]
        [Range(0, Int32.MaxValue)]
        public int Duration { get; set; }
        public bool IsAllFutureUpdate { get; set; }
    }

}
