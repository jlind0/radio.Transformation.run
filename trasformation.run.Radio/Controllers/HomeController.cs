using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using trasformation.run.Radio.Models;
using Transformation.Run.Radio.Core;
using Transformation.Run.Radio.Data.Core;
using System.Threading;

namespace trasformation.run.Radio.Controllers
{
    public class HomeController : Controller
    {
        protected ITenantDataAdapter TenantAdapter { get; private set; }
        public HomeController(ITenantDataAdapter tenantAdapter)
        {
            this.TenantAdapter = tenantAdapter;
        }
        [Route("{tenant?}")]
        public async Task<IActionResult> Index(string tenant = "jason", CancellationToken token = default(CancellationToken))
        {
            return View(await this.TenantAdapter.GetTenant(tenant, token));
        }
        
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
