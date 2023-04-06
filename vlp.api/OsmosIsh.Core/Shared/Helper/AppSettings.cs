using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.Shared.Helper
{
    public class AppSettings
    {
        public string Secret { get; set; }
        public string ValidIssuer { get; set; }
        public string ValidAudience { get; set; }
        public string Timeout { get; set; }
        public string ConnectionString { get; set; }
        public string SlackErrorLogPath { get; set; }
        public bool EnableAPILog { get; set; }
        public string ErrorLoggingType { get; set; }
        public bool EnableSwagger { get; set; } = true;
        public string SmtpServer { get; set; }
        public string SmtpPort { get; set; }
        public string SmtpUser { get; set; }
        public string SmtpPassword { get; set; }
        public string SmtpSslEnabled { get; set; }
        public string ReactAppliactionUrl { get; set; }
        public string APIApplicationUrl { get; set; }
        public string AdminEmail { get; set; }
        public string AWSAccessKeyId { get; set; }
        public string AWSSecretAccessKey { get; set; }
        public string PrivateSessionSubject { get; set; }
        public List<AdminCredential> AdminCredentials { get; set; }
        public string AccountSid { get; set; }
        public string AuthToken { get; set; }
        public string TwilioPhone { get; set; }
        public string NumberTimeFirstTransactionCouponSent { get; set; }
        public string SendyAPIDbConnectionString { get; set; }
        public string SendySubscribeLink { get; set; }
    }

    public class AdminCredential    
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
