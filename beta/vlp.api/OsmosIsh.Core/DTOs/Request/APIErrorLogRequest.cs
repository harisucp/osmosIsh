using Newtonsoft.Json;
using System;

namespace OsmosIsh.Core.DTOs.Request
{
    public class APILogRequest
    {
        public string APIUrl { get; set; }
        public string APIParams { get; set; }
        public string Headers { get; set; }
        public string Method { get; set; }
        public int APILogId { get; set; }
    }

    public class UpdateAPILogRequest
    {
        public int APILogId { get; set; }
        public Boolean Success { get; set; }
        public string ExceptionMsg { get; set; }
        public string ExceptionSource { get; set; }
        public string ExceptionType { get; set; }
    }

    public class Payload
    {
        [JsonProperty("channel")]
        public string Channel { get; set; }

        [JsonProperty("username")]
        public string Username { get; set; }

        [JsonProperty("text")]
        public string Text { get; set; }

    }
}
