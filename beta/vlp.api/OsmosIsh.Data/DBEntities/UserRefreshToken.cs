using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class UserRefreshToken
    {
        public int UserRefershTokenId { get; set; }
        public int UserId { get; set; }
        public string RefershToken { get; set; }
        public DateTime ExpiryDate { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedByIp { get; set; }
        public string RevokedByIp { get; set; }
        public string ReplacedByToken { get; set; }
        public DateTime? RevokedDate { get; set; }
    }
}
