export default class Timer {
    initialize(endDateTime: string, beforeMeetingEndTime: number, callback: any): void;
    convertUTCDateTimeToUserSepcificDateTime(endDate: string, timeZoneOffset: number): Date;
}
