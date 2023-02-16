using Microsoft.AspNetCore.Http;
using OsmosIsh.Core.Shared.Helper;
using System;
using System.Collections.Generic;
using System.Net;
using System.Text;
using Twilio;
using Twilio.Rest.Api.V2010.Account;

namespace OsmosIsh.Core.Shared.Static
{
    public class SendTwillioSMS
    {
        public static string SendSMS(string message, string phone)
        {
            //string message, String phoneNumber
            try
            {
                TwilioClient.Init(AppSettingConfigurations.AppSettings.AccountSid, AppSettingConfigurations.AppSettings.AuthToken);
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
                var messageSend = MessageResource.Create(
                   body: message,
                   from: new Twilio.Types.PhoneNumber(AppSettingConfigurations.AppSettings.TwilioPhone),
                    to: new Twilio.Types.PhoneNumber(phone)
                );
                return "true";
            }
            catch (Twilio.Exceptions.ApiException ex)
            {
                if (ex.Code == 21211 || ex.Code == 21217 || ex.Code == 21614)
                {
                    return "Please provide valid phone number.";
                }
                else if (ex.Code == 21214)
                {
                    return "Provided phone number cannot be reached.";
                }
                else if (ex.Code == 21219)
                {
                    return "Provided phone number not verified.";
                }
                else if (ex.Code == 21408)
                {
                    return "Permission to send an SMS has not been enabled for the region indicated by the provided number.";
                }
                else if (ex.Code == 21612)
                {
                    return "The provided phone number is not currently reachable via SMS";
                }
                else
                {
                    return "Some thing went wrong , please contact Osmosish support.";
                }
            }
        }
    }
}
