using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.Shared.Common
{
    public class MappedKeyData
    {
        /// <summary>
        /// Pass store procedure name that need to bind.
        /// </summary>
        public string StoredProcedure { get; set; }
        /// <summary>
        /// Pass sql parmeters that need to pass binded store procedure.
        /// </summary>
        public IList<string> SqlParameters { get; set; }
        /// <summary>
        /// Pass entity path that need to bind with data return by store procedure. 
        /// </summary>
        public string MappedEntityClassPath { get; set; }
    }
    

    public class MappedDataWithKeyName
    {
        public string KeyName { get; set; }
        public MappedKeyData MappedKeyData { get; set; }
    }

    public static class MappedDataWithKeyNameList
    {
        public static List<MappedDataWithKeyName> MappedDataWithKeyNames { get; set; }
    }
}
