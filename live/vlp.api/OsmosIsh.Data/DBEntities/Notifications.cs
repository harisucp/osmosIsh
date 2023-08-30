using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class Notifications
    {
        public int NotificationId { get; set; }
        public string TableName { get; set; }
        public int KeyId { get; set; }
        public int ReceiverId { get; set; }
        public int ReceiverType { get; set; }
        public string Comment { get; set; }
        public string IsSeen { get; set; }
        public DateTime ModifiedDate { get; set; }
    }
}
