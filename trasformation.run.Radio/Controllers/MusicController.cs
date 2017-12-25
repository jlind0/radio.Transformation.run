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
        protected ISongMetadataProvider YouTube { get; private set; }
        protected IMusicSetMiddleware MusicMiddle { get; private set; }
        public MusicController(ISongMetadataProvider youTube, IMusicSetMiddleware middle)
        {
            this.MusicMiddle = middle;
            this.YouTube = youTube;
        }

        [HttpPost("Next/{tenant?}")]
        public async Task<MusicSetViewModel> GetNextSet([FromBody]string musicSetId = null, string tenant = "jason", CancellationToken token = default(CancellationToken))
        {
            MusicSet set = await this.MusicMiddle.GetNextSet(tenant, musicSetId, token);
            MusicSetViewModel msvm = new MusicSetViewModel()
            {
                id = set.id,
                Name = set.Name,
                Tenant = tenant
            };
            List<SongViewModel> svms = new List<SongViewModel>();
            foreach (var song in set.Songs)
            {
                var svm = await this.YouTube.PopulateMetadata(song, token);
                if (svm != null)
                    svms.Add(svm);
            }
            msvm.Songs = svms.ToArray();
            return msvm;
        }
        //[HttpPost]
        //[Authorize()]
        //public Task SaveSet([FromBody]MusicSet set, CancellationToken token = default(CancellationToken))
        //{
        //    return this.MusicAdapter.SaveMusicSet(set, token);
        //}
    }
}