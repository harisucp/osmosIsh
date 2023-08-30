using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Core.Shared.Static
{
    public class NotificationHelper
    {
        public static void SendEmail(string emailAddress, String bodyMessage, string subject, bool html)
        {
            try
            {
                MailMessage email = new MailMessage();
                email.From = new MailAddress(AppSettingConfigurations.AppSettings.SmtpUser);
                email.To.Add(new MailAddress(emailAddress));
                email.Subject = subject;
                email.Body = bodyMessage;
                email.IsBodyHtml = html;

                SmtpClient smtpServer = new SmtpClient();
                smtpServer.Host = AppSettingConfigurations.AppSettings.SmtpServer;
                smtpServer.Port = Convert.ToInt32(AppSettingConfigurations.AppSettings.SmtpPort);
                smtpServer.Credentials = new NetworkCredential(AppSettingConfigurations.AppSettings.SmtpUser, AppSettingConfigurations.AppSettings.SmtpPassword);
                smtpServer.EnableSsl = Convert.ToBoolean(AppSettingConfigurations.AppSettings.SmtpSslEnabled);
                smtpServer.Send(email);
            }
            catch (Exception ex)
            {
                throw (ex);
            }
        }

        public static async Task SendBulkEmailAsync(List<SendEmailData> messagesList)
        {
            try
            {
                var i = 0;
                using (SmtpClient smtpServer = new SmtpClient())
                {
                    foreach (var message in messagesList)
                    {
                        Console.WriteLine($"{++i}.Start Date Time " + DateTime.Now.ToString("yyyy-MM-dd hh:mm:ss"));

                        MailMessage email = new MailMessage();
                        email.From = new MailAddress(AppSettingConfigurations.AppSettings.SmtpUser);
                        email.To.Add(new MailAddress(message.email));
                        email.Subject = message.subject;
                        email.Body = message.body;
                        email.IsBodyHtml = true;

                        smtpServer.Host = AppSettingConfigurations.AppSettings.SmtpServer;
                        smtpServer.Port = Convert.ToInt32(AppSettingConfigurations.AppSettings.SmtpPort);
                        smtpServer.Credentials = new NetworkCredential(AppSettingConfigurations.AppSettings.SmtpUser, AppSettingConfigurations.AppSettings.SmtpPassword);
                        smtpServer.EnableSsl = Convert.ToBoolean(AppSettingConfigurations.AppSettings.SmtpSslEnabled);
                        await smtpServer.SendMailAsync(email);

                        Console.WriteLine($"{i}.End Date Time " + DateTime.Now.ToString("yyyy-MM-dd hh:mm:ss"));
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception from sendemail " + ex);
                Console.WriteLine("Exception from sendemail Message " + ex.Message);

            }
        }

        public static void SendEmailWithICS(string emailAddress, String bodyMessage, string subject, bool html, DateTime? startDate, DateTime? endDate, string title = "")
        {
            try
            {
                MailMessage email = new MailMessage();
                email.From = new MailAddress(AppSettingConfigurations.AppSettings.SmtpUser);
                email.To.Add(new MailAddress(emailAddress));
                email.Subject = subject;
                email.Body = bodyMessage;
                email.IsBodyHtml = true;

                StringBuilder str = new StringBuilder();
                str.AppendLine("BEGIN:VCALENDAR");
                str.AppendLine("PRODID:-//" + subject.Replace(" ", "_"));
                str.AppendLine("VERSION:2.0");
                str.AppendLine("METHOD:REQUEST");
                str.AppendLine("STATUS:CONFIRMED");
                str.AppendLine("BEGIN:VEVENT");
                str.AppendLine(string.Format("DTSTART:{0:yyyyMMddTHHmmssZ}", startDate == null ? DateTime.UtcNow : startDate.Value.ToUniversalTime()));
                str.AppendLine(string.Format("DTSTAMP:{0:yyyyMMddTHHmmssZ}", DateTime.UtcNow));
                str.AppendLine(string.Format("DTEND:{0:yyyyMMddTHHmmssZ}", endDate == null ? DateTime.UtcNow : endDate.Value.ToUniversalTime()));
                str.AppendLine("LOCATION: Osmosish.com");
                str.AppendLine(string.Format("UID:{0}", Guid.NewGuid()));
                str.AppendLine("DESCRIPTION:Hello, in order to join a video session, 5 minutes before your start time, you will need to go to your Host or User dashboard at osmosish.com and below the information with your progress, there will be a card with your class information and a button to join.");
                str.AppendLine(string.Format("X-ALT-DESC;FMTTYPE=text/html:{0}", bodyMessage));
                str.AppendLine(string.Format("SUMMARY:{0}", title));
                str.AppendLine(string.Format("ORGANIZER;CN={0}:MAILTO:{1}", "Osmosish.com", AppSettingConfigurations.AppSettings.SmtpUser));

                str.AppendLine(string.Format("ATTENDEE;RSVP=TRUE:mailto:{0}", emailAddress));

                str.AppendLine("BEGIN:VALARM");
                str.AppendLine("TRIGGER:-PT15M");
                str.AppendLine("ACTION:DISPLAY");
                str.AppendLine("DESCRIPTION:" + title);
                str.AppendLine("END:VALARM");
                str.AppendLine("END:VEVENT");
                str.AppendLine("END:VCALENDAR");

                System.Net.Mime.ContentType contype = new System.Net.Mime.ContentType("text/calendar");
                contype.Parameters.Add("method", "REQUEST");
                contype.Parameters.Add("name", "Invite.ics");
                contype.Parameters.Add("charSet", "utf-8");

                AlternateView HTML = AlternateView.CreateAlternateViewFromString(bodyMessage, new System.Net.Mime.ContentType(System.Net.Mime.MediaTypeNames.Text.Html));
                email.AlternateViews.Add(HTML);

                AlternateView avCal = AlternateView.CreateAlternateViewFromString(str.ToString(), contype);
                avCal.TransferEncoding = TransferEncoding.Base64;
                email.AlternateViews.Add(avCal);
              

                SmtpClient smtpServer = new SmtpClient();
                smtpServer.Host = AppSettingConfigurations.AppSettings.SmtpServer;
                smtpServer.Port = Convert.ToInt32(AppSettingConfigurations.AppSettings.SmtpPort);
                smtpServer.Credentials = new NetworkCredential(AppSettingConfigurations.AppSettings.SmtpUser, AppSettingConfigurations.AppSettings.SmtpPassword);
                smtpServer.EnableSsl = Convert.ToBoolean(AppSettingConfigurations.AppSettings.SmtpSslEnabled);
                smtpServer.Send(email);
            }
            catch (Exception ex)
            {
                throw (ex);
            }
        }
    }
    public class SendEmailData
    {
        public string email { get; set; }
        public string subject { get; set; }
        public string body { get; set; }

    }
}
