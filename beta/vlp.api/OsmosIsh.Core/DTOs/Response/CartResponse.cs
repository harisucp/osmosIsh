using Org.BouncyCastle.Utilities.IO;
using OsmosIsh.Data.DBEntities;
using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.DTOs.Response
{
    public class CartResponse
    {
        public int EnrollmentId { get; set; }
    }
    public class TransactionResponse
    {
        public int TransactionId { get; set; }
    }
    public class MultipleCartResponse
    {
        public int Count { get; set; }
    }
    public class UnauthorizedCartItemDetails
    {
        public int? SessionId { get; set; }
        public int? SeriesId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? Endtime { get; set; }
        public string? Duration { get; set; }
        public decimal? Fee { get; set; }
        public string? CategoryName { get; set; }
        public string? Language { get; set; }
        public string? FullName { get; set; }
        public string? ImageFile { get; set; }
        public string? closestSession { get; set; }
        public int? SourceTypeId { get; set; }
        public int? TeacherId { get; set; }
        public char? IsSavedForLater { get; set; }
        public string? TutorBlocked { get; set; }
        public string? ClassBlocked { get; set; }
        public int NumberOfJoineesAllowed { get; set; }
        public char? RecordDeleted { get; set; }
    }
    public class CartCountResponse
    {

        public int CartCount { get; set; }
    }

}
