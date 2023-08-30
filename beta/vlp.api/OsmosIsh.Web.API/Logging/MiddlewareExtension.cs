using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace OsmosIsh.Web.API.Logging
{
    public static class MiddlewareExtension
    {
        public static void ConfigureCustomApplicationMiddleware(this IApplicationBuilder app)
        {
            //app.UseMiddleware<ApplicationMiddleware>();
        }
    }
}
