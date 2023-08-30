
using Amazon.ChimeSDKMeetings.Model;
using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.DTOs.Response
{
    public class JoinInfo
    {
        public Meeting Meeting { get; set; }
        public Attendee Attendee { get; set; }
        public string UserName { get; set; }
        public DateTime? MeetingEndDateTime { get; set; }
        public string Region { get; set; }
        public string ExternalMeetingId { get; set; }
        public int? BeforeMeetingEndTime { get; set; }
        public string SessionTitle { get; set; }
        public string UserId { get; set; }
        public string OldAttendeeId { get; set; }

    }

    public class MeetingResponse
    {
        public string AmazonChimeMeetingId { get; set; }
        public string AmazonChimeMeetingTitle { get; set; }
        public DateTime? StartDateTime { get; set; }
    }


    public class ValidateMeetingResponse:BaseResponse
    {
        public int? StudentId { get; set; }
        public string AmazonChimeMeetingId { get; set; }
        public string AmazonChimeAttendeeId { get; set; }
        public string ExternalMeetingId { get; set; }
        public int? MeetingId { get; set; }
        public string UserName { get; set; }
        public DateTime? MeetingEndDateTime { get; set; }
        public int? BeforeMeetingEndTime { get; set; }
        public string SessionTitle { get; set; }
        
    }
}
