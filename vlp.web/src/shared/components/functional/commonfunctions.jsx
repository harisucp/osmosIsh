import React from "react";
import moment from "moment";
import { TIMEZONEDB_APIID } from "../../../config/api.config";
import { localStorageService } from "../../../services/localStorageService";
const getUtcDatetime = (date) => {
  if (!date) return "";

  const formattedDate = moment.utc(date).local();
  return formattedDate;
};

const getUtcDate = (date, format) => {
  if (!date) return "";

  if (format === "") format = "YYYY-MM-DD hh:mm A";
  const formattedDate = moment.utc(date).local().format(format);
  return formattedDate;
};

const convertToUtc = (date) => {
  if (!date) return "";
  const formattedDate = moment.utc(date).format("YYYY-MM-DD hh:mm A");
  return formattedDate;
};

// Covert local datetime into utc
const convertToFormattedUtc = (date, format) => {
  if (!date) return "";

  if (format === "") format = "YYYY-MM-DD hh:mm A";
  const formattedDate = moment.utc(date).format(format);
  return formattedDate;
};

// convert Utc timezone to specified timezone time
const convertUtcToAnotherTimezone = (datetime, timezone, timeFormat) => {
  let format = "MM/DD/YYYY hh:mm A";
  if (timeFormat === "" || typeof timeFormat === "undefined") {
    timeFormat = format;
  }
  //console.log(datetime + ' ' + moment.utc(datetime).tz(timezone).format(timeFormat));
  return timezone === ""
    ? ""
    : moment.utc(datetime).tz(timezone).format(timeFormat);
};

const getTimezoneData = async (timezone) => {
  await fetch(
    `https://api.timezonedb.com/v2.1/get-time-zone?key=${TIMEZONEDB_APIID}&format=json&by=zone&zone=${timezone}`
  )
    .then((res) => res.json())
    .then(
      (result) => {
        if (result.status === "FAILED") {
          localStorageService.setUserTimeZone(
            moment.tz(moment.tz.guess(true)).format("z")
          );
        } else {
          localStorageService.setUserTimeZone(result.abbreviation);
        }
      },
      (error) => {
        localStorageService.setUserTimeZone(
          moment.tz(moment.tz.guess(true)).format("z")
        );
      }
    );
};

const getCurrentTime = async () => {
  await fetch("https://worldtimeapi.org/api/timezone/ETC/UTC")
    .then((res) => res.json())
    .then(
      (result) => {
        let utcDateTime = new Date(result.datetime);
        let localDateTime = getUtcDatetime(utcDateTime);
        localStorageService.setCurrentTime(localDateTime);
      },
      (error) => {
      }
    );

}
export const commonFunctions = {
  getUtcDatetime,
  getUtcDate,
  convertToUtc,
  convertToFormattedUtc,
  convertUtcToAnotherTimezone,
  getTimezoneData,
  getCurrentTime
};
