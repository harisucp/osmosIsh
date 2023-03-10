// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { apiService } from "../../src/services/api.service";
import { commonFunctions } from "../../src/shared/components/functional/commonfunctions";
import moment from "moment";
import "./style.scss";
import "bootstrap";
import { localStorageService } from "../../src/services/localStorageService";

import {
  AsyncScheduler,
  AudioVideoFacade,
  AudioVideoObserver,
  ClientMetricReport,
  ConsoleLogger,
  ContentShareObserver,
  DataMessage,
  DefaultActiveSpeakerPolicy,
  DefaultAudioMixController,
  DefaultDeviceController,
  DefaultMeetingSession,
  DefaultModality,
  Device,
  DeviceChangeObserver,
  LogLevel,
  Logger,
  MultiLogger,
  MeetingSession,
  MeetingSessionConfiguration,
  MeetingSessionPOSTLogger,
  MeetingSessionStatus,
  MeetingSessionStatusCode,
  MeetingSessionVideoAvailability,
  TimeoutScheduler,
  Versioning,
  VideoTileState,
  ClientVideoStreamReceivingReport,
} from "amazon-chime-sdk-js";

import Timer from "./timer";

class DemoTileOrganizer {
  // this is index instead of length
  static MAX_TILES = 17;
  private tiles: { [id: number]: number } = {};
  public tileStates: { [id: number]: boolean } = {};

  acquireTileIndex(tileId: number): number {
    for (let index = 0; index <= DemoTileOrganizer.MAX_TILES; index++) {
      if (this.tiles[index] === tileId) {
        return index;
      }
    }
    for (let index = 0; index <= DemoTileOrganizer.MAX_TILES; index++) {
      if (!(index in this.tiles)) {
        this.tiles[index] = tileId;
        return index;
      }
    }
    throw new Error("no tiles are available");
  }

  releaseTileIndex(tileId: number): number {
    for (let index = 0; index <= DemoTileOrganizer.MAX_TILES; index++) {
      if (this.tiles[index] === tileId) {
        delete this.tiles[index];
        return index;
      }
    }
    return DemoTileOrganizer.MAX_TILES;
  }
}

class TestSound {
  constructor(
    sinkId: string | null,
    frequency: number = 440,
    durationSec: number = 1,
    rampSec: number = 0.1,
    maxGainValue: number = 0.1
  ) {

    // @ts-ignore
    const audioContext: AudioContext = new (window.AudioContext || window.webkitAudioContext)();
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0;
    const oscillatorNode = audioContext.createOscillator();
    oscillatorNode.frequency.value = frequency;
    oscillatorNode.connect(gainNode);
    const destinationStream = audioContext.createMediaStreamDestination();
    gainNode.connect(destinationStream);
    const currentTime = audioContext.currentTime;
    const startTime = currentTime + 0.1;
    gainNode.gain.linearRampToValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(maxGainValue, startTime + rampSec);
    gainNode.gain.linearRampToValueAtTime(
      maxGainValue,
      startTime + rampSec + durationSec
    );
    gainNode.gain.linearRampToValueAtTime(
      0,
      startTime + rampSec * 2 + durationSec
    );
    oscillatorNode.start();
    const audioMixController = new DefaultAudioMixController();
    // @ts-ignore
    audioMixController.bindAudioDevice({ deviceId: sinkId });
    audioMixController.bindAudioElement(new Audio());
    audioMixController.bindAudioStream(destinationStream.stream);
    new TimeoutScheduler((rampSec * 2 + durationSec + 1) * 1000).start(() => {
      audioContext.close();
    });
  }
}

export enum ContentShareType {
  ScreenCapture,
  VideoFile,
}

export enum UserType {
  Teacher,
  Student,
}

