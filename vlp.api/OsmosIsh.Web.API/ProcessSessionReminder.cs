using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Service.Common;
using OsmosIsh.Service.IService;
using OsmosIsh.Service.Service;
using PayPal.Api;
using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OsmosIsh.Web.API
{
    public class ProcessSessionReminder : IJob
    {
        public async Task Execute(IJobExecutionContext context)
        {
            PaymentProcessService PaymentPorcess = new PaymentProcessService();
            try
            {
                var getTutorReminderDetailResult = PaymentPorcess.GetSessionReminderTutorDetail();
                if (getTutorReminderDetailResult.Count > 0)
                {
                    foreach (var detail in getTutorReminderDetailResult)
                    {
                        var tutorEmailBody = "";
                        tutorEmailBody = CommonFunction.GetTemplateFromHtml("SessionReminderTutor.html");
                        tutorEmailBody = tutorEmailBody.Replace("{TutorName}", Convert.ToString(detail.TeacherName));
                        tutorEmailBody = tutorEmailBody.Replace("{Title}", Convert.ToString(detail.Title));
                        NotificationHelper.SendEmail(detail.TutorEmail, tutorEmailBody, "Don't forget: Your session will be starting soon!", true);
                    }
                }

                var messagesList = new List<SendEmailData>();
                
                var getstudentReminderDetailResult = PaymentPorcess.GetSessionReminderStudentDetail();
                if (getstudentReminderDetailResult.Count > 0)
                {
                    foreach (var detail in getstudentReminderDetailResult)
                    {
                        var tutorEmailBody = "";
                        tutorEmailBody = CommonFunction.GetTemplateFromHtml("SessionReminderStudent.html");
                        tutorEmailBody = tutorEmailBody.Replace("{StudentName}", Convert.ToString(detail.StudentName));
                        tutorEmailBody = tutorEmailBody.Replace("{Title}", Convert.ToString(detail.Title));
                        // NotificationHelper.SendEmail(detail.Email, tutorEmailBody, "Don't forget: Your session will be starting soon!", true);

                        messagesList.Add(new SendEmailData
                        {
                            email = detail.Email,
                            subject = "Don't forget: Your session will be starting soon!",
                            body = tutorEmailBody
                        });
                    }
                }

                await NotificationHelper.SendBulkEmailAsync(messagesList);
            }
            catch (Exception exception)
            {
                PaymentPorcess.LogExceptionInDB(exception, "ProcessSessionReminder");
            }
        }
    }
}
