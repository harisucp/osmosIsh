using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class Messages
    {
        public int MessageId { get; set; }
        public int SenderId { get; set; }
        public int? PrivateSessionLogId { get; set; }
        public int SenderType { get; set; }
        public int RecipientId { get; set; }
        public int RecipientType { get; set; }
        public string Message { get; set; }
        public string IsSeen { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string CreatedBy { get; set; }

        public virtual GlobalCodes RecipientTypeNavigation { get; set; }
        public virtual GlobalCodes SenderTypeNavigation { get; set; }
    }
}
