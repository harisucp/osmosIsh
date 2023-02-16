using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class SeriesDetail
    {
        public int SeriesDetailId { get; set; }
        public int SeriesId { get; set; }
        public string SeriesTitle { get; set; }
        public int NumberOfJoineesAllowed { get; set; }
        public int NumberOfJoineesEnrolled { get; set; }
        public string TimeZone { get; set; }
        public string Language { get; set; }
        public string CanBeSubscribedAnyTime { get; set; }
        public int SeriesCategoryId { get; set; }
        public string SeriesTags { get; set; }
        public string Description { get; set; }
        public decimal SeriesFee { get; set; }
        public int NumberOfSessions { get; set; }
        public string Agenda { get; set; }
        public string Active { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string RecordDeleted { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }

        public virtual Series Series { get; set; }
        public virtual SessionCategories SeriesCategory { get; set; }
    }
}
