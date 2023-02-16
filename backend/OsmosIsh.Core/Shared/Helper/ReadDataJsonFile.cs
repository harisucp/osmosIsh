using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OsmosIsh.Core.Shared.Common;
using OsmosIsh.Core.Shared.Static;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace OsmosIsh.Core.Shared.Helper
{
    public class ReadDataJsonFile
    {
        /// <summary>
        /// This method used to get specific object set mapped with passed entityname.
        /// </summary>
        /// <param name="EntityName"></param>
        /// <returns></returns>
        public MappedDataWithEntityName CheckMappingSpecificEntityName(string EntityName)
        {
            var mappedDataWithEntityName = new MappedDataWithEntityName();
            if (MappedDataWithEntityNameList.MappedDataWithEntityNames != null && MappedDataWithEntityNameList.MappedDataWithEntityNames.Count > 0)
            {
                mappedDataWithEntityName = MappedDataWithEntityNameList.MappedDataWithEntityNames.Where(x => x.EntityName == EntityName).FirstOrDefault();
            }
            return mappedDataWithEntityName;
        }
        /// <summary>
        /// This method used to get specific object set mapped with passed key name.
        /// </summary>
        /// <param name="KeyName"></param>
        /// <returns></returns>
        public MappedDataWithKeyName CheckMappingSpecificKeyName(string KeyName)
        {
            var mappedDataWithKeyName = new MappedDataWithKeyName();
            if (MappedDataWithKeyNameList.MappedDataWithKeyNames != null && MappedDataWithKeyNameList.MappedDataWithKeyNames.Count > 0)
            {
                mappedDataWithKeyName = MappedDataWithKeyNameList.MappedDataWithKeyNames.Where(x => x.KeyName.ToLower() == KeyName.ToLower()).FirstOrDefault();
            }
            return mappedDataWithKeyName;
        }
    }
}
