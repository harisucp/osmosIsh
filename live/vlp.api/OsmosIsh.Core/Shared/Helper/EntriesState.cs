using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.Shared.Helper
{
    public class EntriesState
    {
        public string EntityName { get; set; }
        public string EntityState { get; set; }

        public PropertyValues OldValues { get; set; }
    }
}
