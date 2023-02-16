using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;

namespace OsmosIsh.Core.DTOs.Response.Common
{
    public class ErrorDetailResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; }
        public bool Success { get; set; }
        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }
}
