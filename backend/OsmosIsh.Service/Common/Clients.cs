using Newtonsoft.Json;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response.Common;
using OsmosIsh.Core.Shared.Static;
using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Service.Common
{
    public class Clients
    {
        public PreSaveResponse OnClientPreSaved(object source, PreSaveEventArgs args)
        {
            var PreSaveResponse = new PreSaveResponse();
            string entityPath = CommonFunction.GetEntityPath(args.SaveRequest.EntityName);
            Type type = CommonFunction.GetType(entityPath);
            foreach (object obj in args.SaveRequest.Data)
            {
                var entity = JsonConvert.DeserializeObject(obj.ToString(), type);
                if (entity.GetType().GetProperty("FirstName").GetValue(entity, null) == null)
                {
                    PreSaveResponse.Message = "FirstName is required.";
                    PreSaveResponse.Success = false;
                }
            }
            return PreSaveResponse;
        }
    }
}