export class DemoMeetingApp
  implements AudioVideoObserver, DeviceChangeObserver, ContentShareObserver {
  static readonly DID: string = "+17035550122";
  static readonly BASE_URL: string = [
    location.protocol,
    "//",
    location.host,
    location.pathname.replace(/\/*$/, "/").replace("/v2", ""),
  ].join("");
  static testVideo: string =
    "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.360p.vp9.webm";
  static readonly LOGGER_BATCH_SIZE: number = 85;
  static readonly LOGGER_INTERVAL_MS: number = 1150;
  static readonly DATA_MESSAGE_TOPIC: string = "chat";
  static readonly DATA_MESSAGE_TOPIC_MUTE_ALL: string = "muteAll";
  static readonly DATA_MESSAGE_TOPIC_AUTO_LOGOUT: string = "autologout";
  static readonly DATA_MESSAGE_TOPIC_ALLOWED_RESTRICT_SCREEN_SHARING: string = "allowedRestrictScreenSharing";
  static readonly DATA_MESSAGE_TOPIC_REMOTE_ATTENDEE_MUTE_UNMUTE: string = "remoteattendeemuteunmute";
  static readonly DATA_MESSAGE_TOPIC_SET_ACTIVE_SPEAKER_ATTENDEE: string = "activateattendee";
  static readonly DATA_MESSAGE_TOPIC_ALLOWED_RESTRICT_VIDEO: string = "allowedRestrictVideo";

  static readonly DATA_MESSAGE_LIFETIME_MS: number = 300000;
  // static readonly API_URL: string = "https://localhost:44336";
  static readonly API_URL: string = "https://www.osmosish.com/apiBeta";
  // static readonly API_URL: string = "https://www.osmosish.com/api";
// static readonly REACT_APP_URL: string = window.location.origin; 
static readonly REACT_APP_URL: string = window.location.origin + "/BetaTest240972"; 
// window.location.origin + "/BetaTest240972"; 

  static readonly REACT_APP_TIMEOUT_IN_MINUTES: number = 30;
  static screenSharedAllowedAttendeeId: string = null;
  static activeSpeakerAttendeeId: string = null;
  static newActiveSpeakerAttendeeId: string = null;
  static restrictedVideoAttendeeIds: any = [];
  static autoStop: boolean = false;


  showActiveSpeakerScores = false;
  activeSpeakerLayout = true;

  sessionId: number | null = null;
  userType: UserType;
  userId: string | null = null;
  screenSharedAllowed: number | null;
  oldAttendeeId: string | null = null;
  sessionTitle: string | null = null;
  rejoinInterval: any | null = null;
  slideSession: any | null = null;
  autoLogoutSession: any | null = null;
  meeting: string | null = null;
  name: string | null = null;
  voiceConnectorId: string | null = null;
  sipURI: string | null = null;
  region: string | null = null;
  meetingSession: MeetingSession | null = null;
  audioVideo: AudioVideoFacade | null = null;
  tileOrganizer: DemoTileOrganizer = new DemoTileOrganizer();
  canStartLocalVideo: boolean = true;
  // eslint-disable-next-line
  roster: any = {};
  tileIndexToTileId: { [id: number]: number } = {};
  tileIdToTileIndex: { [id: number]: number } = {};

  cameraDeviceIds: string[] = [];
  microphoneDeviceIds: string[] = [];

  buttonStates: { [key: string]: boolean } = {
    "button-microphone": true,
    "button-camera": false,
    "button-speaker": true,
    "button-content-share": false,
    "button-view-title-all": false
  };

  contentShareType: ContentShareType = ContentShareType.ScreenCapture;

  // feature flags
  enableWebAudio = false;
  enableUnifiedPlanForChromiumBasedBrowsers = true;
  enableSimulcast = false;

  markdown = require("markdown-it")({ linkify: true });
  lastMessageSender: string | null = null;
  lastReceivedMessageTimestamp = 0;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // console.log('in meeting ts');
    
    (global as any).app = this;
    try {
      this.initalizeParmeters();

      this.initEventListeners();
      this.init(true);
      this.setMediaRegion();
      this.setUpVideoTileElementResizer();
      this.setLogo();

      if (this.isRecorder()) {
        new AsyncScheduler().start(async () => {
          this.meeting = new URL(window.location.href).searchParams.get("m");
          this.name = "??Meeting Recorder??";
          await this.authenticate();
          await this.join();
          this.displayButtonStates();
          this.switchToFlow("flow-meeting");
        });
      }
      // this.autoLogoutSession = setInterval(() => {
      //   if (this.oldAttendeeId) {
      //     this.audioVideo.realtimeSendDataMessage(
      //       DemoMeetingApp.DATA_MESSAGE_TOPIC_AUTO_LOGOUT,
      //       this.oldAttendeeId,
      //       DemoMeetingApp.DATA_MESSAGE_LIFETIME_MS
      //     );
      //   }
      // }, 5000);

      this.slideSession = setInterval(() => {
        localStorageService.SetExpiresAtInMinutes(DemoMeetingApp.REACT_APP_TIMEOUT_IN_MINUTES);
        console.log("Session Sliding");
      }, 6000);

    } catch (error) {
      console.log(error);
      
      this.showErrorBox(error.message, "");
    }
  }

  setLogo() {
    var logo = document.getElementsByClassName("logoImage");
    var i;
    for (i = 0; i < logo.length; i++) {
      var logoImage = DemoMeetingApp.REACT_APP_URL + "/logo.png";
      logo[i].innerHTML =
        "<img class='logo'  alt='logo' src='" + logoImage + "'/>";
    }
  }

  showErrorBox(message, type) {
    
    
    (document.getElementById(
      "failed-card-title"
    ) as HTMLDivElement).innerText = type;
    (document.getElementById(
      "failed-meeting-error"
    ) as HTMLDivElement).innerText = message;
    this.switchToFlow("flow-failed-meeting");
  }

  initalizeParmeters(): any {
    // const sessionEnded = new URL(window.location.href).searchParams.get('sessionEnded')
    // if(sessionEnded && sessionEnded == "true") throw new Error("Sessionid Ended");

    const sessionId = new URL(window.location.href).searchParams.get(
      "sessionId"
    );
    console.log(sessionId, 'session Id');
    
    if (!sessionId) throw new Error("Invalid sessionid");

    const userType = new URL(window.location.href).searchParams.get("type");
    this.userType = userType == "1" ? UserType.Student : UserType.Teacher;

    this.sessionId = Number(sessionId);
    this.screenSharedAllowed = 0;
  }

  init(showInitialLoading): void {
    console.log('in init');
    // debugger;
    new AsyncScheduler().start(
      async (): Promise<void> => {
        try {
          navigator.mediaDevices.getUserMedia;
        }
        catch (error) {
          this.switchToFlow("flow-device-compatibility");
          return;
        }
        var chimeMeetingId: string = "";
        if (showInitialLoading)
          this.switchToFlow("flow-initial-loading-meeting");
        try {
          
          const dataFromAuth = await this.authenticate();
          
          if(dataFromAuth?.Data === null){
            if (
              dataFromAuth?.Message ==
              "This session has not started yet. Please wait for the class to begin. In some instances, you may need to refresh your browser." &&
              this.rejoinInterval == null
            ) {
              this.rejoinInterval = setInterval(async () => {
                this.init(false);
              }, 5000);
            }
            this.showErrorBox(dataFromAuth?.Message, "");
            return;
          }else{
            chimeMeetingId = dataFromAuth;
            clearInterval(this.rejoinInterval);
          }
          
          
        } catch (error) {
          
          if (
            error.message ==
            "This session has not started yet. Please wait for the class to begin. In some instances, you may need to refresh your browser." &&
            this.rejoinInterval == null
          ) {
            this.rejoinInterval = setInterval(async () => {
              this.init(false);
            }, 5000);
          }
          this.showErrorBox(error.message, "");
          return;
        }

        (document.getElementById(
          "meeting-id"
        ) as HTMLSpanElement).innerText = `${this.sessionTitle}`;
        // (document.getElementById(
        //   'chime-meeting-id'
        // ) as HTMLSpanElement).innerText = `Meeting ID: ${chimeMeetingId}`;
        // (document.getElementById(
        //   'mobile-chime-meeting-id'
        // ) as HTMLSpanElement).innerText = `Meeting ID: ${chimeMeetingId}`;
        // (document.getElementById(
        //   'mobile-attendee-id'
        // ) as HTMLSpanElement).innerText = `Attendee ID: ${this.meetingSession.configuration.credentials.attendeeId}`;
        // (document.getElementById(
        //   'desktop-attendee-id'
        // ) as HTMLSpanElement).innerText = `Attendee ID: ${this.meetingSession.configuration.credentials.attendeeId}`;
        (document.getElementById(
          "info-meeting"
        ) as HTMLSpanElement).innerText = this.sessionTitle;
        (document.getElementById(
          "info-name"
        ) as HTMLSpanElement).innerText = this.name;
        this.switchToFlow("flow-devices");
        await this.openAudioInputFromSelection();
        try {
          await this.openVideoInputFromSelection(
            (document.getElementById("video-input") as HTMLSelectElement).value,
            true
          );
        } catch (err) {
          this.log("no video input device selected");
        }
        await this.openAudioOutputFromSelection();
        this.hide("progress");
      }
    );
  }



  initEventListeners(): void {
    window.addEventListener("resize", () => {
      this.layoutVideoTiles();
    });

    const audioInput = document.getElementById(
      "audio-input"
    ) as HTMLSelectElement;
    audioInput.addEventListener("change", async (_ev: Event) => {
      this.log("audio input device is changed");
      await this.openAudioInputFromSelection();
    });

    const videoInput = document.getElementById(
      "video-input"
    ) as HTMLSelectElement;
    videoInput.addEventListener("change", async (_ev: Event) => {
      this.log("video input device is changed");
      try {
        await this.openVideoInputFromSelection(videoInput.value, true);
      } catch (err) {
        this.log("no video input device selected");
      }
    });

    // const optionalFeatures = document.getElementById('optional-features') as HTMLSelectElement;
    // optionalFeatures.addEventListener('change', async (_ev: Event) => {
    //   const collections = optionalFeatures.selectedOptions;
    //   this.enableSimulcast = false;
    //   this.enableWebAudio = false;
    //   this.log("Feature lists:");
    //   for (let i = 0; i < collections.length; i++) {
    //     // hard code magic
    //     if (collections[i].value === 'simulcast') {
    //       this.enableSimulcast = true;
    //       this.log('attempt to enable simulcast');
    //     } else if (collections[i].value === 'webaudio') {
    //       this.enableWebAudio = true;
    //       this.log('attempt to enable webaudio');
    //     }
    //   }
    // });
    const buttonViewAll = document.getElementById("button-view-title-all");
    buttonViewAll.addEventListener("click", () => {
      this.activeSpeakerLayout = !this.toggleButton("button-view-title-all");
      buttonViewAll.innerText = this.activeSpeakerLayout === true ? "View all" : "Class mode";
      buttonViewAll.title = this.activeSpeakerLayout === true ? "View all" : "Class mode";
      this.layoutVideoTiles();
    });
    const videoInputQuality = document.getElementById(
      "video-input-quality"
    ) as HTMLSelectElement;
    videoInputQuality.addEventListener("change", async (_ev: Event) => {
      this.log("Video input quality is changed");
      switch (videoInputQuality.value) {
        case "360p":
          this.audioVideo.chooseVideoInputQuality(640, 360, 15, 600);
          break;
        case "540p":
          this.audioVideo.chooseVideoInputQuality(960, 540, 15, 1400);
          break;
        case "720p":
          this.audioVideo.chooseVideoInputQuality(1280, 720, 15, 1400);
          break;
      }
      try {
        await this.openVideoInputFromSelection(videoInput.value, true);
      } catch (err) {
        this.log("no video input device selected");
      }
    });

    const audioOutput = document.getElementById(
      "audio-output"
    ) as HTMLSelectElement;
    audioOutput.addEventListener("change", async (_ev: Event) => {
      this.log("audio output device is changed");
      await this.openAudioOutputFromSelection();
    });

    document
      .getElementById("collapse-bar")
      .addEventListener("click", (e) => {
        e.preventDefault();
        var elementMessageContainer = document.getElementById("roster-message-container");
        elementMessageContainer.classList.toggle("hideSideBar");

        var elementTileContainer = document.getElementById("tile-container");
        if (elementTileContainer.classList.contains("col-12")) {
          elementTileContainer.classList.remove("col-12");
          elementTileContainer.classList.add("col-sm-6", "col-md-8", "col-lg-8");
        }
        else {
          elementTileContainer.classList.remove("col-sm-6", "col-md-8", "col-lg-8");
          elementTileContainer.classList.add("col-12");
        }
        this.layoutVideoTiles();
      });

    document
      .getElementById("button-test-sound")
      .addEventListener("click", (e) => {
        e.preventDefault();
        const audioOutput = document.getElementById(
          "audio-output"
        ) as HTMLSelectElement;
        new TestSound(audioOutput.value);
      });
    document.getElementById("form-devices").addEventListener("submit", (e) => {
      e.preventDefault();
      new AsyncScheduler().start(async () => {
        try {
          this.showProgress("progress-join");
          await this.join();
          this.audioVideo.stopVideoPreviewForVideoInput(
            document.getElementById("video-preview") as HTMLVideoElement
          );
          if (this.userType == UserType.Teacher) {
            (buttonMeetingLeave as HTMLButtonElement).style.display = "none";
          } else {
            (buttonMeetingEnd as HTMLButtonElement).style.display = "none";
            (buttonMuteAll as HTMLButtonElement).style.display = "none";
            //(buttonViewAll as HTMLButtonElement).style.display = "none";
            (document.getElementById("button-content-share") as HTMLButtonElement).disabled = true;
            (document.getElementById("button-content-share") as HTMLButtonElement).title = "Share screen disabled";
          }

          // var actionElementToHide = this.userType == UserType.Teacher ? (buttonMeetingLeave as HTMLButtonElement) : (buttonMeetingEnd as HTMLButtonElement);
          // actionElementToHide.style.display = 'none';

          this.audioVideo.chooseVideoInputDevice(null);
          this.hideProgress("progress-join");
          this.displayButtonStates();
          this.switchToFlow("flow-meeting");
        } catch (error) {
          document.getElementById(
            "failed-join"
          ).innerText = `Meeting ID: ${this.meeting}`;
          document.getElementById(
            "failed-join-error"
          ).innerText = `Error: ${error.message}`;
        }
      });
    });

    const buttonMute = document.getElementById("button-microphone");
    buttonMute.addEventListener("mousedown", (_e) => {
      if (this.toggleButton("button-microphone")) {
        this.audioVideo.realtimeUnmuteLocalAudio();
      } else {
        this.audioVideo.realtimeMuteLocalAudio();
      }
    });

    const buttonVideo = document.getElementById("button-camera");
    buttonVideo.addEventListener("click", (_e) => {
      new AsyncScheduler().start(async () => {
        if (this.toggleButton("button-camera") && this.canStartLocalVideo) {
          try {
            let camera: string = videoInput.value;
            if (videoInput.value === "None") {
              camera = this.cameraDeviceIds.length
                ? this.cameraDeviceIds[0]
                : "None";
            }
            await this.openVideoInputFromSelection(camera, false);
            this.audioVideo.startLocalVideoTile();
          } catch (err) {
            this.log("no video input device selected");
          }
        } else {
          this.audioVideo.stopLocalVideoTile();
          this.hideTile(DemoTileOrganizer.MAX_TILES);
        }
      });
    });

    // const buttonPauseContentShare = document.getElementById(
    //   "button-pause-content-share"
    // );
    // buttonPauseContentShare.addEventListener("click", (_e) => {
    //   if (!this.isButtonOn("button-content-share")) {
    //     return;
    //   }
    //   new AsyncScheduler().start(async () => {
    //     if (this.toggleButton("button-pause-content-share")) {
    //       this.audioVideo.pauseContentShare();
    //     } else {
    //       this.audioVideo.unpauseContentShare();
    //     }
    //   });
    // });

    const buttonContentShare = document.getElementById("button-content-share");
    buttonContentShare.addEventListener("click", (_e) => {
      new AsyncScheduler().start(() => {
        if (this.userType == UserType.Teacher && this.screenSharedAllowed > 0) {
          alert("Screen share access is already provided to another attendee.");
        }
        else {
          if (!this.isButtonOn("button-content-share")) {
            this.contentShareStart();
          } else {
            this.contentShareStop();
          }
        }
      });
    });

    const buttonSpeaker = document.getElementById("button-speaker");
    buttonSpeaker.addEventListener("click", (_e) => {
      new AsyncScheduler().start(async () => {
        if (this.toggleButton("button-speaker")) {
          this.audioVideo.bindAudioElement(
            document.getElementById("meeting-audio") as HTMLAudioElement
          );
        } else {
          this.audioVideo.unbindAudioElement();
        }
      });
    });



    // const buttonReJoin = document.getElementById('button-rejoin');

    // buttonReJoin.addEventListener('click', _e => {
    //   this.init(true);
    // });

    const sendMessage = () => {
      new AsyncScheduler().start(() => {
        const textArea = document.getElementById(
          "send-message"
        ) as HTMLTextAreaElement;
        const textToSend = textArea.value.trim();
        if (!textToSend) {
          return;
        }
        textArea.value = "";
        this.audioVideo.realtimeSendDataMessage(
          DemoMeetingApp.DATA_MESSAGE_TOPIC,
          textToSend,
          DemoMeetingApp.DATA_MESSAGE_LIFETIME_MS
        );
        // echo the message to the handler
        this.dataMessageHandler(
          new DataMessage(
            Date.now(),
            DemoMeetingApp.DATA_MESSAGE_TOPIC,
            new TextEncoder().encode(textToSend),
            this.meetingSession.configuration.credentials.attendeeId,
            this.meetingSession.configuration.credentials.externalUserId
          )
        );
      });
    };

    const textAreaSendMessage = document.getElementById(
      "send-message"
    ) as HTMLTextAreaElement;
    textAreaSendMessage.addEventListener("keydown", (e) => {
      if (e.keyCode === 13) {
        if (e.shiftKey) {
          textAreaSendMessage.rows++;
        } else {
          e.preventDefault();
          sendMessage();
          textAreaSendMessage.rows = 1;
        }
      }
    });

    // Mute All
    const buttonMuteAll = document.getElementById("button-mute-all");
    buttonMuteAll.addEventListener("click", (_e) => {
      this.audioVideo.realtimeSendDataMessage(
        DemoMeetingApp.DATA_MESSAGE_TOPIC_MUTE_ALL,
        buttonMuteAll.title,
        DemoMeetingApp.DATA_MESSAGE_LIFETIME_MS
      );
      this.dataMuteAllHandler(
        new DataMessage(
          Date.now(),
          DemoMeetingApp.DATA_MESSAGE_TOPIC_MUTE_ALL,
          new TextEncoder().encode(buttonMuteAll.title),
          this.meetingSession.configuration.credentials.attendeeId,
          this.meetingSession.configuration.credentials.externalUserId
        )
      );
      if (buttonMuteAll.title == "Mute All Attendee") {
        buttonMuteAll.classList.remove("fa-microphone");
        buttonMuteAll.classList.add("fa-microphone-slash");
        buttonMuteAll.title = "UnMute All Attendee";
      }
      else {
        buttonMuteAll.classList.remove("fa-microphone-slash");
        buttonMuteAll.classList.add("fa-microphone");
        buttonMuteAll.title = "Mute All Attendee";
      }
    });

    const buttonMeetingEnd = document.getElementById("button-meeting-end");
    buttonMeetingEnd.addEventListener("click", (_e) => {
      const prompt = "Are you sure you want to end the session?";
      if (!window.confirm(prompt)) {
        return;
      }
      new AsyncScheduler().start(async () => {
        (buttonMeetingEnd as HTMLButtonElement).disabled = true;
        await this.endMeeting(this);
        this.leave();
        (buttonMeetingEnd as HTMLButtonElement).disabled = false;
      });
    });

    const buttonMeetingLeave = document.getElementById("button-meeting-leave");
    buttonMeetingLeave.addEventListener("click", (_e) => {
      const prompt = "Are you sure you want to leave the classroom?";
      if (!window.confirm(prompt)) {
        return;
      }
      new AsyncScheduler().start(async () => {
        (buttonMeetingLeave as HTMLButtonElement).disabled = true;
        this.leave();
        (buttonMeetingLeave as HTMLButtonElement).disabled = false;
        //this.showErrorBox("Thank you for using Osmos-ish.", "Information")
        // @ts-ignore
        window.location.href =
          DemoMeetingApp.REACT_APP_URL + "/Feedback/" + this.sessionId + "/y";
      });
    });

    document.addEventListener("click", (e: any) => {
      if (e.target && e.target.classList.contains('attendee-mic')) {
        var attendee = (e.target as HTMLSpanElement).getAttribute('data-attendee-id');
        if (attendee !== this.meetingSession.configuration.credentials.attendeeId && e.target.classList.contains("fa-microphone-slash")) {
          var buttonMuteAll = document.getElementById("button-mute-all");
          buttonMuteAll.classList.remove("fa-microphone-slash");
          buttonMuteAll.classList.add("fa-microphone");
          buttonMuteAll.title = "Mute All Attendee";
        }
        this.audioVideo.realtimeSendDataMessage(DemoMeetingApp.DATA_MESSAGE_TOPIC_REMOTE_ATTENDEE_MUTE_UNMUTE, attendee, DemoMeetingApp.DATA_MESSAGE_LIFETIME_MS);
        this.dataRemoteAttendeeMuteUnMuteHandler(
          new DataMessage(
            Date.now(),
            DemoMeetingApp.DATA_MESSAGE_TOPIC_REMOTE_ATTENDEE_MUTE_UNMUTE,
            new TextEncoder().encode(attendee),
            this.meetingSession.configuration.credentials.attendeeId,
            this.meetingSession.configuration.credentials.externalUserId
          )
        );
      }
      else if (e.target && e.target.classList.contains('attendee-share')) {
        if (!e.target.classList.contains('fa-stop-circle') && this.screenSharedAllowed > 0) {
          alert("At a single time, only 1 user is allowed to share screen. Please deactivate access of previous student, to provide access to selected user.");
        }
        else if (e.target.classList.contains('fa-share')) {
          this.screenSharedAllowed = 1;
          var attendee = (e.target as HTMLSpanElement).getAttribute('data-attendee-id');
          DemoMeetingApp.screenSharedAllowedAttendeeId = attendee;
          (e.target as HTMLSpanElement).classList.remove("fa-share");
          (e.target as HTMLSpanElement).classList.add("fa-stop-circle");
          (e.target as HTMLSpanElement).title = "Stop Attendee from Sharing their Screen";
          this.audioVideo.realtimeSendDataMessage(DemoMeetingApp.DATA_MESSAGE_TOPIC_ALLOWED_RESTRICT_SCREEN_SHARING, attendee, DemoMeetingApp.DATA_MESSAGE_LIFETIME_MS);
        }
        else {
          this.screenSharedAllowed = 0;
          DemoMeetingApp.screenSharedAllowedAttendeeId = null;
          var attendee = (e.target as HTMLSpanElement).getAttribute('data-attendee-id');
          (e.target as HTMLSpanElement).classList.remove("fa-stop-circle");
          (e.target as HTMLSpanElement).classList.add("fa-share");
          (e.target as HTMLSpanElement).title = "Allow Attendee to Share Their Screen";
          this.audioVideo.realtimeSendDataMessage(DemoMeetingApp.DATA_MESSAGE_TOPIC_ALLOWED_RESTRICT_SCREEN_SHARING, attendee, DemoMeetingApp.DATA_MESSAGE_LIFETIME_MS);
        }
      }
      else if (e.target && e.target.classList.contains('attendee-active-speaker')) {
        var x = document.getElementsByClassName("attendee-active-speaker");
        var i;
        for (i = 0; i < x.length; i++) {
          x[i].classList.add("fa-desktop");
        }
        (e.target as HTMLSpanElement).classList.remove("fa-desktop");
        var attendee = (e.target as HTMLSpanElement).getAttribute('data-attendee-id');
        this.audioVideo.realtimeSendDataMessage(DemoMeetingApp.DATA_MESSAGE_TOPIC_SET_ACTIVE_SPEAKER_ATTENDEE, attendee, DemoMeetingApp.DATA_MESSAGE_LIFETIME_MS);
        this.dataRemoteSetActiveSpeakerAttendeeHandler(
          new DataMessage(
            Date.now(),
            DemoMeetingApp.DATA_MESSAGE_TOPIC_SET_ACTIVE_SPEAKER_ATTENDEE,
            new TextEncoder().encode(attendee),
            this.meetingSession.configuration.credentials.attendeeId,
            this.meetingSession.configuration.credentials.externalUserId
          )
        );
      }
      else if (e.target && e.target.classList.contains('attendee-video')) {
        var attendee = (e.target as HTMLSpanElement).getAttribute('data-attendee-id');
        if (e.target.classList.contains('fa-video')) {
          (e.target as HTMLSpanElement).classList.remove("fa-video");
          (e.target as HTMLSpanElement).classList.add("fa-video-slash");
          DemoMeetingApp.restrictedVideoAttendeeIds.push(attendee.toString());
          (e.target as HTMLSpanElement).title = "Turn Attendee's Video On";
        }
        else {
          var filteredAry = DemoMeetingApp.restrictedVideoAttendeeIds.filter(function (e) { return e !== attendee.toString() });
          DemoMeetingApp.restrictedVideoAttendeeIds = filteredAry;
          (e.target as HTMLSpanElement).classList.remove("fa-video-slash");
          (e.target as HTMLSpanElement).classList.add("fa-video");
          (e.target as HTMLSpanElement).title = "Turn Attendee's Video Off";
        }

        this.audioVideo.realtimeSendDataMessage(DemoMeetingApp.DATA_MESSAGE_TOPIC_ALLOWED_RESTRICT_VIDEO, attendee, DemoMeetingApp.DATA_MESSAGE_LIFETIME_MS);
      }
    });
  }




  getSupportedMediaRegions(): Array<string> {
    const supportedMediaRegions: Array<string> = [];
    const mediaRegion = document.getElementById(
      "inputRegion"
    ) as HTMLSelectElement;
    for (var i = 0; i < mediaRegion.length; i++) {
      supportedMediaRegions.push(mediaRegion.value);
    }
    return supportedMediaRegions;
  }

  async getNearestMediaRegion(): Promise<string> {
    const nearestMediaRegionResponse = await fetch(
      `https://nearest-media-region.l.chime.aws`,
      {
        method: "GET",
      }
    );
    const nearestMediaRegionJSON = await nearestMediaRegionResponse.json();
    const nearestMediaRegion = nearestMediaRegionJSON.region;
    return nearestMediaRegion;
  }

  setMediaRegion(): void {
    new AsyncScheduler().start(
      async (): Promise<void> => {
        try {
          const nearestMediaRegion = await this.getNearestMediaRegion();
          if (nearestMediaRegion === "" || nearestMediaRegion === null) {
            throw new Error("Nearest Media Region cannot be null or empty");
          }
          const supportedMediaRegions: Array<string> = this.getSupportedMediaRegions();
          if (supportedMediaRegions.indexOf(nearestMediaRegion) === -1) {
            supportedMediaRegions.push(nearestMediaRegion);
            const mediaRegionElement = document.getElementById(
              "inputRegion"
            ) as HTMLSelectElement;
            const newMediaRegionOption = document.createElement("option");
            newMediaRegionOption.value = nearestMediaRegion;
            newMediaRegionOption.text =
              nearestMediaRegion + " (" + nearestMediaRegion + ")";
            mediaRegionElement.add(newMediaRegionOption, null);
          }
          (document.getElementById(
            "inputRegion"
          ) as HTMLInputElement).value = nearestMediaRegion;
        } catch (error) {
          this.log("Default media region selected: " + error.message);
        }
      }
    );
  }

  toggleButton(button: string, state?: "on" | "off"): boolean {

    if (state === "on") {
      this.buttonStates[button] = true;
    } else if (state === "off") {
      this.buttonStates[button] = false;
    } else {
      this.buttonStates[button] = !this.buttonStates[button];
    }
    if (button === "button-microphone") {
      document.getElementById(button).innerHTML = this.buttonStates[button]
        ? '<i class="fa fa-microphone" aria-hidden="true"></i>'
        : '<i class="fa fa-microphone-slash" aria-hidden="true"></i>';
    } else if (button === "button-camera") {
      document.getElementById(button).innerHTML = this.buttonStates[button]
        ? '<i class="fas fa-video" aria-hidden="true"></i>'
        : '<i class="fas fa-video-slash" aria-hidden="true"></i>';
    } else if (button === "button-speaker") {
      document.getElementById(button).innerHTML = this.buttonStates[button]
        ? '<i class="fa fa-volume-up" aria-hidden="true"></i>'
        : '<i class="fa fa-volume-off" aria-hidden="true"></i>';
    }
    else if (button === "button-content-share") {
      var iconContentShare;
      var titleContentShare;

      if (this.buttonStates[button]) {
        iconContentShare = '<i class="fa fa-stop" aria-hidden="true"></i>';
        titleContentShare = "Sharing";
      }
      else {
        iconContentShare = '<i class="fa fa-share" aria-hidden="true"></i>';
        titleContentShare = "Share screen";
      }
      document.getElementById(button).innerHTML = iconContentShare;
      document.getElementById(button).title = titleContentShare;
    }
    // else if(button === "button-pause-content-share")
    // {
    //   document.getElementById(button).innerHTML = this.buttonStates[button]
    //     ? '<i class="fa fa-play" aria-hidden="true"></i> UnPause Content Share'
    //     : '<i class="fa fa-pause" aria-hidden="true"></i> Pause Content Share';
    // }
    this.displayButtonStates();
    return this.buttonStates[button];
  }

  isButtonOn(button: string) {
    return this.buttonStates[button];
  }

  displayButtonStates(): void {
    for (const button in this.buttonStates) {
      const element = document.getElementById(button);
      const drop = document.getElementById(`${button}-drop`);
      const on = this.buttonStates[button];
      if (button != "button-view-title-all") {
        if (button != "button-content-share") {
          if (button != "button-camera") {
            element.classList.add(on ? "btn-success" : "btn-outline-secondary");
            element.classList.remove(on ? "btn-outline-secondary" : "btn-success");
            if (element.firstElementChild) {
              (element.firstElementChild as SVGElement).classList.add(
                on ? "svg-active" : "svg-inactive"
              );
              (element.firstElementChild as SVGElement).classList.remove(
                on ? "svg-inactive" : "svg-active"
              );
            }
            if (drop) {
              drop.classList.add(on ? "btn-success" : "btn-outline-secondary");
              drop.classList.remove(on ? "btn-outline-secondary" : "btn-success");
            }
          }
        }
      }
      element.blur();
    }
  }

  show(id: string): void {
    (document.getElementById(id) as HTMLDivElement).style.visibility = "block";
  }

  hide(id: string): void {
    (document.getElementById(id) as HTMLDivElement).style.visibility = "none";
  }

  showProgress(id: string): void {
    (document.getElementById(id) as HTMLDivElement).style.visibility =
      "visible";
  }

  hideProgress(id: string): void {
    (document.getElementById(id) as HTMLDivElement).style.visibility = "hidden";
  }

  switchToFlow(flow: string): void {
    this.analyserNodeCallback = () => { };
    Array.from(document.getElementsByClassName("flow")).map(
      (e) => ((e as HTMLDivElement).style.display = "none")
    );
    (document.getElementById(flow) as HTMLDivElement).style.display = "block";
    if (flow === "flow-devices") {
      this.startAudioPreview();
    }
  }

  audioInputsChanged(_freshAudioInputDeviceList: MediaDeviceInfo[]): void {
    this.populateAudioInputList();
  }

  videoInputsChanged(_freshVideoInputDeviceList: MediaDeviceInfo[]): void {
    this.populateVideoInputList();
  }

  audioOutputsChanged(_freshAudioOutputDeviceList: MediaDeviceInfo[]): void {
    this.populateAudioOutputList();
  }

  estimatedDownlinkBandwidthLessThanRequired(
    estimatedDownlinkBandwidthKbps: number,
    requiredVideoDownlinkBandwidthKbps: number
  ): void {
    this.log(
      `Estimated downlink bandwidth is ${estimatedDownlinkBandwidthKbps} is less than required bandwidth for video ${requiredVideoDownlinkBandwidthKbps}`
    );
  }

  videoNotReceivingEnoughData(
    videoReceivingReports: ClientVideoStreamReceivingReport[]
  ): void {
    this.log(
      `One or more video streams are not receiving expected amounts of data ${JSON.stringify(
        videoReceivingReports
      )}`
    );
  }

  // metricsDidReceive(clientMetricReport: ClientMetricReport): void {
  //   const metricReport = clientMetricReport.getObservableMetrics();
  //   if (typeof metricReport.availableSendBandwidth === 'number' && !isNaN(metricReport.availableSendBandwidth)) {
  //     (document.getElementById('video-uplink-bandwidth') as HTMLSpanElement).innerText =
  //       'Available Uplink Bandwidth: ' + String(metricReport.availableSendBandwidth / 1000) + ' Kbps';
  //   } else if (typeof metricReport.availableOutgoingBitrate === 'number' && !isNaN(metricReport.availableOutgoingBitrate)) {
  //     (document.getElementById('video-uplink-bandwidth') as HTMLSpanElement).innerText =
  //       'Available Uplink Bandwidth: ' + String(metricReport.availableOutgoingBitrate / 1000) + ' Kbps';
  //   } else {
  //     (document.getElementById('video-uplink-bandwidth') as HTMLSpanElement).innerText =
  //       'Available Uplink Bandwidth: Unknown';
  //   }

  //   if (typeof metricReport.availableReceiveBandwidth === 'number' && !isNaN(metricReport.availableReceiveBandwidth)) {
  //     (document.getElementById('video-downlink-bandwidth') as HTMLSpanElement).innerText =
  //       'Available Downlink Bandwidth: ' + String(metricReport.availableReceiveBandwidth / 1000) + ' Kbps';
  //   } else if (typeof metricReport.availableIncomingBitrate === 'number' && !isNaN(metricReport.availableIncomingBitrate)) {
  //     (document.getElementById('video-downlink-bandwidth') as HTMLSpanElement).innerText =
  //       'Available Downlink Bandwidth: ' + String(metricReport.availableIncomingBitrate / 1000) + ' Kbps';
  //   } else {
  //     (document.getElementById('video-downlink-bandwidth') as HTMLSpanElement).innerText =
  //       'Available Downlink Bandwidth: Unknown';
  //   }
  // }

  async initializeMeetingSession(
    configuration: MeetingSessionConfiguration
  ): Promise<void> {

    let logger: Logger;
    const logLevel = LogLevel.INFO;
    const consoleLogger = (logger = new ConsoleLogger("SDK", logLevel));
    if (
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1" ||
      location.hostname === "ditstekdemo.com"
    ) {
      logger = consoleLogger;
    } else {
      logger = new MultiLogger(
        consoleLogger,
        new MeetingSessionPOSTLogger(
          "SDK",
          configuration,
          DemoMeetingApp.LOGGER_BATCH_SIZE,
          DemoMeetingApp.LOGGER_INTERVAL_MS,
          `${DemoMeetingApp.BASE_URL}logs`,
          logLevel
        )
      );
    }
    const deviceController = new DefaultDeviceController(logger);
    configuration.enableWebAudio = this.enableWebAudio;
    configuration.enableUnifiedPlanForChromiumBasedBrowsers = this.enableUnifiedPlanForChromiumBasedBrowsers;
    configuration.attendeePresenceTimeoutMs = 5000;
    configuration.enableSimulcastForUnifiedPlanChromiumBasedBrowsers = this.enableSimulcast;
    this.meetingSession = new DefaultMeetingSession(
      configuration,
      logger,
      deviceController
    );
    this.audioVideo = this.meetingSession.audioVideo;

    this.audioVideo.addDeviceChangeObserver(this);
    this.setupDeviceLabelTrigger();
    await this.populateAllDeviceLists();
    this.setupMuteHandler();
    this.setupCanUnmuteHandler();
    this.setupSubscribeToAttendeeIdPresenceHandler();
    this.setupDataMessage();
    this.audioVideo.addObserver(this);
    this.audioVideo.addContentShareObserver(this);
    this.initContentShareDropDownItems();
  }

  setClickHandler(elementId: string, f: () => void): void {
    document.getElementById(elementId).addEventListener("click", () => {
      f();
    });
  }

  async join(): Promise<void> {
    window.addEventListener(
      "unhandledrejection",
      (event: PromiseRejectionEvent) => {
        this.log(event.reason);
      }
    );
    await this.openAudioInputFromSelection();
    await this.openAudioOutputFromSelection();
    this.audioVideo.start();
  }

  leave(): void {
    this.audioVideo.stop();
    this.roster = {};
  }

  setupMuteHandler(): void {
    const handler = (isMuted: boolean): void => {
      this.log(`muted = ${isMuted}`);
    };
    this.audioVideo.realtimeSubscribeToMuteAndUnmuteLocalAudio(handler);
    const isMuted = this.audioVideo.realtimeIsLocalAudioMuted();
    handler(isMuted);
  }

  setupCanUnmuteHandler(): void {
    const handler = (canUnmute: boolean): void => {
      this.log(`canUnmute = ${canUnmute}`);
    };
    this.audioVideo.realtimeSubscribeToSetCanUnmuteLocalAudio(handler);
    handler(this.audioVideo.realtimeCanUnmuteLocalAudio());
  }

  updateRoster(): void {
    const roster = document.getElementById("roster");
    const newRosterCount = Object.keys(this.roster).length;
    while (roster.getElementsByTagName("li").length < newRosterCount) {
      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-center";
      li.appendChild(document.createElement("span"));
      li.appendChild(document.createElement("span"));
      if (this.userType == UserType.Teacher) {
        var divChild = li.appendChild(document.createElement("div"));
        divChild.classList.add("icons-div");
        divChild.appendChild(document.createElement("span"));
        divChild.appendChild(document.createElement("span"));
        divChild.appendChild(document.createElement("span"));
        divChild.appendChild(document.createElement("span"));
      }
      roster.appendChild(li);
    }
    while (roster.getElementsByTagName("li").length > newRosterCount) {
      roster.removeChild(roster.getElementsByTagName("li")[0]);
    }
    const entries = roster.getElementsByTagName("li");
    let i = 0;
    for (const attendeeId in this.roster) {

      const spanName = entries[i].getElementsByTagName("span")[0];
      const spanStatus = entries[i].getElementsByTagName("span")[1];
      let statusClass = "badge badge-pill ";
      let statusText = "\xa0"; // &nbsp
      if (this.roster[attendeeId].signalStrength < 1) {
        statusClass += "badge-warning";
      } else if (this.roster[attendeeId].signalStrength === 0) {
        statusClass += "badge-danger";
      } else if (this.roster[attendeeId].muted) {
        statusText = "MUTED";
        statusClass += "badge-secondary";
      } else if (this.roster[attendeeId].active) {
        statusText = "SPEAKING";
        statusClass += "badge-success";
      } else if (this.roster[attendeeId].volume > 0) {
        statusClass += "badge-success";
      }
      // document.getElementById("participantsCount").innerHTML =  roster.getElementsByTagName("li").length?.toString();
      this.updateProperty("participantsCount", "innerText", roster.getElementsByTagName("li").length?.toString());
      this.updateProperty(spanName, "innerText", this.roster[attendeeId].name);

      this.updateProperty(spanStatus, "innerText", statusText);
      this.updateProperty(spanStatus, "className", statusClass);

      if (this.userType == UserType.Teacher && this.roster[attendeeId].name.indexOf("??Content??") === -1) {
        spanName.classList.add("attendee-name");
        const spanAttendeeId = entries[i].getElementsByTagName("span")[2];
        this.updateProperty(
          spanAttendeeId,
          "innerHTML",
          statusText === "MUTED"
            ? "<i class='fa fa-microphone-slash attendee-mic' data-attendee-id='" + attendeeId + "'  title='Unmute'></i>"
            : "<i class='fa fa-microphone attendee-mic' data-attendee-id='" + attendeeId + "' title='Mute'></i>"
        );

        if (this.meetingSession.configuration.credentials.attendeeId !== attendeeId) {
          const spanVideoAttendeeId = entries[i].getElementsByTagName("span")[3];
          var iconToShowVideo = DemoMeetingApp.restrictedVideoAttendeeIds.indexOf(attendeeId.toString()) === -1 ? "fa-video" : "fa-video-slash";
          var titleToShowVideo = DemoMeetingApp.restrictedVideoAttendeeIds.indexOf(attendeeId.toString()) === -1 ? "Turn Attendee's Video Off" : "Turn Attendee's Video On";
          this.updateProperty(
            spanVideoAttendeeId,
            "innerHTML",
            "<i class='fas " + iconToShowVideo + " attendee-video' data-attendee-id='" + attendeeId + "' ></i>"
          );
          (spanVideoAttendeeId.firstChild as HTMLElement).title = titleToShowVideo;
          var iconToShow = DemoMeetingApp.screenSharedAllowedAttendeeId === attendeeId ? "fa-stop-circle" : "fa-share";
          var titleToShow = DemoMeetingApp.screenSharedAllowedAttendeeId === attendeeId ? "Stop Attendee from Sharing their Screen" : "Allow Attendee to Share Their Screen";
          const spanScreeShareAttendeeId = entries[i].getElementsByTagName("span")[4];
          this.updateProperty(
            spanScreeShareAttendeeId,
            "innerHTML",
            "<i class='fa attendee-share " + iconToShow + "' title='" + titleToShow + "' aria-hidden='true' data-attendee-id='" + attendeeId + "'></i>"
          );
        }
        else {
          const spanVideoAttendeeId = entries[i].getElementsByTagName("span")[3];
          this.updateProperty(
            spanVideoAttendeeId,
            "innerHTML",
            ""
          );
          const spanScreeShareAttendeeId = entries[i].getElementsByTagName("span")[4];
          this.updateProperty(
            spanScreeShareAttendeeId,
            "innerHTML",
            ""
          );
        }

        if (DemoMeetingApp.activeSpeakerAttendeeId === attendeeId) {
          const spanActiveAttendee = entries[i].getElementsByTagName("span")[5];
          this.updateProperty(
            spanActiveAttendee,
            "innerHTML",
            "<i class='fa attendee-active-speaker' title='Move Attendee to Main Video Screen' aria-hidden='true' data-attendee-id='" + attendeeId + "'></i>"
          );
          this.dataRemoteSetActiveSpeakerAttendeeHandler(
            new DataMessage(
              Date.now(),
              DemoMeetingApp.DATA_MESSAGE_TOPIC_SET_ACTIVE_SPEAKER_ATTENDEE,
              new TextEncoder().encode(DemoMeetingApp.activeSpeakerAttendeeId),
              this.meetingSession.configuration.credentials.attendeeId,
              this.meetingSession.configuration.credentials.externalUserId
            )
          );
          this.audioVideo.realtimeSendDataMessage(DemoMeetingApp.DATA_MESSAGE_TOPIC_SET_ACTIVE_SPEAKER_ATTENDEE, DemoMeetingApp.activeSpeakerAttendeeId, DemoMeetingApp.DATA_MESSAGE_LIFETIME_MS);
          DemoMeetingApp.newActiveSpeakerAttendeeId = null;
        }
        else {
          const spanActiveAttendee = entries[i].getElementsByTagName("span")[5];
          this.updateProperty(
            spanActiveAttendee,
            "innerHTML",
            "<i class='fa fa-desktop attendee-active-speaker' title='Move Attendee to Main Video Screen' aria-hidden='true' data-attendee-id='" + attendeeId + "'></i>"
          );
        }
      }
      i++;
    }
  }

  updateProperty(obj: any, key: string, value: string) {
    if (value !== undefined && obj[key] !== value) {
      obj[key] = value;
    }
  }

  setupSubscribeToAttendeeIdPresenceHandler(): void {
    const handler = (
      attendeeId: string,
      present: boolean,
      externalUserId: string,
      dropped: boolean
    ): void => {
      this.log(`${attendeeId} present = ${present} (${externalUserId})`);
      const isContentAttendee = new DefaultModality(attendeeId).hasModality(
        DefaultModality.MODALITY_CONTENT
      );
      const isSelfAttendee =
        new DefaultModality(attendeeId).base() ===
        this.meetingSession.configuration.credentials.attendeeId;
      if (isSelfAttendee && present) {
        DemoMeetingApp.autoStop = true;
        this.audioVideo.realtimeSendDataMessage(
          DemoMeetingApp.DATA_MESSAGE_TOPIC_AUTO_LOGOUT,
          '{"UserId":"' + this.userId.toString() + '","NewAttendeeid":"' + this.meetingSession.configuration.credentials.attendeeId.toString() + '"}',
          DemoMeetingApp.DATA_MESSAGE_LIFETIME_MS
        );
      }
      if (!present) {
        if (this.userType == UserType.Teacher) {
          if (DemoMeetingApp.screenSharedAllowedAttendeeId == attendeeId) {
            this.screenSharedAllowed = 0;
            DemoMeetingApp.screenSharedAllowedAttendeeId = null;
          }
          if (DemoMeetingApp.activeSpeakerAttendeeId == attendeeId) {
            DemoMeetingApp.activeSpeakerAttendeeId = this.meetingSession.configuration.credentials.attendeeId;
          }
        }

        delete this.roster[attendeeId];
        this.updateRoster();
        this.log(`${attendeeId} dropped = ${dropped} (${externalUserId})`);
        return;
      }
      //If someone else share content, stop the current content share
      if (
        !this.allowMaxContentShare() &&
        !isSelfAttendee &&
        isContentAttendee &&
        this.isButtonOn("button-content-share")
      ) {
        this.contentShareStop();
      }
      if (!this.roster[attendeeId]) {
        this.roster[attendeeId] = {
          name:
            externalUserId.split("#").slice(-1)[0] +
            (isContentAttendee ? " ??Content??" : ""),
        };
      }
      this.audioVideo.realtimeSubscribeToVolumeIndicator(
        attendeeId,
        async (
          attendeeId: string,
          volume: number | null,
          muted: boolean | null,
          signalStrength: number | null
        ) => {
          if (!this.roster[attendeeId]) {
            return;
          }
          if (volume !== null) {
            this.roster[attendeeId].volume = Math.round(volume * 100);
          }
          if (muted !== null) {
            this.roster[attendeeId].muted = muted;
            this.updateRoster();
          }
          if (signalStrength !== null) {
            this.roster[attendeeId].signalStrength = Math.round(
              signalStrength * 100
            );
          }
          //this.updateRoster();
        }
      );
    };
    this.audioVideo.realtimeSubscribeToAttendeeIdPresence(handler);
    const activeSpeakerHandler = (attendeeIds: string[]): void => {
      for (const attendeeId in this.roster) {
        this.roster[attendeeId].active = false;
      }
      for (const attendeeId of attendeeIds) {
        if (this.roster[attendeeId]) {
          this.roster[attendeeId].active = true;
          break; // only show the most active speaker
        }
      }
      this.layoutVideoTiles();
    };
    this.audioVideo.subscribeToActiveSpeakerDetector(
      new DefaultActiveSpeakerPolicy(),
      activeSpeakerHandler,
      (scores: { [attendeeId: string]: number }) => {
        for (const attendeeId in scores) {
          if (this.roster[attendeeId]) {
            this.roster[attendeeId].score = scores[attendeeId];
          }
        }
        //this.updateRoster();
      },
      this.showActiveSpeakerScores ? 100 : 0
    );
  }

  dataMessageHandler(dataMessage: DataMessage): void {
    if (!dataMessage.throttled) {
      const isSelf =
        dataMessage.senderAttendeeId ===
        this.meetingSession.configuration.credentials.attendeeId;
      if (dataMessage.timestampMs <= this.lastReceivedMessageTimestamp) {
        return;
      }
      this.lastReceivedMessageTimestamp = dataMessage.timestampMs;
      const messageDiv = document.getElementById(
        "receive-message"
      ) as HTMLDivElement;
      const messageNameSpan = document.createElement("div") as HTMLDivElement;
      messageNameSpan.classList.add("message-bubble-sender");
      messageNameSpan.innerText = dataMessage.senderExternalUserId
        .split("#")
        .slice(-1)[0];
      const messageTextSpan = document.createElement("div") as HTMLDivElement;
      messageTextSpan.classList.add(
        isSelf ? "message-bubble-self" : "message-bubble-other"
      );
      messageTextSpan.innerHTML = this.markdown
        .render(dataMessage.text())
        .replace(/[<]a /g, '<a target="_blank" ');
      const appendClass = (element: HTMLElement, className: string) => {
        for (let i = 0; i < element.children.length; i++) {
          const child = element.children[i] as HTMLElement;
          child.classList.add(className);
          appendClass(child, className);
        }
      };
      appendClass(messageTextSpan, "markdown");
      if (this.lastMessageSender !== dataMessage.senderAttendeeId) {
        messageDiv.appendChild(messageNameSpan);
      }
      this.lastMessageSender = dataMessage.senderAttendeeId;
      messageDiv.appendChild(messageTextSpan);
      messageDiv.scrollTop = messageDiv.scrollHeight;
    } else {
      this.log("Message is throttled. Please resend");
    }
  }

  dataMuteAllHandler(dataMessage: DataMessage): void {
    if (!dataMessage.throttled) {
      const isSelf =
        dataMessage.senderAttendeeId ===
        this.meetingSession.configuration.credentials.attendeeId;
      if (isSelf) {
        return;
      } else {
        if (dataMessage.text() === "UnMute All Attendee") {
          this.audioVideo.realtimeUnmuteLocalAudio();
          this.buttonStates["button-microphone"] = true;
          this.displayButtonStates();
          (document.getElementById("button-microphone-drop") as HTMLButtonElement).disabled = false;
          (document.getElementById("button-microphone") as HTMLButtonElement).disabled = false;

          (document.getElementById("button-microphone") as HTMLButtonElement).title = "Toggle microphone";
        } else {
          this.audioVideo.realtimeMuteLocalAudio();
          this.buttonStates["button-microphone"] = false;
          this.displayButtonStates();
          (document.getElementById("button-microphone-drop") as HTMLButtonElement).disabled = true;
          (document.getElementById("button-microphone") as HTMLButtonElement).disabled = true;

          (document.getElementById("button-microphone") as HTMLButtonElement).title = "Microphone disabled";
        }
      }
    } else {
      this.log("Message is throttled. Please resend");
    }
  }
  dataRemoteAttendeeMuteUnMuteHandler(dataMessage: DataMessage) {
    if (!dataMessage.throttled) {
      const isSelf =
        dataMessage.text() ===
        this.meetingSession.configuration.credentials.attendeeId;
      if (isSelf) {
        if (this.toggleButton("button-microphone")) {
          if (dataMessage.senderAttendeeId !== this.meetingSession.configuration.credentials.attendeeId) {
            (document.getElementById("button-microphone-drop") as HTMLButtonElement).disabled = false;
            (document.getElementById("button-microphone") as HTMLButtonElement).disabled = false;
            (document.getElementById("button-microphone") as HTMLButtonElement).title = "Toggle microphone";
          }
          this.audioVideo.realtimeUnmuteLocalAudio();
        } else {
          this.audioVideo.realtimeMuteLocalAudio();
          if (dataMessage.senderAttendeeId !== this.meetingSession.configuration.credentials.attendeeId) {
            (document.getElementById("button-microphone-drop") as HTMLButtonElement).disabled = true;
            (document.getElementById("button-microphone") as HTMLButtonElement).disabled = true;
            (document.getElementById("button-microphone") as HTMLButtonElement).title = "Microphone disabled";
          }
        }

      }
    } else {
      this.log("Message is throttled. Please resend");
    }
  }

  dataRemoteAttendeeAllowedRestrictScreenSharingHandler(dataMessage: DataMessage) {
    if (!dataMessage.throttled) {
      const isSelf =
        dataMessage.text() ===
        this.meetingSession.configuration.credentials.attendeeId;
      if (isSelf) {
        var buttonContentShare = (document.getElementById("button-content-share") as HTMLButtonElement);
        if (buttonContentShare.disabled) {
          buttonContentShare.disabled = false;
          alert("Osmos-ish:\nScreen share access has been provided to you by the host.");
          buttonContentShare.title = "Share screen";

        }
        else {
          if (this.isButtonOn("button-content-share")) {
            this.contentShareStop();
          }
          alert("Osmos-ish:\nScreen share access has been removed by the host.");
          buttonContentShare.disabled = true;
          buttonContentShare.title = "Share screen disabled";
        }
      }
    } else {
      this.log("Message is throttled. Please resend");
    }
  }
  dataAutoLogoutHandler(dataMessage: DataMessage): void {

    if (!dataMessage.throttled) {
      var data = JSON.parse(dataMessage.text());
      if (DemoMeetingApp.autoStop && data.UserId === this.userId && data.NewAttendeeid !== this.meetingSession.configuration.credentials.attendeeId) {
        this.leave();
        var redirectUrl = this.userType == UserType.Teacher ? '/TutorDashboard' : '/StudentDashboard';
        window.location.href = DemoMeetingApp.REACT_APP_URL + redirectUrl;
      }
      else {
        return;
      }
    } else {
      this.log("Message is throttled. Please resend");
    }
  }

  dataRemoteSetActiveSpeakerAttendeeHandler(dataMessage: DataMessage): void {
    if (!dataMessage.throttled) {
      if (DemoMeetingApp.newActiveSpeakerAttendeeId) {
        DemoMeetingApp.activeSpeakerAttendeeId = DemoMeetingApp.newActiveSpeakerAttendeeId;
      }
      else {
        DemoMeetingApp.activeSpeakerAttendeeId = dataMessage.text();
      }
      this.layoutVideoTiles();
    } else {
      this.log("Message is throttled. Please resend");
    }
  }
  dataRemoteAllowedRestrictVideoHandler(dataMessage: DataMessage) {
    if (!dataMessage.throttled) {
      const isSelf = dataMessage.text() === this.meetingSession.configuration.credentials.attendeeId;
      if (isSelf) {
        var buttonCamera = (document.getElementById("button-camera") as HTMLButtonElement);
        var buttonCameraDrop = (document.getElementById("button-camera-drop") as HTMLButtonElement);
        var buttonMenuCamera = (document.getElementById("dropdown-menu-camera") as HTMLButtonElement);

        if (buttonCamera.disabled) {
          buttonCameraDrop.disabled = false;
          buttonCamera.disabled = false;
          buttonCamera.classList.remove("btn-outline-secondary");
          buttonCamera.classList.add("btn-success");

          buttonCameraDrop.classList.remove("btn-outline-secondary");
          buttonCameraDrop.classList.add("btn-success");
          buttonCamera.title = "Toggle camera";
          alert("Osmos-ish:\nThe Host has enabled your webcam.");
        } else {
          buttonCameraDrop.disabled = true;
          buttonCamera.disabled = true;
          buttonCamera.disabled = true;

          buttonCamera.classList.remove("btn-success");
          buttonCamera.classList.add("btn-outline-secondary");

          buttonCameraDrop.classList.remove("btn-success");
          buttonCameraDrop.classList.add("btn-outline-secondary");
          buttonCamera.title = "Webcam disabled";
          this.audioVideo.stopLocalVideoTile();
          this.hideTile(DemoTileOrganizer.MAX_TILES);
          alert("Osmos-ish:\nThe Host has disabled your webcam.");
        }
      }
      this.toggleButton("button-camera", "off");
    } else {
      this.log("Message is throttled. Please resend");
    }
  }

  setupDataMessage(): void {
    this.audioVideo.realtimeSubscribeToReceiveDataMessage(
      DemoMeetingApp.DATA_MESSAGE_TOPIC,
      (dataMessage: DataMessage) => {
        this.dataMessageHandler(dataMessage);
      }
    );
    this.audioVideo.realtimeSubscribeToReceiveDataMessage(
      DemoMeetingApp.DATA_MESSAGE_TOPIC_MUTE_ALL,
      (dataMessage: DataMessage) => {
        this.dataMuteAllHandler(dataMessage);
      }
    );
    this.audioVideo.realtimeSubscribeToReceiveDataMessage(
      DemoMeetingApp.DATA_MESSAGE_TOPIC_REMOTE_ATTENDEE_MUTE_UNMUTE,
      (dataMessage: DataMessage) => {
        this.dataRemoteAttendeeMuteUnMuteHandler(dataMessage);
      }
    );
    this.audioVideo.realtimeSubscribeToReceiveDataMessage(
      DemoMeetingApp.DATA_MESSAGE_TOPIC_AUTO_LOGOUT,
      (dataMessage: DataMessage) => {
        this.dataAutoLogoutHandler(dataMessage);
      }
    );
    this.audioVideo.realtimeSubscribeToReceiveDataMessage(
      DemoMeetingApp.DATA_MESSAGE_TOPIC_ALLOWED_RESTRICT_SCREEN_SHARING,
      (dataMessage: DataMessage) => {
        this.dataRemoteAttendeeAllowedRestrictScreenSharingHandler(dataMessage);
      }
    );
    this.audioVideo.realtimeSubscribeToReceiveDataMessage(
      DemoMeetingApp.DATA_MESSAGE_TOPIC_SET_ACTIVE_SPEAKER_ATTENDEE,
      (dataMessage: DataMessage) => {
        this.dataRemoteSetActiveSpeakerAttendeeHandler(dataMessage);
      }
    );
    this.audioVideo.realtimeSubscribeToReceiveDataMessage(
      DemoMeetingApp.DATA_MESSAGE_TOPIC_ALLOWED_RESTRICT_VIDEO,
      (dataMessage: DataMessage) => {
        this.dataRemoteAllowedRestrictVideoHandler(dataMessage);
      }
    );


  }

  // eslint-disable-next-line
  async joinMeeting(): Promise<any> {
    var endpoint =
      this.userType == UserType.Teacher ? "CREATEMEETING" : "JOINMEETING";
    var request = { SessionId: this.sessionId };
    try {
      const response: any = await apiService.postAltAsync(
        DemoMeetingApp.API_URL,
        endpoint,
        request
      );
      if(response.Success){
        const data = response.Data;

        this.meeting = data?.ExternalMeetingId;
        this.region = data?.Region;
        this.name = data?.UserName;
        this.userId = data?.UserId;
        this.oldAttendeeId = data?.OldAttendeeId;
        this.sessionTitle = data?.SessionTitle;
        if (this.userType == UserType.Teacher) {
          DemoMeetingApp.activeSpeakerAttendeeId = data?.Attendee.AttendeeId;
          DemoMeetingApp.newActiveSpeakerAttendeeId = data?.Attendee.AttendeeId;
        }
        return data;
      }else{
        return response;
      }
      
    } catch (error) {
      if (error === undefined) {
        error = "Please check your internet connection and Sign in again !";
      }
      throw new Error(error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async endMeeting(meetingObject): Promise<any> {
    try {
      if (meetingObject.userType == UserType.Teacher) {
        var request = { SessionId: meetingObject.sessionId };
        const response: any = await apiService.postAltAsync(
          DemoMeetingApp.API_URL,
          "ENDMEETING",
          request
        );
        window.location.href =
          DemoMeetingApp.REACT_APP_URL +
          "/Feedback/" +
          meetingObject.sessionId +
          "/n";
      }
    } catch (error) {
      if (error === undefined) {
        error = "Please check your internet connection and Sign in again for completing the session !";
      }
      meetingObject.showErrorBox(error, "");
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getAttendee(attendeeId: string): Promise<any> {
    const response = await fetch(
      `${DemoMeetingApp.BASE_URL}attendee?title=${encodeURIComponent(
        this.meeting
      )}&attendee=${encodeURIComponent(attendeeId)}`
    );
    const json = await response.json();
    if (json.error) {
      throw new Error(`Server error: ${json.error}`);
    }
    return json;
  }

  setupDeviceLabelTrigger(): void {
    // Note that device labels are privileged since they add to the
    // fingerprinting surface area of the browser session. In Chrome private
    // tabs and in all Firefox tabs, the labels can only be read once a
    // MediaStream is active. How to deal with this restriction depends on the
    // desired UX. The device controller includes an injectable device label
    // trigger which allows you to perform custom behavior in case there are no
    // labels, such as creating a temporary audio/video stream to unlock the    // device names, which is the default behavior. Here we override the
    // trigger to also show an alert to let the user know that we are asking for
    // mic/camera permission.
    //
    // Also note that Firefox has its own device picker, which may be useful
    // for the first device selection. Subsequent device selections could use
    // a custom UX with a specific device id.
    this.audioVideo.setDeviceLabelTrigger(
      async (): Promise<MediaStream> => {
        if (this.isRecorder()) {
          throw new Error("recorder does not need device labels");
        }
        this.switchToFlow("flow-need-permission");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        this.switchToFlow("flow-devices");
        return stream;
      }
    );
  }

  populateDeviceList(
    elementId: string,
    genericName: string,
    devices: MediaDeviceInfo[],
    additionalOptions: string[]
  ): void {
    const list = document.getElementById(elementId) as HTMLSelectElement;
    while (list.firstElementChild) {
      list.removeChild(list.firstElementChild);
    }
    for (let i = 0; i < devices.length; i++) {
      const option = document.createElement("option");
      list.appendChild(option);
      option.text = devices[i].label || `${genericName} ${i + 1}`;
      option.value = devices[i].deviceId;
    }
    if (additionalOptions.length > 0) {
      const separator = document.createElement("option");
      separator.disabled = true;
      separator.text = "??????????????????????????????";
      list.appendChild(separator);
      for (const additionalOption of additionalOptions) {
        const option = document.createElement("option");
        list.appendChild(option);
        option.text = additionalOption;
        option.value = additionalOption;
      }
    }
    if (!list.firstElementChild) {
      const option = document.createElement("option");
      option.text = "Device selection unavailable";
      list.appendChild(option);
    }
  }

  populateInMeetingDeviceList(
    elementId: string,
    genericName: string,
    devices: MediaDeviceInfo[],
    additionalOptions: string[],
    callback: (name: string) => void
  ): void {
    const menu = document.getElementById(elementId) as HTMLDivElement;
    while (menu.firstElementChild) {
      menu.removeChild(menu.firstElementChild);
    }
    for (let i = 0; i < devices.length; i++) {
      this.createDropdownMenuItem(
        menu,
        devices[i].label || `${genericName} ${i + 1}`,
        () => {
          callback(devices[i].deviceId);
        }
      );
    }
    if (additionalOptions.length > 0) {
      this.createDropdownMenuItem(menu, "??????????????????????????????", () => { }).classList.add(
        "text-center"
      );
      for (const additionalOption of additionalOptions) {
        this.createDropdownMenuItem(
          menu,
          additionalOption,
          () => {
            callback(additionalOption);
          },
          `${elementId}-${additionalOption.replace(/\s/g, "-")}`
        );
      }
    }
    if (!menu.firstElementChild) {
      this.createDropdownMenuItem(
        menu,
        "Device selection unavailable",
        () => { }
      );
    }
  }

  createDropdownMenuItem(
    menu: HTMLDivElement,
    title: string,
    clickHandler: () => void,
    id?: string
  ): HTMLButtonElement {
    const button = document.createElement("button") as HTMLButtonElement;
    menu.appendChild(button);
    button.innerText = title;
    button.classList.add("dropdown-item");
    this.updateProperty(button, "id", id);
    button.addEventListener("click", () => {
      clickHandler();
    });
    return button;
  }

  async populateAllDeviceLists(): Promise<void> {
    await this.populateAudioInputList();
    await this.populateVideoInputList();
    await this.populateAudioOutputList();
  }

  async populateAudioInputList(): Promise<void> {
    const genericName = "Microphone";
    const additionalDevices = ["None", "440 Hz"];
    this.populateDeviceList(
      "audio-input",
      genericName,
      await this.audioVideo.listAudioInputDevices(),
      additionalDevices
    );
    this.populateInMeetingDeviceList(
      "dropdown-menu-microphone",
      genericName,
      await this.audioVideo.listAudioInputDevices(),
      additionalDevices,
      async (name: string) => {
        await this.audioVideo.chooseAudioInputDevice(
          this.audioInputSelectionToDevice(name)
        );
      }
    );
  }

  async populateVideoInputList(): Promise<void> {
    const genericName = "Camera";
    const additionalDevices = ["None", "Blue", "SMPTE Color Bars"];
    this.populateDeviceList(
      "video-input",
      genericName,
      await this.audioVideo.listVideoInputDevices(),
      additionalDevices
    );
    this.populateInMeetingDeviceList(
      "dropdown-menu-camera",
      genericName,
      await this.audioVideo.listVideoInputDevices(),
      additionalDevices,
      async (name: string) => {
        try {
          await this.openVideoInputFromSelection(name, false);
        } catch (err) {
          this.log("no video input device selected");
        }
      }
    );
    const cameras = await this.audioVideo.listVideoInputDevices();
    this.cameraDeviceIds = cameras.map((deviceInfo) => {
      return deviceInfo.deviceId;
    });
  }

  async populateAudioOutputList(): Promise<void> {
    const genericName = "Speaker";
    const additionalDevices: string[] = [];
    this.populateDeviceList(
      "audio-output",
      genericName,
      await this.audioVideo.listAudioOutputDevices(),
      additionalDevices
    );
    this.populateInMeetingDeviceList(
      "dropdown-menu-speaker",
      genericName,
      await this.audioVideo.listAudioOutputDevices(),
      additionalDevices,
      async (name: string) => {
        await this.audioVideo.chooseAudioOutputDevice(name);
      }
    );
  }

  private analyserNodeCallback = () => { };

  async openAudioInputFromSelection(): Promise<void> {
    const audioInput = document.getElementById(
      "audio-input"
    ) as HTMLSelectElement;
    await this.audioVideo.chooseAudioInputDevice(
      this.audioInputSelectionToDevice(audioInput.value)
    );
    this.startAudioPreview();
  }

  setAudioPreviewPercent(percent: number): void {
    const audioPreview = document.getElementById("audio-preview");
    this.updateProperty(audioPreview.style, "transitionDuration", "33ms");
    this.updateProperty(audioPreview.style, "width", `${percent}%`);
    if (audioPreview.getAttribute("aria-valuenow") !== `${percent}`) {
      audioPreview.setAttribute("aria-valuenow", `${percent}`);
    }
  }

  startAudioPreview(): void {
    this.setAudioPreviewPercent(0);
    const analyserNode = this.audioVideo.createAnalyserNodeForAudioInput();
    if (!analyserNode) {
      return;
    }
    if (!analyserNode.getByteTimeDomainData) {
      document.getElementById("audio-preview").parentElement.style.visibility =
        "hidden";
      return;
    }
    const data = new Uint8Array(analyserNode.fftSize);
    let frameIndex = 0;
    this.analyserNodeCallback = () => {
      if (frameIndex === 0) {
        analyserNode.getByteTimeDomainData(data);
        const lowest = 0.01;
        let max = lowest;
        for (const f of data) {
          max = Math.max(max, (f - 128) / 128);
        }
        let normalized = (Math.log(lowest) - Math.log(max)) / Math.log(lowest);
        let percent = Math.min(Math.max(normalized * 100, 0), 100);
        this.setAudioPreviewPercent(percent);
      }
      frameIndex = (frameIndex + 1) % 2;
      requestAnimationFrame(this.analyserNodeCallback);
    };
    requestAnimationFrame(this.analyserNodeCallback);
  }

  async openAudioOutputFromSelection(): Promise<void> {
    const audioOutput = document.getElementById(
      "audio-output"
    ) as HTMLSelectElement;
    await this.audioVideo.chooseAudioOutputDevice(audioOutput.value);
    const audioMix = document.getElementById(
      "meeting-audio"
    ) as HTMLAudioElement;
    await this.audioVideo.bindAudioElement(audioMix);
  }

  private selectedVideoInput: string | null = null;

  async openVideoInputFromSelection(
    selection: string | null,
    showPreview: boolean
  ): Promise<void> {
    if (selection) {
      this.selectedVideoInput = selection;
    }
    this.log(`Switching to: ${this.selectedVideoInput}`);
    const device = this.videoInputSelectionToDevice(this.selectedVideoInput);
    if (device === null) {
      if (showPreview) {
        this.audioVideo.stopVideoPreviewForVideoInput(
          document.getElementById("video-preview") as HTMLVideoElement
        );
      }
      this.audioVideo.stopLocalVideoTile();
      this.toggleButton("button-camera", "off");
      // choose video input null is redundant since we expect stopLocalVideoTile to clean up
      await this.audioVideo.chooseVideoInputDevice(device);
      throw new Error("no video device selected");
    }
    await this.audioVideo.chooseVideoInputDevice(device);
    if (showPreview) {
      this.audioVideo.startVideoPreviewForVideoInput(
        document.getElementById("video-preview") as HTMLVideoElement
      );
    }
  }

  private audioInputSelectionToDevice(value: string): Device {
    if (this.isRecorder()) {
      return null;
    }
    if (value === "440 Hz") {
      return DefaultDeviceController.synthesizeAudioDevice(440);
    } else if (value === "None") {
      return null;
    }
    return value;
  }

  private videoInputSelectionToDevice(value: string): Device {
    if (this.isRecorder()) {
      return null;
    }
    if (value === "Blue") {
      return DefaultDeviceController.synthesizeVideoDevice("blue");
    } else if (value === "SMPTE Color Bars") {
      return DefaultDeviceController.synthesizeVideoDevice("smpte");
    } else if (value === "None") {
      return null;
    }
    return value;
  }

  private initContentShareDropDownItems(): void {
    // let item = document.getElementById(
    //   "dropdown-item-content-share-screen-capture"
    // );
    // item.addEventListener("click", () => {
    //   this.contentShareTypeChanged(ContentShareType.ScreenCapture);
    // });

    // item = document.getElementById(
    //   "dropdown-item-content-share-screen-test-video"
    // );
    // item.addEventListener("click", () => {
    //   this.contentShareTypeChanged(
    //     ContentShareType.VideoFile,
    //     DemoMeetingApp.testVideo
    //   );
    // });

    // document
    //   .getElementById("content-share-item")
    //   .addEventListener("change", () => {
    //     const fileList = document.getElementById(
    //       "content-share-item"
    //     ) as HTMLInputElement;
    //     const file = fileList.files[0];
    //     if (!file) {
    //       this.log("no content share selected");
    //       return;
    //     }
    //     const url = URL.createObjectURL(file);
    //     this.log(`content share selected: ${url}`);
    //     this.contentShareTypeChanged(ContentShareType.VideoFile, url);
    //     fileList.value = "";
    //   });
  }

  private async contentShareTypeChanged(
    contentShareType: ContentShareType,
    videoUrl?: string
  ): Promise<void> {
    if (this.isButtonOn("button-content-share")) {
      await this.contentShareStop();
    }
    this.contentShareType = contentShareType;
    await this.contentShareStart(videoUrl);
  }

  private async contentShareStart(videoUrl?: string): Promise<void> {
    switch (this.contentShareType) {
      case ContentShareType.ScreenCapture:
        this.audioVideo.startContentShareFromScreenCapture();
        break;
      case ContentShareType.VideoFile:
        const videoFile = document.getElementById(
          "content-share-video"
        ) as HTMLVideoElement;
        if (videoUrl) {
          videoFile.src = videoUrl;
        }
        await videoFile.play();
        // @ts-ignore
        const mediaStream: MediaStream = videoFile.captureStream();
        this.audioVideo.startContentShare(mediaStream);
        break;
    }
  }

  private async contentShareStop(): Promise<void> {
    // if (this.isButtonOn("button-pause-content-share")) {
    //   this.toggleButton("button-pause-content-share");
    // }
    this.toggleButton("button-content-share");
    this.audioVideo.stopContentShare();
    if (this.contentShareType === ContentShareType.VideoFile) {
      const videoFile = document.getElementById(
        "content-share-video"
      ) as HTMLVideoElement;
      videoFile.pause();
      videoFile.style.display = "none";
    }
  }

  isRecorder(): boolean {
    return new URL(window.location.href).searchParams.get("record") === "true";
  }

  async authenticate(): Promise<any> {

    let joinInfo = await this.joinMeeting();
    if(joinInfo.Data === null ){
      return joinInfo;
    }
    const configuration = new MeetingSessionConfiguration(
      joinInfo.Meeting,
      joinInfo.Attendee
    );
    await this.initializeMeetingSession(configuration);
    /* Initialize Timer */
    // End meeting date time in UTCDF
    // showTimerBeforeMeetingEnd in minutes (number)
    const timer = new Timer();
    timer.initialize(
      moment
        .utc(joinInfo.MeetingEndDateTime)
        .local()
        .format("YYYY-MM-DD hh:mm A"),
      joinInfo.BeforeMeetingEndTime,
      () => this.endMeeting(this)
    );

    const url = new URL(window.location.href);
    url.searchParams.set("m", this.meeting);
    history.replaceState({}, `${this.meeting}`, url.toString());

    return configuration.meetingId;
    // if(joinInfo != undefined || joinInfo != null){
      
    // }
  }

  log(str: string): void {
    console.log(`[DEMO] ${str}`);
  }

  audioVideoDidStartConnecting(reconnecting: boolean): void {
    this.log(`session connecting. reconnecting: ${reconnecting}`);
  }

  audioVideoDidStart(): void {
    this.log("session started");
  }

  audioVideoDidStop(sessionStatus: MeetingSessionStatus): void {
    this.log(`session stopped from ${JSON.stringify(sessionStatus)}`);
    if (
      sessionStatus.statusCode() === MeetingSessionStatusCode.AudioCallEnded
    ) {
      this.log(`meeting ended`);
      // @ts-ignore
      if (this.userType == UserType.Student) {
        window.location.href =
          DemoMeetingApp.REACT_APP_URL + "/Feedback/" + this.sessionId + "/y";
      } else {
        window.location.href =
          DemoMeetingApp.REACT_APP_URL + "/Feedback/" + this.sessionId + "/n";
      }
    }
  }

  videoTileDidUpdate(tileState: VideoTileState): void {
    
    this.log(`video tile updated: ${JSON.stringify(tileState, null, "  ")}`);
    if (!tileState.boundAttendeeId) {
      return;
    }
    const selfAttendeeId = this.meetingSession.configuration.credentials
      .attendeeId;
    const modality = new DefaultModality(tileState.boundAttendeeId);
    if (
      modality.base() === selfAttendeeId &&
      modality.hasModality(DefaultModality.MODALITY_CONTENT)
    ) {
      // don't bind one's own content
      return;
    }
    const tileIndex = tileState.localTile
      ? 16
      : this.tileOrganizer.acquireTileIndex(tileState.tileId);
    const tileElement = document.getElementById(
      `tile-${tileIndex}`
    ) as HTMLDivElement;
    const videoElement = document.getElementById(
      `video-${tileIndex}`
    ) as HTMLVideoElement;
    const nameplateElement = document.getElementById(
      `nameplate-${tileIndex}`
    ) as HTMLDivElement;
    const pauseButtonElement = document.getElementById(
      `video-pause-${tileIndex}`
    ) as HTMLButtonElement;
    const spanElement = document.getElementById(
      `name-${tileIndex}`
    ) as HTMLSpanElement;

    var spilitUserName =   tileState.boundExternalUserId.split(' ');
    var tileUserName = '';
    if(spilitUserName.length > 2)
    {
      tileUserName =  spilitUserName[0] + ' ' +spilitUserName[2];
    }
    else{
      tileUserName =  spilitUserName[0] + ' ' +spilitUserName[1];
    }
    spanElement.innerText = tileUserName;
    pauseButtonElement.addEventListener("click", () => {
      if (!tileState.paused) {
        this.audioVideo.pauseVideoTile(tileState.tileId);
        pauseButtonElement.innerText = "Show";
      } else {
        this.audioVideo.unpauseVideoTile(tileState.tileId);
        pauseButtonElement.innerText = "Hide";
      }
    });

    this.log(`binding video tile ${tileState.tileId} to ${videoElement.id}`);
    this.audioVideo.bindVideoElement(tileState.tileId, videoElement);
    this.tileIndexToTileId[tileIndex] = tileState.tileId;
    this.tileIdToTileIndex[tileState.tileId] = tileIndex;
    this.updateProperty(
      nameplateElement,
      "innerText",
      tileState.boundExternalUserId.split("#")[1]
    );
    tileElement.style.display = "block";
    this.layoutVideoTiles();
  }

  videoTileWasRemoved(tileId: number): void {
    this.log(`video tile removed: ${tileId}`);
    this.hideTile(this.tileOrganizer.releaseTileIndex(tileId));
  }

  videoAvailabilityDidChange(
    availability: MeetingSessionVideoAvailability
  ): void {
    this.canStartLocalVideo = availability.canStartLocalVideo;
    this.log(
      `video availability changed: canStartLocalVideo  ${availability.canStartLocalVideo}`
    );
  }

  hideTile(tileIndex: number): void {
    const tileElement = document.getElementById(
      `tile-${tileIndex}`
    ) as HTMLDivElement;
    tileElement.style.display = "none";
    this.layoutVideoTiles();
  }

  tileIdForAttendeeId(attendeeId: string): number | null {
    for (const tile of this.audioVideo.getAllVideoTiles()) {
      const state = tile.state();
      if (state.boundAttendeeId === attendeeId) {
        return state.tileId;
      }
    }
    return null;
  }

  findContentTileId(): number | null {
    for (const tile of this.audioVideo.getAllVideoTiles()) {
      const state = tile.state();
      if (state.isContent) {
        return state.tileId;
      }
    }
    return null;
  }

  isContentTile(tileIndex: number): boolean {
    const tileId = this.tileIndexToTileId[tileIndex];
    if (!tileId) {
      return false;
    }
    const tile = this.audioVideo.getVideoTile(tileId);
    const state = tile.state();
    if (state.isContent) {
      return true;
    }
    return false;
  }

  activeTileId(): number | null {
    let contentTileId = this.findContentTileId();
    if (contentTileId !== null) {
      return contentTileId;
    }
    for (const attendeeId in this.roster) {
      if (DemoMeetingApp.activeSpeakerAttendeeId == attendeeId) {
        return this.tileIdForAttendeeId(attendeeId);
      }
    }
    return null;
  }

  async layoutVideoTiles(): Promise<void> {
    if (!this.meetingSession) {
      return;
    }
    const selfAttendeeId = this.meetingSession.configuration.credentials.attendeeId;
    const selfTileId = this.tileIdForAttendeeId(selfAttendeeId);
    const visibleTileIndices = this.visibleTileIndices();
    let activeTileId = this.activeTileId();
    const selfIsVisible = visibleTileIndices.includes(
      this.tileIdToTileIndex[selfTileId]
    );
    // if (visibleTileIndices.length === 2 && selfIsVisible) {
    //   activeTileId = this.tileIndexToTileId[
    //     visibleTileIndices[0] === selfTileId
    //       ? visibleTileIndices[1]
    //       : visibleTileIndices[0]
    //   ];
    // }
    const hasVisibleActiveTile = visibleTileIndices.includes(
      this.tileIdToTileIndex[activeTileId]
    );

    if (this.activeSpeakerLayout && hasVisibleActiveTile) {
      this.layoutVideoTilesActiveSpeaker(visibleTileIndices, activeTileId);
    } else {
      this.layoutVideoTilesGrid(visibleTileIndices);
    }
  }

  visibleTileIndices(): number[] {
    let tiles: number[] = [];
    const localTileIndex = DemoTileOrganizer.MAX_TILES;
    for (let tileIndex = 0; tileIndex <= localTileIndex; tileIndex++) {
      const tileElement = document.getElementById(
        `tile-${tileIndex}`
      ) as HTMLDivElement;
      if (tileElement.style.display === "block") {
        tiles.push(tileIndex);
      }
    }
    return tiles;
  }

  setUpVideoTileElementResizer(): void {
    for (let i = 0; i <= DemoTileOrganizer.MAX_TILES; i++) {
      const videoElem = document.getElementById(
        `video-${i}`
      ) as HTMLVideoElement;
      videoElem.onresize = () => {
        if (videoElem.videoHeight > videoElem.videoWidth) {
          // portrait mode
          videoElem.style.objectFit = "contain";
          this.log(
            `video-${i} changed to portrait mode resolution ${videoElem.videoWidth}x${videoElem.videoHeight}`
          );
        } else {
          videoElem.style.objectFit = "cover";
        }
      };
    }
  }

  layoutVideoTilesActiveSpeaker(
    visibleTileIndices: number[],
    activeTileId: number
  ): void {
    const tileArea = document.getElementById("tile-area") as HTMLDivElement;
    const width = tileArea.clientWidth;
    const height = tileArea.clientHeight;
    const widthToHeightAspectRatio = 16 / 8;
    const maximumRelativeHeightOfOthers = 0.3;

    const activeWidth = width;
    let activeHeight = height;
    const othersCount = visibleTileIndices.length - 1;

    let columns = 1;
    let othertotalHeight = 0;
    let rowHeight = 0;

    let othersHeight = (height / 4);
    if (othersCount === 0) {
      othersHeight = 0;
    }
    else {
      activeHeight = (othersHeight * 3) - 30;
      for (; columns < 18; columns++) {
        const rows = Math.ceil(othersCount / columns);
        rowHeight = width / columns / widthToHeightAspectRatio;
        othertotalHeight = rowHeight * rows;
        if (othertotalHeight <= othersHeight) {
          break;
        }
      }
    }
    const totalHeight = activeHeight + othersHeight;
    const activeYOffset = height / 2 - totalHeight / 2;
    const othersYOffset = activeYOffset + activeHeight;

    let othersIndex = 0;
    for (let i = 0; i < visibleTileIndices.length; i++) {
      const tileIndex = visibleTileIndices[i];
      const tileId = this.tileIndexToTileId[tileIndex];
      let x = 0,
        y = 0,
        w = 0,
        h = 0;
      if (tileId === activeTileId) {
        x = 0;
        y = activeYOffset;
        w = activeWidth;
        h = activeHeight;
      } else {
        w = Math.floor(width / columns);
        h = Math.floor(rowHeight);
        x = (othersIndex % columns) * w;
        y = othersYOffset + (Math.floor(othersIndex / columns) * h);
        othersIndex += 1;
      }
      this.updateTilePlacement(tileIndex, x, y, w, h);
    }
  }

  updateTilePlacement(
    tileIndex: number,
    x: number,
    y: number,
    w: number,
    h: number
  ): void {

    const tile = document.getElementById(`tile-${tileIndex}`) as HTMLDivElement;
    if (this.isContentTile(tileIndex)) {
      tile.classList.remove("video-tile");
      tile.classList.add("content-share-tile");
    } else {
      tile.classList.remove("content-share-tile");
      tile.classList.add("video-tile");
    }
    const insetWidthSize = 4;
    const insetHeightSize = insetWidthSize / (16 / 8);
    tile.style.position = "absolute";
    tile.style.left = `${x + insetWidthSize}px`;
    tile.style.top = `${y + insetHeightSize}px`;
    tile.style.width = `${w - insetWidthSize * 2}px`;
    tile.style.height = `${h - insetHeightSize * 2}px`;
    tile.style.margin = "0";
    tile.style.padding = "0";
    tile.style.visibility = "visible";
    const video = document.getElementById(
      `video-${tileIndex}`
    ) as HTMLDivElement;

    if (video) {
      video.style.position = "absolute";
      video.style.left = "0";
      video.style.top = "0";
      video.style.width = `${w}px`;
      video.style.height = `${h}px`;
      video.style.margin = "0";
      video.style.padding = "0";
      video.style.borderRadius = "8px";
    }
    const nameplate = document.getElementById(
      `nameplate-${tileIndex}`
    ) as HTMLDivElement;
    const nameplateSize = 24;
    const nameplatePadding = 10;
    nameplate.style.position = "absolute";
    nameplate.style.left = "0px";
    nameplate.style.top = `${h - nameplateSize - nameplatePadding}px`;
    nameplate.style.height = `${nameplateSize}px`;
    nameplate.style.width = `${w}px`;
    nameplate.style.margin = "0";
    nameplate.style.padding = "0";
    nameplate.style.paddingLeft = `${nameplatePadding}px`;
    nameplate.style.color = "#fff";
    nameplate.style.backgroundColor = "rgba(0,0,0,0)";
    nameplate.style.textShadow = "0px 0px 5px black";
    nameplate.style.letterSpacing = "0.1em";
    nameplate.style.fontSize = `${nameplateSize - 6}px`;

    let button = document.getElementById(
      `video-pause-${tileIndex}`
    ) as HTMLButtonElement;

    button.style.position = "absolute";
    button.style.display = "inline-block";
    button.style.right = "0px";
    button.style.top = `${h - nameplateSize - nameplatePadding}px`;
    button.style.height = `${nameplateSize}px`;
    button.style.margin = "0";
    button.style.padding = "0";
    button.style.border = "none";
    button.style.paddingRight = `${nameplatePadding}px`;
    button.style.color = "#fff";
    button.style.backgroundColor = "rgba(0,0,0,0)";
    button.style.textShadow = "0px 0px 5px black";
    button.style.letterSpacing = "0.1em";
    button.style.fontSize = `${nameplateSize - 6}px`;
  }

  layoutVideoTilesGrid(visibleTileIndices: number[]): void {
    const tileArea = document.getElementById("tile-area") as HTMLDivElement;
    const width = tileArea.clientWidth;
    const height = tileArea.clientHeight;
    const widthToHeightAspectRatio = 16 / 9;
    let columns = 1;
    let totalHeight = 0;
    let rowHeight = 0;
    for (; columns < 18; columns++) {
      const rows = Math.ceil(visibleTileIndices.length / columns);
      rowHeight = width / columns / widthToHeightAspectRatio;
      totalHeight = rowHeight * rows;
      if (totalHeight <= height) {
        break;
      }
    }
    for (let i = 0; i < visibleTileIndices.length; i++) {
      const w = Math.floor(width / columns);
      const h = Math.floor(rowHeight);
      const x = (i % columns) * w;
      const y = Math.floor(i / columns) * h; // + (height / 2 - totalHeight / 2);
      this.updateTilePlacement(visibleTileIndices[i], x, y, w, h);
    }
  }

  allowMaxContentShare(): boolean {
    const allowed =
      new URL(window.location.href).searchParams.get("max-content-share") ===
      "true";
    if (allowed) {
      return true;
    }
    return false;
  }

  connectionDidBecomePoor(): void {
    this.log("connection is poor");
  }

  connectionDidSuggestStopVideo(): void {
    this.log("suggest turning the video off");
  }

  connectionDidBecomeGood(): void {
    this.log("connection is good now");
  }

  videoSendDidBecomeUnavailable(): void {
    this.log("sending video is not available");
  }

  contentShareDidStart(): void {
    this.log("content share started.");
    this.toggleButton("button-content-share");
  }

  contentShareDidStop(): void {
    this.log("content share stopped.");
    this.toggleButton("button-content-share");
  }

  contentShareDidPause(): void {
    this.log("content share paused.");
  }

  contentShareDidUnpause(): void {
    this.log(`content share unpaused.`);
  }
}

window.addEventListener("load", () => {
  new DemoMeetingApp();
});
