using System;

using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Service.IService;

namespace OsmosIsh.Web.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class TemplateController : ControllerBase
    {
        [HttpGet]
        public ContentResult GetTemplateList()
        {
            var filePaths = Directory.GetFiles(Path.Combine(System.AppContext.BaseDirectory, "Templates"), "*.html");
            var html = "<ul>";
            foreach (var filePath in filePaths)
            {
                var fileName = Path.GetFileNameWithoutExtension(filePath);

                html += $"<li><a href='/api/Template/{fileName}' target='blank'>{fileName}</a></li>";
            }
            html += "</ul>";

            return new ContentResult
            {
                ContentType = "text/html",
                StatusCode = (int)HttpStatusCode.OK,
                Content = $"<html><body>{html}</body></html>"
            };
        }

        [HttpGet("{templateName}")]
        public ContentResult GetTemplateDetail(string templateName)
        {
            var html = CommonFunction.GetTemplateFromHtml(templateName + ".html");
            return new ContentResult
            {
                ContentType = "text/html",
                StatusCode = (int)HttpStatusCode.OK,
                Content = $"<html><body>{html}</body></html>"
            };
        }
    }
}