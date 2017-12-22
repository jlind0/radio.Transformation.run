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

namespace trasformation.run.Radio.Controllers
{
    [Produces("application/json")]
    [Route("api/Music")]
    public class MusicController : Controller
    {
        protected IMusicAdapter MusicAdapter { get; private set; }
        public MusicController(IMusicAdapter musicAdapter)
        {
            this.MusicAdapter = musicAdapter;
        }

        [HttpPost("Next")]
        public Task<MusicSet> GetNextSet([FromBody]string[] excludes, CancellationToken token = default(CancellationToken))
        {
            return this.MusicAdapter.GetNextSet(excludes, token);
        }
        [HttpPost]
        [Authorize()]
        public Task SaveSet([FromBody]MusicSet set, CancellationToken token = default(CancellationToken))
        {
            return this.MusicAdapter.SaveMusicSet(set, token);
        }
    }
}