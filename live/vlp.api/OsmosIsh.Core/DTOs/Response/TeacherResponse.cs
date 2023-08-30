using Org.BouncyCastle.Utilities.IO;
using OsmosIsh.Data.DBEntities;
using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.DTOs.Response
{
    public class TeacherResponse
    {
        public int TeacherId { get; set; }
    }
    public class Tutors
    {
        public int TeacherId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string FeePerHours { get; set; }
        public string ImageFile { get; set; }
        public decimal? Rating { get; set; }
        public string? Fee{ get; set; }

        public int? Type { get; set; }
        public int? FavoriteId { get; set; }
    }
   
}
