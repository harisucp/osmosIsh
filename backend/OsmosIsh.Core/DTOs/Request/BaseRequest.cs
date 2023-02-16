using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace OsmosIsh.Core.DTOs.Request
{
    /// <summary>
    /// This class will contain common property that is used by all API request in the application.
    /// </summary>
    public class BaseRequest
    {
        [Required]
        public string ActionPerformedBy { get; set; }
    }

}
