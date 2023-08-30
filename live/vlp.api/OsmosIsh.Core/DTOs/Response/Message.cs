using Amazon.ChimeSDKMeetings.Model;
using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.DTOs.Response
{
    public class ChatMessage
    {
        public int? MessageId { get; set; }
        public int SenderId
        {
            get; set;
        }
        public int RecipientId { get; set; }
        public string Message { get; set; }
        public char IsSeen { get; set; }
        public DateTime CreatedDate{ get; set; }
        public string CreatedBy{ get; set; }

    }
}
