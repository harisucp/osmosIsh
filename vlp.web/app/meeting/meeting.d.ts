import "./style.scss";
import "bootstrap";
import { AudioVideoFacade, AudioVideoObserver, ContentShareObserver, DataMessage, DeviceChangeObserver, MeetingSession, MeetingSessionConfiguration, MeetingSessionStatus, MeetingSessionVideoAvailability, VideoTileState, ClientVideoStreamReceivingReport } from "amazon-chime-sdk-js";
declare class DemoTileOrganizer {
    static MAX_TILES: number;
    private tiles;
    tileStates: {
        [id: number]: boolean;
    };
    acquireTileIndex(tileId: number): number;
    releaseTileIndex(tileId: number): number;
}
export declare enum ContentShareType {
    ScreenCapture = 0,
    VideoFile = 1
}
export declare enum UserType {
    Teacher = 0,
    Student = 1
}
export declare class DemoMeetingApp implements AudioVideoObserver, DeviceChangeObserver, ContentShareObserver {
    static readonly DID: string;
    static readonly BASE_URL: string;
    static testVideo: string;
    static readonly LOGGER_BATCH_SIZE: number;
    static readonly LOGGER_INTERVAL_MS: number;
    static readonly DATA_MESSAGE_TOPIC: string;
    static readonly DATA_MESSAGE_TOPIC_MUTE_ALL: string;
    static readonly DATA_MESSAGE_TOPIC_AUTO_LOGOUT: string;
    static readonly DATA_MESSAGE_TOPIC_ALLOWED_RESTRICT_SCREEN_SHARING: string;
    static readonly DATA_MESSAGE_TOPIC_REMOTE_ATTENDEE_MUTE_UNMUTE: string;
    static readonly DATA_MESSAGE_TOPIC_SET_ACTIVE_SPEAKER_ATTENDEE: string;
    static readonly DATA_MESSAGE_TOPIC_ALLOWED_RESTRICT_VIDEO: string;
    static readonly DATA_MESSAGE_LIFETIME_MS: number;
    static readonly API_URL: string;
    static readonly REACT_APP_URL: string;
    static readonly REACT_APP_TIMEOUT_IN_MINUTES: number;
    static screenSharedAllowedAttendeeId: string;
    static activeSpeakerAttendeeId: string;
    static newActiveSpeakerAttendeeId: string;
    static restrictedVideoAttendeeIds: any;
    static autoStop: boolean;
    showActiveSpeakerScores: boolean;
    activeSpeakerLayout: boolean;
    sessionId: number | null;
    userType: UserType;
    userId: string | null;
    screenSharedAllowed: number | null;
    oldAttendeeId: string | null;
    sessionTitle: string | null;
    rejoinInterval: any | null;
    slideSession: any | null;
    autoLogoutSession: any | null;
    meeting: string | null;
    name: string | null;
    voiceConnectorId: string | null;
    sipURI: string | null;
    region: string | null;
    meetingSession: MeetingSession | null;
    audioVideo: AudioVideoFacade | null;
    tileOrganizer: DemoTileOrganizer;
    canStartLocalVideo: boolean;
    roster: any;
    tileIndexToTileId: {
        [id: number]: number;
    };
    tileIdToTileIndex: {
        [id: number]: number;
    };
    cameraDeviceIds: string[];
    microphoneDeviceIds: string[];
    buttonStates: {
        [key: string]: boolean;
    };
    contentShareType: ContentShareType;
    enableWebAudio: boolean;
    enableUnifiedPlanForChromiumBasedBrowsers: boolean;
    enableSimulcast: boolean;
    markdown: any;
    lastMessageSender: string | null;
    lastReceivedMessageTimestamp: number;
    constructor();
    setLogo(): void;
    showErrorBox(message: any, type: any): void;
    initalizeParmeters(): any;
    init(showInitialLoading: any): void;
    initEventListeners(): void;
    getSupportedMediaRegions(): Array<string>;
    getNearestMediaRegion(): Promise<string>;
    setMediaRegion(): void;
    toggleButton(button: string, state?: "on" | "off"): boolean;
    isButtonOn(button: string): boolean;
    displayButtonStates(): void;
    show(id: string): void;
    hide(id: string): void;
    showProgress(id: string): void;
    hideProgress(id: string): void;
    switchToFlow(flow: string): void;
    audioInputsChanged(_freshAudioInputDeviceList: MediaDeviceInfo[]): void;
    videoInputsChanged(_freshVideoInputDeviceList: MediaDeviceInfo[]): void;
    audioOutputsChanged(_freshAudioOutputDeviceList: MediaDeviceInfo[]): void;
    estimatedDownlinkBandwidthLessThanRequired(estimatedDownlinkBandwidthKbps: number, requiredVideoDownlinkBandwidthKbps: number): void;
    videoNotReceivingEnoughData(videoReceivingReports: ClientVideoStreamReceivingReport[]): void;
    initializeMeetingSession(configuration: MeetingSessionConfiguration): Promise<void>;
    setClickHandler(elementId: string, f: () => void): void;
    join(): Promise<void>;
    leave(): void;
    setupMuteHandler(): void;
    setupCanUnmuteHandler(): void;
    updateRoster(): void;
    updateProperty(obj: any, key: string, value: string): void;
    setupSubscribeToAttendeeIdPresenceHandler(): void;
    dataMessageHandler(dataMessage: DataMessage): void;
    dataMuteAllHandler(dataMessage: DataMessage): void;
    dataRemoteAttendeeMuteUnMuteHandler(dataMessage: DataMessage): void;
    dataRemoteAttendeeAllowedRestrictScreenSharingHandler(dataMessage: DataMessage): void;
    dataAutoLogoutHandler(dataMessage: DataMessage): void;
    dataRemoteSetActiveSpeakerAttendeeHandler(dataMessage: DataMessage): void;
    dataRemoteAllowedRestrictVideoHandler(dataMessage: DataMessage): void;
    setupDataMessage(): void;
    joinMeeting(): Promise<any>;
    endMeeting(meetingObject: any): Promise<any>;
    getAttendee(attendeeId: string): Promise<any>;
    setupDeviceLabelTrigger(): void;
    populateDeviceList(elementId: string, genericName: string, devices: MediaDeviceInfo[], additionalOptions: string[]): void;
    populateInMeetingDeviceList(elementId: string, genericName: string, devices: MediaDeviceInfo[], additionalOptions: string[], callback: (name: string) => void): void;
    createDropdownMenuItem(menu: HTMLDivElement, title: string, clickHandler: () => void, id?: string): HTMLButtonElement;
    populateAllDeviceLists(): Promise<void>;
    populateAudioInputList(): Promise<void>;
    populateVideoInputList(): Promise<void>;
    populateAudioOutputList(): Promise<void>;
    private analyserNodeCallback;
    openAudioInputFromSelection(): Promise<void>;
    setAudioPreviewPercent(percent: number): void;
    startAudioPreview(): void;
    openAudioOutputFromSelection(): Promise<void>;
    private selectedVideoInput;
    openVideoInputFromSelection(selection: string | null, showPreview: boolean): Promise<void>;
    private audioInputSelectionToDevice;
    private videoInputSelectionToDevice;
    private initContentShareDropDownItems;
    private contentShareTypeChanged;
    private contentShareStart;
    private contentShareStop;
    isRecorder(): boolean;
    authenticate(): Promise<any>;
    log(str: string): void;
    audioVideoDidStartConnecting(reconnecting: boolean): void;
    audioVideoDidStart(): void;
    audioVideoDidStop(sessionStatus: MeetingSessionStatus): void;
    videoTileDidUpdate(tileState: VideoTileState): void;
    videoTileWasRemoved(tileId: number): void;
    videoAvailabilityDidChange(availability: MeetingSessionVideoAvailability): void;
    hideTile(tileIndex: number): void;
    tileIdForAttendeeId(attendeeId: string): number | null;
    findContentTileId(): number | null;
    isContentTile(tileIndex: number): boolean;
    activeTileId(): number | null;
    layoutVideoTiles(): Promise<void>;
    visibleTileIndices(): number[];
    setUpVideoTileElementResizer(): void;
    layoutVideoTilesActiveSpeaker(visibleTileIndices: number[], activeTileId: number): void;
    updateTilePlacement(tileIndex: number, x: number, y: number, w: number, h: number): void;
    layoutVideoTilesGrid(visibleTileIndices: number[]): void;
    allowMaxContentShare(): boolean;
    connectionDidBecomePoor(): void;
    connectionDidSuggestStopVideo(): void;
    connectionDidBecomeGood(): void;
    videoSendDidBecomeUnavailable(): void;
    contentShareDidStart(): void;
    contentShareDidStop(): void;
    contentShareDidPause(): void;
    contentShareDidUnpause(): void;
}
export {};
