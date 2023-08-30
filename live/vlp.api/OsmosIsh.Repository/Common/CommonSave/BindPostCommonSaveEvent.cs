using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.Shared.Helper;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Repository.IRepository;
using System;
using System.Reflection;

namespace OsmosIsh.Repository.Common.CommonSave
{
    public class BindPostCommonSaveEvent
    {
        /// <summary>
        /// This function is used to bind post event for common save on the basis of class name and method specify in request.
        /// </summary>
        /// <param name="request"></param>
        /// <param name="commonRepository"></param>
        public static void BindPostEvent(SaveRequest request, ref ICommonRepository commonRepository)
        {
            var readDataJsonFile = new ReadDataJsonFile();
            var mappedDataWithEntityName = readDataJsonFile.CheckMappingSpecificEntityName(request.EntityName);

            if (mappedDataWithEntityName != null && mappedDataWithEntityName.MapPrePostMethod != null && !string.IsNullOrWhiteSpace(mappedDataWithEntityName.MapPrePostMethod.PostMethodClassFullPath))
            {
                Type type = Type.GetType(mappedDataWithEntityName.MapPrePostMethod.PostMethodClassFullPath);
                if (type != null && !string.IsNullOrWhiteSpace(mappedDataWithEntityName.MapPrePostMethod.PostMethodName))
                {
                    var methodInfo = type.GetMethod(mappedDataWithEntityName.MapPrePostMethod.PostMethodName, BindingFlags.Public | BindingFlags.Instance);
                    var eventInfo = commonRepository.GetType().GetEvent("PostSaved");
                    var del = Delegate.CreateDelegate(eventInfo.EventHandlerType, null, methodInfo);
                    eventInfo.AddEventHandler(commonRepository, del);
                }
            }
        }
    }
}
