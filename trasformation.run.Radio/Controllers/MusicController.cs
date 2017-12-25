using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Transformation.Run.Radio.Core;
using Transformation.Run.Radio.Data.Core;
using System.Threading;
using Microsoft.AspNetCore.Authorization;
using trasformation.run.Radio.Models;
using Google.Apis.YouTube.v3;
using Newtonsoft.Json;
using trasformation.run.Radio.Exstensions;
using System.Text;
using Transformation.Run.Radio.Core.Models;
using Transformation.Run.Radio.Middle.Core;
namespace trasformation.run.Radio.Controllers
{
    [Produces("application/json")]
    [Route("api/Music")]
    public class MusicController : Controller
    {
        protected IMusicSetMetadataProvider MetaData { get; private set; }
        protected IMusicSetMiddleware MusicMiddle { get; private set; }
        protected IMusicAdapter MusicAdapter { get; private set; }
        public MusicController(IMusicSetMetadataProvider metaData, IMusicSetMiddleware middle, IMusicAdapter musicAdapter)
        {
            this.MusicMiddle = middle;
            this.MetaData = metaData;
            this.MusicAdapter = musicAdapter;
        }

        [HttpPost("Next/{tenant?}")]
        public async Task<MusicSetViewModel> GetNextSet([FromBody]string musicSetId = null, string tenant = "jason", CancellationToken token = default(CancellationToken))
        {
            MusicSet set = await this.MusicMiddle.GetNextSet(tenant, musicSetId, token);
            return await this.MetaData.PopulateMetadata(set, token);
        }
        [HttpPost]
        [Authorize()]
        public Task SaveSet([FromBody]MusicSet set, CancellationToken token = default(CancellationToken))
        {
            if (this.User.HasClaim("http://schemas.microsoft.com/ws/2008/06/identity/claims/role", $"tenant:{set.Tenant}"))
                return this.MusicAdapter.SaveMusicSet(set, token);
            else throw new InvalidOperationException("User not authorized for tenant");
        }
        [HttpGet("{setId}")]
        public async Task<MusicSetViewModel> GetSet(string setId, CancellationToken token = default(CancellationToken))
        {
            var set = await this.MusicAdapter.GetSet(setId, token);
            return await this.MetaData.PopulateMetadata(set, token);
        }
    }
}