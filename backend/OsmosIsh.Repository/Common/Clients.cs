using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response.Common;
using OsmosIsh.Core.Shared.Helper;
using OsmosIsh.Core.Shared.Static;
using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Repository.Common
{
    public class Clients
    {
        public PostSaveResponse OnClientPostSaved(object source, PostSaveEventArgs args)
        {
            Console.WriteLine(args.SaveRequest);
            int entityCount = 0;
            //List of all Entites that are changed.
            foreach (var entry in args.ModifiedEntities)
            {
                EntriesState entriesState = ((OsmosIsh.Repository.Repository.CommonRepository)source)._EntriesStates[entityCount];
                if (entriesState.EntityState.ToString() == "Added")
                {
                    CommonFunction.GetPrimaryKeyValue(entry.Entity, ((OsmosIsh.Repository.Repository.CommonRepository)source)._ObjContext);
                }
                else if (entriesState.EntityState.ToString() == "Modified")
                {
                    CommonFunction.GetPrimaryKeyValue(entry.Entity, ((OsmosIsh.Repository.Repository.CommonRepository)source)._ObjContext);
                }
                entityCount++;
            }
            var PostSaveResponse = new PostSaveResponse();
            return PostSaveResponse;
        }
    }
}
