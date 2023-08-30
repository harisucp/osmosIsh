using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.DTOs.Response
{
    public class SeriesDetailResponse
    {
        public int SeriesId { get; set; }
        public string? SeriesTitle { get; set; }
        public int? SeriesCategoryId { get; set; }
        public string? Description { get; set; }
        public string? Agenda { get; set; }
        public string? Image { get; set; }
        public int NumberOfJoineesAllowed { get; set; }
        public int NumberOfJoineesEnrolled { get; set; }
        public decimal? SeriesFee { get; set; }
        public string? Language { get; set; }
        public string? TimeZone { get; set; }
        public string? SeriesTags { get; set; }

        public string? SessionDetail { get; set; }
        public string? SessionCount { get; set; }

    }
}
