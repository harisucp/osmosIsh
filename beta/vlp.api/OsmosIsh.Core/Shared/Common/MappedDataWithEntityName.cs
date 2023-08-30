using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.Shared.Common
{
    public class MapPrePostMethod
    {
        /// <summary>
        /// Pass full path of class in which pre method defined.
        /// </summary>
        public string PreMethodClassFullPath { get; set; }
        /// <summary>
        /// Pass method name that needs to bind for per save event.
        /// </summary>
        public string PreMethodName { get; set; }
        /// <summary>
        /// Pass full path of class in which post method defined.
        /// </summary>
        public string PostMethodClassFullPath { get; set; }
        /// <summary>
        /// Pass method name that needs to bind for post save event.
        /// </summary>
        public string PostMethodName { get; set; }
    }

    public class MappedDataWithEntityName
    {
        public string EntityName { get; set; }
        public MapPrePostMethod MapPrePostMethod { get; set; }
        public MappedStoreProcedureData MappedStoreProcedureData { get; set; }
    }

    public static class MappedDataWithEntityNameList
    {
        public static List<MappedDataWithEntityName> MappedDataWithEntityNames { get; set; }
    }

    public class MappedStoreProcedureData
    {
        /// <summary>
        /// Pass store procedure name that need to bind.
        /// </summary>
        public string StoredProcedure { get; set; }
        /// <summary>
        /// Pass sql parmeters that need to pass binded store procedure.
        /// </summary>
        public IList<string> SqlParameters { get; set; }
    }
}
