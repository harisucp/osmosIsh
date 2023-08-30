using AutoMapper;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.DTOs.Response.Common;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Repository.Common;
using OsmosIsh.Service.IService;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;


namespace OsmosIsh.Web.API.Logging
{
    public class ApplicationMiddleware
    {
        private readonly RequestDelegate _next;
        //private int APILoggedId = -1;
        public ApplicationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext httpContext, IMapper _mapper, IAPIErrorLogService _APIErrorLogService)
        {
            var apiLogRequest = new APILogRequest();

            //Copy a pointer to the original response body stream
            var originalBodyStream = httpContext.Response.Body;

            try
            {
                using (var responseBodyStream = new MemoryStream())
                {
                    if (AppSettingConfigurations.AppSettings.EnableAPILog)
                    {
                        httpContext.Request.EnableBuffering();
                        //First, get the incoming request
                        apiLogRequest.APIParams = await FormatRequest.FormatRequestBody(httpContext.Request);
                        httpContext.Request.Body.Seek(0, SeekOrigin.Begin);


                        //Read API URL
                        string host = httpContext.Request.Host.ToString();
                        string prefix = host.Contains("localhost") ? "" : "/api";

                        apiLogRequest.APIUrl = httpContext.Request.Scheme + "://" + httpContext.Request.Host + prefix + httpContext.Request.Path;

                        //Read Authorization Header
                        apiLogRequest.Headers = httpContext.Request.Headers["Authorization"];

                        // Read Method
                        apiLogRequest.Method = httpContext.Request.Method;
                        apiLogRequest.APILogId = await _APIErrorLogService.InserAPILogToDB(apiLogRequest);
                    }

                    httpContext.Response.Body = responseBodyStream;

                    await _next(httpContext);

                    //Format the response from the server
                    var response = FormatResponse(httpContext.Response, httpContext);

                    //Copy the contents of the new memory stream (which contains the response) to the original stream, which is then returned to the client.
                    await responseBodyStream.CopyToAsync(originalBodyStream);

                    await _APIErrorLogService.UpdateAPILogToDB(new UpdateAPILogRequest() { APILogId = apiLogRequest.APILogId, Success = true });
                }
            }
            catch (Exception ex)
            {
                httpContext.Response.Body = originalBodyStream;
                await HandleExceptionAsync(httpContext, ex, apiLogRequest, _APIErrorLogService, _mapper);
            }
        }

        private Task HandleExceptionAsync(HttpContext context, Exception exception, APILogRequest apiLogRequest, IAPIErrorLogService _APIErrorLogService, IMapper _mapper)
        {
            HttpStatusCode statusCode = (exception as WebException != null &&
                        ((HttpWebResponse)(exception as WebException).Response) != null) ?
                         ((HttpWebResponse)(exception as WebException).Response).StatusCode
                         : GetErrorCodes.GetErrorCode(exception.GetType());
            context.Response.StatusCode = (int)statusCode;
            context.Response.ContentType = "application/json";

            switch (AppSettingConfigurations.AppSettings.ErrorLoggingType.ToLower())
            {
                case "both":
                    {
                        LogExceptionInDB(exception, apiLogRequest, _APIErrorLogService, _mapper);
                        PostMessage(exception, apiLogRequest);
                        break;
                    }
                case "db":
                    {
                        LogExceptionInDB(exception, apiLogRequest, _APIErrorLogService, _mapper);
                        break;
                    }
                case "slack":
                    {
                        PostMessage(exception, apiLogRequest);
                        break;
                    }
                default:
                    break;
            }

            return context.Response.WriteAsync(new ErrorDetailResponse()
            {
                StatusCode = context.Response.StatusCode,
                Message = ErrorMessages.INTERNAL_SERVER_ERROR,
                Success = false
            }.ToString());
        }

        private void LogExceptionInDB(Exception exception, APILogRequest APILogRequest, IAPIErrorLogService _APIErrorLogService, IMapper _mapper)
        {
            var updateAPILogRequest = new UpdateAPILogRequest();
            updateAPILogRequest.ExceptionMsg = exception.Message;
            updateAPILogRequest.ExceptionType = exception.GetType().Name;
            updateAPILogRequest.ExceptionSource = GenerateExceptionMessage(exception, APILogRequest);
            updateAPILogRequest.APILogId = APILogRequest.APILogId;
            _APIErrorLogService.UpdateAPILogToDB(updateAPILogRequest);
        }


        private void PostMessage(Exception exception, APILogRequest APILogRequest)
        {
            Payload payload = new Payload()
            {
                Channel = null,
                Username = null,
                Text = GenerateExceptionMessage(exception, APILogRequest)
            };
            string payloadJson = JsonConvert.SerializeObject(payload);

            using (WebClient client = new WebClient())
            {
                NameValueCollection data = new NameValueCollection();
                data["payload"] = payloadJson;

                var response = client.UploadValues(AppSettingConfigurations.AppSettings.SlackErrorLogPath, "POST", data);

                Encoding _encoding = new UTF8Encoding();
                //The response text is usually "ok"
                string responseText = _encoding.GetString(response);
            }
        }

        public string GenerateExceptionMessage(Exception exception, APILogRequest APILogRequest)
        {
            return "APIURL : " + APILogRequest.APIUrl + System.Environment.NewLine + "APIParams : " + APILogRequest.APIParams + System.Environment.NewLine + "Method : " + APILogRequest.Method + System.Environment.NewLine +
           "Error Message : " + exception.Message + System.Environment.NewLine + "Inner Exception : " + exception.InnerException + System.Environment.NewLine +
           "Source : " + exception.Source + System.Environment.NewLine + "StackTrace : " + exception.StackTrace;
        }
        private async Task<string> FormatResponse(HttpResponse response, HttpContext httpContext)
        {
            //We need to read the response stream from the beginning...
            response.Body.Seek(0, SeekOrigin.Begin);

            //...and copy it into a string
            string text = await new StreamReader(response.Body).ReadToEndAsync();

            //We need to reset the reader for the response so that the client can read it.
            response.Body.Seek(0, SeekOrigin.Begin);

            BaseResponse baseResponse = JsonConvert.DeserializeObject<BaseResponse>(text);
            if (baseResponse != null && baseResponse.Success != true)
            {
                response.StatusCode = 500;
            }

            //Return the string for the response, including the status code (e.g. 200, 404, 401, etc.)
            return $"{response.StatusCode}: {text}";
        }
    }
}
