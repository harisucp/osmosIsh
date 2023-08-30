using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.Shared.Helper;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Service.IService;
using System;
using System.Reflection;

namespace OsmosIsh.Service.Common.CommonSave
{
    public class BindPreCommonSaveEvent
    {
        /// <summary>
        /// This function is used to bind pre event for common save on the basis of class name and method specify in request.
        /// </summary>
        /// <param name="request"></param>
        /// <param name="commonService"></param>
        public static void BindPreEvent(SaveRequest request, ref ICommonService commonService)
        {
            var readDataJsonFile = new ReadDataJsonFile();
            var mappedDataWithEntityName = readDataJsonFile.CheckMappingSpecificEntityName(request.EntityName);

            if (mappedDataWithEntityName != null && mappedDataWithEntityName.MapPrePostMethod != null && !string.IsNullOrWhiteSpace(mappedDataWithEntityName.MapPrePostMethod.PreMethodClassFullPath))
            {
                Type type = Type.GetType(mappedDataWithEntityName.MapPrePostMethod.PreMethodClassFullPath);
                if (type != null && !string.IsNullOrWhiteSpace(mappedDataWithEntityName.MapPrePostMethod.PreMethodName))
                {
                    var methodInfo = type.GetMethod(mappedDataWithEntityName.MapPrePostMethod.PreMethodName, BindingFlags.Public | BindingFlags.Instance);
                    var eventInfo = commonService.GetType().GetEvent("PreSaved");
                    var del = Delegate.CreateDelegate(eventInfo.EventHandlerType, null, methodInfo);
                    eventInfo.AddEventHandler(commonService, del);
                }
            }
        }
    }
}
