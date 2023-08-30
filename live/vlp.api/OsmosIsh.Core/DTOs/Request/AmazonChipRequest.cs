using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace OsmosIsh.Core.DTOs.Request
{
   


    public class AmazonChimeMeetingRequest
    {
        [Required]
        public int SessionId { get; set; }
        public int? UserId { get; set; }
    }
}
