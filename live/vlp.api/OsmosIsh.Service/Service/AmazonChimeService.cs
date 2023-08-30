using Amazon;
using Amazon.ChimeSDKMeetings;
using Amazon.ChimeSDKMeetings.Model;
using Amazon.ChimeSDKMeetings;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Data.DBEntities;
using OsmosIsh.Repository.IRepository;
using OsmosIsh.Service.IService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.Service
{
    public class AmazonChimeService : IAmazonChimeService
    {
        #region readonly
        private readonly IAmazonChimeRepository _AmazonChimeRepository;
        private readonly IMapper _Mapper;
        #endregion

        #region Private
        private MainResponse _MainResponse;
        public OsmosIshContext _ObjContext;
        private AmazonChimeSDKMeetingsClient _AmazonChimeClient = null;
        private string _AmazonChimeRegion = "us-east-1";
        #endregion
        public AmazonChimeService(IMapper Mapper, OsmosIshContext ObjContext, IAmazonChimeRepository AmazonChimeRepository)
        {

            _AmazonChimeRepository = AmazonChimeRepository;
            _Mapper = Mapper;
            _MainResponse = new MainResponse();
            _ObjContext = ObjContext;
            _AmazonChimeClient = new AmazonChimeSDKMeetingsClient(AppSettingConfigurations.AppSettings.AWSAccessKeyId, AppSettingConfigurations.AppSettings.AWSSecretAccessKey, RegionEndpoint.USEast1);
        }

        public async Task<MainResponse> CreateMeeting(AmazonChimeMeetingRequest amazonChimeMeetingRequest)
        {
            var validateMeetingResponse = await _AmazonChimeRepository.ValidateCreateMeeting(amazonChimeMeetingRequest);
            var meetingResponse = new Meeting();

            if (validateMeetingResponse.Success)
            {
                string OldAttendeeId = "";
                #region Create Meeting
                var meeting = _ObjContext.Meetings.Where(x => x.SessionId == amazonChimeMeetingRequest.SessionId && x.IsMeetingEnded == "N").FirstOrDefault();

                if (meeting != null)
                {
                    OldAttendeeId = meeting.AmazonChimeAttendeeId;
                    var getMeetingRequest = new GetMeetingRequest
                    {
                        MeetingId = meeting.AmazonChimeMeetingId
                    };
                    var getMeetingResponse = new GetMeetingResponse();
                    try
                    {
                        getMeetingResponse = await _AmazonChimeClient.GetMeetingAsync(getMeetingRequest);
                        meetingResponse = getMeetingResponse.Meeting;
                    }
                    catch (Exception ex)
                    {
                        if (((Amazon.Runtime.AmazonServiceException)ex).ErrorCode == "NotFoundException")
                        {
                            Guid guid = Guid.NewGuid();
                            var createMeetingRequest = new CreateMeetingRequest();
                            createMeetingRequest.MediaRegion = _AmazonChimeRegion;
                            createMeetingRequest.ClientRequestToken = guid.ToString();
                            createMeetingRequest.ExternalMeetingId = validateMeetingResponse.ExternalMeetingId.Length > 50 ? validateMeetingResponse.ExternalMeetingId.Substring(0, 50) : validateMeetingResponse.ExternalMeetingId;
                            var createMeetingResponse = await _AmazonChimeClient.CreateMeetingAsync(createMeetingRequest);

                            meetingResponse = createMeetingResponse.Meeting;
                            meeting.AmazonChimeMeetingTitle = meetingResponse.ExternalMeetingId;
                            meeting.AmazonChimeMeetingId = meetingResponse.MeetingId;
                            _ObjContext.Meetings.Update(meeting);
                            await _ObjContext.SaveChangesAsync();
                        }
                    }
                }
                else
                {
                    Guid guid = Guid.NewGuid();
                    var createMeetingRequest = new CreateMeetingRequest();
                    createMeetingRequest.MediaRegion = _AmazonChimeRegion;
                    createMeetingRequest.ClientRequestToken = guid.ToString();
                    createMeetingRequest.ExternalMeetingId = validateMeetingResponse.ExternalMeetingId.Length > 50 ? validateMeetingResponse.ExternalMeetingId.Substring(0, 50) : validateMeetingResponse.ExternalMeetingId;
                    var createMeetingResponse = await _AmazonChimeClient.CreateMeetingAsync(createMeetingRequest);

                    meetingResponse = createMeetingResponse.Meeting;
                    await SaveMeeting(meetingResponse.MeetingId, meetingResponse.ExternalMeetingId, amazonChimeMeetingRequest.SessionId);
                }

                #endregion

                #region Create Attendee
                var randomNumber = new Random().Next(1000, 9999).ToString();
                // Create Attendee
                var createAttendeeRequest = new CreateAttendeeRequest();
                createAttendeeRequest.MeetingId = meetingResponse.MeetingId;
                createAttendeeRequest.ExternalUserId = validateMeetingResponse.UserName + " (" + randomNumber + ")";
                var attendeeResponse = await _AmazonChimeClient.CreateAttendeeAsync(createAttendeeRequest);
                if (meeting == null)
                {
                    meeting = _ObjContext.Meetings.Where(x => x.SessionId == amazonChimeMeetingRequest.SessionId && x.IsMeetingEnded == "N").FirstOrDefault();
                }
                meeting.AmazonChimeAttendeeId = attendeeResponse.Attendee.AttendeeId;
                _ObjContext.Meetings.Update(meeting);
                await _ObjContext.SaveChangesAsync();

                #endregion

                var joinInfo = new JoinInfo();
                joinInfo.Meeting = meetingResponse;
                joinInfo.Attendee = attendeeResponse.Attendee;
                joinInfo.UserName = validateMeetingResponse.UserName + " (" + randomNumber + ")"; ;
                joinInfo.ExternalMeetingId = validateMeetingResponse.ExternalMeetingId;
                joinInfo.Region = _AmazonChimeRegion;
                joinInfo.MeetingEndDateTime = Convert.ToDateTime(validateMeetingResponse.MeetingEndDateTime);
                joinInfo.BeforeMeetingEndTime = validateMeetingResponse.BeforeMeetingEndTime;
                joinInfo.SessionTitle = validateMeetingResponse.SessionTitle;
                joinInfo.OldAttendeeId = OldAttendeeId;
                joinInfo.UserId = amazonChimeMeetingRequest.UserId.ToString();
                _MainResponse.JoinInfo = joinInfo;
                _MainResponse.Message = validateMeetingResponse.Message;
            }
            else
            {
                _MainResponse.Message = validateMeetingResponse.Message;
                _MainResponse.Success = false;
            }
            return _MainResponse;
        }

        public async Task<MainResponse> JoinMeeting(AmazonChimeMeetingRequest amazonChimeMeetingRequest)
        {
            var validateMeetingResponse = await _AmazonChimeRepository.ValidateJoinMeeting(amazonChimeMeetingRequest);
            var randomNumber = new Random().Next(1000, 9999).ToString();
            if (validateMeetingResponse.Success)
            {
                var meetingResponse = await _AmazonChimeClient.GetMeetingAsync(new GetMeetingRequest { MeetingId = validateMeetingResponse.AmazonChimeMeetingId });
                var attendeeResponse = new Attendee();
                string OldAttendeeId = "";
                #region Create Attendee
                // Check for attendee 
                var meetingAttendee = _ObjContext.MeetingAttendees.Where(x => x.MeetingId == validateMeetingResponse.MeetingId && x.AmazonChimeAttendeeId == validateMeetingResponse.AmazonChimeAttendeeId && x.StudentId == validateMeetingResponse.StudentId).FirstOrDefault();
                if (meetingAttendee != null)
                {
                        OldAttendeeId = meetingAttendee.AmazonChimeAttendeeId;
                        var createAttendeeRequest = new CreateAttendeeRequest();
                        createAttendeeRequest.MeetingId = validateMeetingResponse.AmazonChimeMeetingId;
                        createAttendeeRequest.ExternalUserId = validateMeetingResponse.UserName + " (" + randomNumber + ")";
                        var createAttendeeResponse = await _AmazonChimeClient.CreateAttendeeAsync(createAttendeeRequest);
                        attendeeResponse = createAttendeeResponse.Attendee;

                        meetingAttendee.AmazonChimeAttendeeId = attendeeResponse.AttendeeId;
                        _ObjContext.MeetingAttendees.Update(meetingAttendee);
                        await _ObjContext.SaveChangesAsync();
                 }
                else
                {
                    var createAttendeeRequest = new CreateAttendeeRequest();
                    createAttendeeRequest.MeetingId = validateMeetingResponse.AmazonChimeMeetingId;
                    createAttendeeRequest.ExternalUserId = validateMeetingResponse.UserName + " (" + randomNumber + ")";
                    var createAttendeeResponse = await _AmazonChimeClient.CreateAttendeeAsync(createAttendeeRequest);
                    attendeeResponse = createAttendeeResponse.Attendee;

                    await SaveAttendee(validateMeetingResponse.MeetingId, validateMeetingResponse.StudentId, attendeeResponse.AttendeeId);
                }

                #endregion

                var joinInfo = new JoinInfo();
                joinInfo.Meeting = meetingResponse.Meeting;
                joinInfo.Attendee = attendeeResponse;
                joinInfo.UserName = validateMeetingResponse.UserName + " (" + randomNumber + ")";
                joinInfo.ExternalMeetingId = validateMeetingResponse.ExternalMeetingId;
                joinInfo.Region = _AmazonChimeRegion.ToString();
                joinInfo.MeetingEndDateTime = Convert.ToDateTime(validateMeetingResponse.MeetingEndDateTime);
                joinInfo.BeforeMeetingEndTime = validateMeetingResponse.BeforeMeetingEndTime;
                joinInfo.SessionTitle = validateMeetingResponse.SessionTitle;
                joinInfo.UserId = amazonChimeMeetingRequest.UserId.ToString();
                joinInfo.OldAttendeeId = OldAttendeeId;
                _MainResponse.JoinInfo = joinInfo;
                _MainResponse.Message = validateMeetingResponse.Message;
            }
            else
            {
                _MainResponse.Message = validateMeetingResponse.Message;
                _MainResponse.Success = false;
            }
            return _MainResponse;
        }

        public async Task<MainResponse> EndMeeting(AmazonChimeMeetingRequest amazonChimeMeetingRequest)
        {
            var validateMeetingResponse = await _AmazonChimeRepository.ValidateEndMeeting(amazonChimeMeetingRequest);
            if (validateMeetingResponse.Success)
            {
                await _AmazonChimeClient.DeleteMeetingAsync(new DeleteMeetingRequest { MeetingId = validateMeetingResponse.AmazonChimeMeetingId });
                await _AmazonChimeRepository.EndMeeting(validateMeetingResponse.MeetingId);
                _MainResponse.Message = SuccessMessage.Session_ENDED;
            }
            else
            {
                _MainResponse.Message = ErrorMessages.NO_Session_Exists;
                _MainResponse.Success = false;
            }
            return _MainResponse;
        }

        #region Private Functions
        public async Task SaveMeeting(string amazonChimeMeetingId, string amazonChimeMeetingTitle, int sessionId)
        {
            var meetings = new Meetings();
            meetings.AmazonChimeMeetingTitle = amazonChimeMeetingTitle;
            meetings.AmazonChimeMeetingId = amazonChimeMeetingId;
            meetings.SessionId = sessionId;
            meetings.StartDateTime = DateTime.UtcNow;
            _ObjContext.Meetings.Add(meetings);
            await _ObjContext.SaveChangesAsync();
        }

        public async Task SaveAttendee(int? meetingId, int? studentId, string amazonChimeAttendeeId)
        {
            var meetingAttendees = new MeetingAttendees();
            meetingAttendees.MeetingId = Convert.ToInt32(meetingId);
            meetingAttendees.StudentId = Convert.ToInt32(studentId);
            meetingAttendees.AmazonChimeAttendeeId = amazonChimeAttendeeId;
            meetingAttendees.StartDateTime = DateTime.UtcNow;
            _ObjContext.MeetingAttendees.Add(meetingAttendees);
            await _ObjContext.SaveChangesAsync();
        }

        #endregion
    }
}
