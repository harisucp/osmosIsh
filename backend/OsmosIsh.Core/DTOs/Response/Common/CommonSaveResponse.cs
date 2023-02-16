using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.DTOs.Response.Common
{
    public class PreSaveResponse
    {
        public string Message { get; set; }
        public bool Success { get; set; } = true;
        public List<object> Data { get; set; }
    }
    public class PostSaveResponse
    {
        public string Message { get; set; }
        public bool Success { get; set; } = true;
    }
}
