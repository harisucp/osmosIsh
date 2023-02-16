using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class SchemaVersions
    {
        public int Id { get; set; }
        public string ScriptName { get; set; }
        public DateTime Applied { get; set; }
    }
}
