using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json;
using OsmosIsh.Core.AutoMapper;
using OsmosIsh.Core.Shared.Common;
using OsmosIsh.Core.Shared.Helper;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Repository.Common;
using OsmosIsh.Repository.IRepository;
using OsmosIsh.Repository.Repository;
using OsmosIsh.Service.IService;
using OsmosIsh.Service.Service;
using OsmosIsh.Web.API.Filter;
using OsmosIsh.Web.API.Logging;
using Quartz.Impl;

namespace OsmosIsh.Web.API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // configure strongly typed settings objects
            var appSettingsSection = Configuration.GetSection("AppSettings");
            var appSettings = appSettingsSection.Get<AppSettings>();

            // Set all appsetting configuration in static object 
            AppSettingConfigurations.AppSettings = appSettings;

            //paypal configuration
            var paypalSection = Configuration.GetSection("paypal");
            var paypalSettings = paypalSection.Get<PaypalSettings>();

            // Set all appsetting configuration in static object 
            AppSettingConfigurations.PaypalSettings = paypalSettings;

            //Quartz scheduler
            var scheduler = StdSchedulerFactory.GetDefaultScheduler().GetAwaiter().GetResult();
            services.AddSingleton(scheduler);
            services.AddSingleton<JobScheduler>();
            services.AddSingleton<ReCaptureJobScheduler>();
            services.AddSingleton<RefundJobScheduler>();
            services.AddSingleton<SessionReminderJobScheduler>();
            services.AddSingleton<AffiliatePayoutScheduler>();
            JobScheduler.Start();
            ReCaptureJobScheduler.Start();
            RefundJobScheduler.Start();
            SessionReminderJobScheduler.Start();
            AffiliatePayoutScheduler.Start();

            // DBContext
            var connection = Configuration.GetConnectionString("ApplicationContext");
            services.AddDbContext<OsmosIshContext>(options =>
            options.UseSqlServer(connection), ServiceLifetime.Transient);

            if (appSettings.EnableSwagger)
            {
                // Register the Swagger generator, defining 1 or more Swagger documents
                services.AddSwaggerGen(c =>
                {
                    c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });
                    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                    {
                        Description = @"JWT Authorization header using the Bearer scheme. \r\n\r\n 
                      Enter 'Bearer' [space] and then your token in the text input below.
                      \r\n\r\nExample: 'Bearer 12345abcdef'",
                        Name = "Authorization",
                        In = ParameterLocation.Header,
                        Type = SecuritySchemeType.ApiKey,
                        Scheme = "Bearer"
                    });
                    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
                    {
                {
                    new OpenApiSecurityScheme
                    {
                    Reference = new OpenApiReference
                        {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                        },
                        Scheme = "oauth2",
                        Name = "Bearer",
                        In = ParameterLocation.Header,

                    },
                    new List<string>()
                    }
                    });
                    // Added xml to include comment in swagger
                    var apiXmlfilePath = Path.Combine(System.AppContext.BaseDirectory, "OsmosIsh.Web.API.xml");
                    c.IncludeXmlComments(apiXmlfilePath);
                    var coreXmlFilePath = Path.Combine(System.AppContext.BaseDirectory, "OsmosIsh.Core.xml");
                    c.IncludeXmlComments(coreXmlFilePath);
                    // Added custom filter lists an additional "401" response for all actions that are decorated with the AuthorizeAttribute
                    c.OperationFilter<AuthResponsesOperationFilter>();
                });
            }

            // Auto Mapper Configurations
            var mappingConfig = new MapperConfiguration(mc =>
            {
                mc.AddProfile(new AutoMapping());
            });
            IMapper mapper = mappingConfig.CreateMapper();
            services.AddSingleton(mapper);

            // Handle CORS
            services.AddCors();

            //Dependency injection in ASP.NET Core (Services)
            services.AddTransient<IUserService, UserService>();
            services.AddTransient<ICommonService, CommonService>();
            services.AddTransient<IAPIErrorLogService, APIErrorLogService>();
            services.AddTransient<ISubscriptionService, SubscriptionService>();
            services.AddTransient<ISessionService, SessionService>();
            services.AddTransient<ISeriesService, SeriesService>();
            services.AddTransient<ITeacherService, TeacherService>();
            services.AddTransient<IStudentService, StudentService>();
            services.AddTransient<IEnrollmentService, EnrollmentService>();
            services.AddTransient<IAmazonChimeService, AmazonChimeService>();
            services.AddTransient<IPaymentService, PaymentService>();
            services.AddTransient<IAdminCouponService, AdminCouponService>();
            services.AddTransient<IAdminAffiliateService, AdminAffiliateService>();


            //Dependency injection in ASP.NET Core (Repositories)
            services.AddTransient(typeof(IBaseRepository<>), typeof(BaseRepository<>));
            services.AddTransient<IUserRepository, UserRepository>();
            services.AddTransient<ICommonRepository, CommonRepository>();
            services.AddTransient<IAPIErrorLogRepository, APIErrorLogRepository>();
            services.AddTransient<ISubscriptionRepository, SubscriptionRepository>();
            services.AddTransient<ISessionRepository, SessionRepository>();
            services.AddTransient<ISeriesRepository, SeriesRepository>();
            services.AddTransient<ITeacherRepository, TeacherRepository>();
            services.AddTransient<IStudentRepository, StudentRepository>();
            services.AddTransient<IEnrollmentRepository, EnrollmentRepository>();
            services.AddTransient<IAmazonChimeRepository, AmazonChimeRepository>();
            services.AddTransient<IPaymentRepository, PaymentRepository>();
            services.AddTransient<IAdminCouponRepository, AdminCouponRepository>();
            services.AddTransient<IAdminAffiliateRepository, AdminAffiliateRepository>();
            
            services.AddControllers();


            // Configure jwt authentication
            var key = Encoding.ASCII.GetBytes(appSettings.Secret);

             services.AddAuthentication(x =>  
            {  
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;  
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;  
            })  
            .AddJwtBearer(x =>  
            {  
                x.TokenValidationParameters = new TokenValidationParameters  
                {  
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),  
                    ValidateIssuer = true,  
                    ValidateAudience = true,  
                    ValidIssuer = appSettings.ValidIssuer,  
                    ValidAudience = appSettings.ValidAudience  
                };  
            }); 

            #region Read from files store then in static class object.
            // Read MappedDataWithEntityName Json File
            string mappedDataWithEntityNameJsonString = CommonFunction.GetDataFromJsonFile("MappedDataWithEntity.json");
            MappedDataWithEntityNameList.MappedDataWithEntityNames = JsonConvert.DeserializeObject<List<MappedDataWithEntityName>>(mappedDataWithEntityNameJsonString);

            // Read MappedDataWithKeyName Json File
            string mappedDataWithScreenNameJsonString = CommonFunction.GetDataFromJsonFile("MappedDataWithKeyName.json");
            MappedDataWithKeyNameList.MappedDataWithKeyNames = JsonConvert.DeserializeObject<List<MappedDataWithKeyName>>(mappedDataWithScreenNameJsonString);

            #endregion

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseStaticFiles();
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            if (AppSettingConfigurations.AppSettings.EnableSwagger)
            {
                // Enable middleware to serve generated Swagger as a JSON endpoint.
                app.UseSwagger();

                // Enable middleware to serve swagger-ui (HTML, JS, CSS, etc.),
                // specifying the Swagger JSON endpoint.
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("./swagger/v1/swagger.json", "OsmosIsh API V1.0");
                    c.RoutePrefix = string.Empty;
                });
            }
            app.UseHttpsRedirection();

            app.UseRouting();

            // global cors policy
            app.UseCors(x => x
                .AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader());

            app.UseAuthentication();
            app.UseAuthorization();

            app.ConfigureCustomApplicationMiddleware();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });;

        }
    }
}
