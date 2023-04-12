using Newtonsoft.Json;
using OsmosIsh.Core.DTOs.Response;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;

namespace OsmosIsh.Core.Shared.Static
{
    public static class Mapper
    {
        public static string Convert<T>(MainResponse mainReponse)
        {

            Response<T> response = new Response<T>();
            response.Message = mainReponse.Message;
            response.Success = mainReponse.Success;

            if (mainReponse.Success == true)
            {
                string genericClassName = typeof(T).Name;
                PropertyInfo propertyData = mainReponse.GetType().GetProperty(genericClassName);
                T data = (T)(propertyData.GetValue(mainReponse, null));
                response.Data = data;
            }
            return JsonConvert.SerializeObject(response);
        }
        public static string ConvertWithoutNull<T>(MainResponse mainReponse)
        {

            Response<T> response = new Response<T>();
            response.Message = mainReponse.Message;
            response.Success = mainReponse.Success;
            string genericClassName = typeof(T).Name;
            PropertyInfo propertyData = mainReponse.GetType().GetProperty(genericClassName);
            T data = (T)(propertyData.GetValue(mainReponse, null));
            response.Data = data;
            return JsonConvert.SerializeObject(response, Newtonsoft.Json.Formatting.None,
                            new JsonSerializerSettings
                            {
                                NullValueHandling = NullValueHandling.Ignore
                            });
        }
    }
}
