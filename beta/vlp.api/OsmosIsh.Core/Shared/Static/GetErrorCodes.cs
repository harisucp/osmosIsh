using OsmosIsh.Core.Enums;
using System;
using System.Collections.Generic;
using System.Net;
using System.Text;

namespace OsmosIsh.Core.Shared.Static
{
    public class GetErrorCodes
    {
        /// <summary>  
        /// This method will return the status code based on the exception type.  
        /// </summary>  
        /// <param name="exceptionType"></param>  
        /// <returns>HttpStatusCode</returns>  
        public static HttpStatusCode GetErrorCode(Type exceptionType)
        {
            Exceptions tryParseResult;
            if (Enum.TryParse<Exceptions>(exceptionType.Name, out tryParseResult))
            {
                switch (tryParseResult)
                {
                    case Exceptions.NullReferenceException:
                        return HttpStatusCode.LengthRequired;

                    case Exceptions.FileNotFoundException:
                        return HttpStatusCode.NotFound;

                    case Exceptions.OverflowException:
                        return HttpStatusCode.RequestedRangeNotSatisfiable;

                    case Exceptions.OutOfMemoryException:
                        return HttpStatusCode.ExpectationFailed;

                    case Exceptions.InvalidCastException:
                        return HttpStatusCode.PreconditionFailed;

                    case Exceptions.ObjectDisposedException:
                        return HttpStatusCode.Gone;

                    case Exceptions.UnauthorizedAccessException:
                        return HttpStatusCode.Unauthorized;

                    case Exceptions.NotImplementedException:
                        return HttpStatusCode.NotImplemented;

                    case Exceptions.NotSupportedException:
                        return HttpStatusCode.NotAcceptable;

                    case Exceptions.InvalidOperationException:
                        return HttpStatusCode.MethodNotAllowed;

                    case Exceptions.TimeoutException:
                        return HttpStatusCode.RequestTimeout;

                    case Exceptions.ArgumentException:
                        return HttpStatusCode.BadRequest;

                    case Exceptions.StackOverflowException:
                        return HttpStatusCode.RequestedRangeNotSatisfiable;

                    case Exceptions.FormatException:
                        return HttpStatusCode.UnsupportedMediaType;

                    case Exceptions.IOException:
                        return HttpStatusCode.NotFound;

                    case Exceptions.IndexOutOfRangeException:
                        return HttpStatusCode.ExpectationFailed;

                    default:
                        return HttpStatusCode.InternalServerError;
                }
            }
            else
            {
                return HttpStatusCode.InternalServerError;
            }
        }
    }
}
