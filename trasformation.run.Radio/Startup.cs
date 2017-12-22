using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Swashbuckle.AspNetCore.Swagger;
using StructureMap;
using Transformation.Run.Radio.Core;
using Transformation.Run.Radio.Data.Core;
using Transformation.Run.Radio.Data;
using Microsoft.AspNetCore.Owin;
using Google.Apis.YouTube.v3;
using Google.Apis.Services;

namespace trasformation.run.Radio
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;

        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public IServiceProvider ConfigureServices(IServiceCollection services)
        {
            services.AddMvc().AddControllersAsServices();
            services.AddCors(options =>
            {

                options.AddPolicy("AllowAll", p => p.AllowAnyOrigin()
                                                    .AllowAnyMethod()
                                                    .AllowAnyHeader());
            });
            
            var songsToken = new CosmosDataToken(
                new Uri(Configuration["CosmosDB:Path"]),
                Configuration["CosmosDB:Key"],
                Configuration["CosmosDB:Database"],
                Configuration["CosmosDB:Collections:Songs"]);
            services.AddSwaggerGen(gen =>
            {
                gen.CustomSchemaIds(x => x.FullName);
                gen.SwaggerDoc("v1", new Info() { Title = "Radio.Transformation.run API", Version = "v1" });

            });
            services.AddAuthentication(options =>
            {
                options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
            })
            .AddAzureAd(options => Configuration.Bind("AzureAd", options))
            .AddCookie();
            Container container = new Container();
            container.Configure(config =>
            {
                config.For<CosmosDataToken>().Add(songsToken).Named("Songs");
                config.For<IMusicAdapter>().Use<MusicAdapter>().
                    Ctor<CosmosDataToken>().IsNamedInstance("Songs");
                config.For<YouTubeService>().Use(() => new YouTubeService(new BaseClientService.Initializer()
                {
                    ApiKey = Configuration["Google:DataKey"],
                    ApplicationName = "radio-transformation-run"
                }));
                config.Populate(services);
            });
            
            return container.GetInstance<IServiceProvider>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }
            
            app.UseStaticFiles();
            app.UseCors("AllowAll");
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("v1/swagger.json", "Radio.Transformation.run API");

            });
            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
        }
    }
}
