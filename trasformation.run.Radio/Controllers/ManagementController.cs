using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Transformation.Run.Radio.Data.Core;
using System.Threading;
using trasformation.run.Radio.Models;

namespace trasformation.run.Radio.Controllers
{
    [Authorize]
    [Route("Management")]
    public class ManagementController : Controller
    { 
        protected ITenantDataAdapter TenantAdapter { get; private set; }
        protected IMusicAdapter MusicAdapter { get; private set; }
        public ManagementController(ITenantDataAdapter tenantAdapter, IMusicAdapter music)
        {
            this.TenantAdapter = tenantAdapter;
            this.MusicAdapter = music;
        }
        public async Task<IActionResult> Index(CancellationToken token = default(CancellationToken))
        {
           
            return View((await this.TenantAdapter.GetTenantsByClaims(this.User.Claims.Where(c =>
                c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role").Select(c => c.Value).ToArray(), token)).ToArray());
        }
        [Route("tenant/{tenantId?}")]
        public async Task<IActionResult> Tenant(string tenantId, CancellationToken token = default(CancellationToken))
        {
            var tenant = await this.TenantAdapter.GetTenant(tenantId, token);
            var sets = await this.MusicAdapter.GetMusicSets(tenantId, token);
            return View( new TenantViewModel()
            {
                Tenant = tenant,
                Sets = sets
            });
        }
        [Route("tenant/{tenantId}/sets/{setId?}")]
        public IActionResult MusicSet(string tenantId, string setId = null)
        {
            return View(new TenantMusicSet(tenantId, setId));
        }
    }
}