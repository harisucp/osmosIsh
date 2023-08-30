using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.DTOs.Mapped.Common
{
    public class CustomerReviews
    {
        public string StudentName { get; set; }
        public string? Comments { get; set; }
        public string? ImageFile { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
    }
}
