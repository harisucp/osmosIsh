using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.Shared.Helper
{
    public class PaypalSettings
    {
        public Settings Settings { get; set; }
      
    }
    public class Settings
    {
        public string business { get; set; }
        public string mode { get; set; }
        public string merchantId { get; set; }
        public string clientId { get; set; }
        public string clientSecret { get; set; }
        public string liveclientId { get; set; }
        public string liveclientSecret { get; set; }
        public string reCaptureInterval { get; set; }
        public string payOutInterval { get; set; }
        public string refundInterval { get; set; }
        public string reminderInterval { get; set; }
        public string connectionTimeout { get; set; }
        public string requestRetries { get; set; }

    }
}
