using OsmosIsh.Core.Shared.Static;
using Quartz;
using Quartz.Impl;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OsmosIsh.Web.API
{
    //public class JobScheduler : IJobScheduler
    public class SessionReminderJobScheduler
    {
        //public void print()
        //{
        //    Console.WriteLine($"Recurring job");
        //}
       public static async void Start()
        {
            IScheduler scheduler = await StdSchedulerFactory.GetDefaultScheduler();
            await scheduler.Start();

            IJobDetail job = JobBuilder.Create<ProcessSessionReminder>().Build();
            ITrigger trigger = TriggerBuilder.Create()
            .WithIdentity("trigger4", "group4")
            .StartNow()
            .WithSimpleSchedule(x => x
            .WithRepeatCount(1)
            .WithIntervalInMinutes(5)
            .RepeatForever())
            .Build();
            await scheduler.ScheduleJob(job, trigger);
        }
    }
}
