using Quartz;
using Quartz.Impl;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OsmosIsh.Web.API
{
    public class AffiliatePayoutScheduler
    {

        public static async void Start()
        {
            IScheduler scheduler = await StdSchedulerFactory.GetDefaultScheduler();
            await scheduler.Start();

            IJobDetail job = JobBuilder.Create<ProcessAffiliate>().Build();
            ITrigger trigger = TriggerBuilder.Create()
            .WithIdentity("trigger5", "group5")
            .StartNow()
            .WithSimpleSchedule(x => x
            .WithRepeatCount(1)
            .WithIntervalInMinutes(20)
            .RepeatForever())
            .Build();
            await scheduler.ScheduleJob(job, trigger);
        }
    }
}
