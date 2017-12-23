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
namespace trasformation.run.Radio.Controllers
{
    [Produces("application/json")]
    [Route("api/Music")]
    public class MusicController : Controller
    {
        protected IMusicAdapter MusicAdapter { get; private set; }
        protected YouTubeService YouTube { get; private set; }
        protected ITopicClientFactory TopicFactory { get; private set; }
        protected ICurrentSetAdapter CurrentSetAdapter { get; private set; }
        public MusicController(IMusicAdapter musicAdapter, YouTubeService youTube, ICurrentSetAdapter currentSet)
        {
            this.MusicAdapter = musicAdapter;
            this.YouTube = youTube;
            this.CurrentSetAdapter = currentSet;
        }

        [HttpPost("Next/{tenant?}")]
        public async Task<MusicSetViewModel> GetNextSet([FromBody]string musicSetId = null, string tenant = "jason", CancellationToken token = default(CancellationToken))
        {
            var currentSet = await this.CurrentSetAdapter.GetCurrentSet(tenant, token);
            MusicSet set = null;
            if (currentSet == null || musicSetId == currentSet?.CurrentId)
            {
                Queue<string> excludes = new Queue<string>((currentSet == null ?
                        new string[] { } :
                           (currentSet.Excludes ?? (new string[] { }))));
                if (currentSet != null)
                    excludes.Enqueue(currentSet.CurrentId);
                else if (musicSetId != null)
                    excludes.Enqueue(musicSetId);
                if (excludes.Count > 7)
                    excludes.Dequeue();
                set = await this.MusicAdapter.GetNextSet(tenant, excludes.ToArray(), token);
            }
            else
                set = await this.MusicAdapter.GetSet(currentSet.CurrentId, token);

            if (set.id != currentSet?.CurrentId)
            {
                var excludes = currentSet?.Excludes ?? new string[] { };
                Queue<string> exQueue = new Queue<string>(excludes);
                if (musicSetId != null)
                    exQueue.Enqueue(musicSetId);
                if (exQueue.Count > 7)
                    exQueue.Dequeue();
                CurrentSet newSet = new CurrentSet()
                {
                    CurrentId = set.id,
                    Excludes = exQueue.ToArray(),
                    id = currentSet?.id,
                    Tenant = set.Tenant
                };
                await this.CurrentSetAdapter.SetCurrentSet(newSet, token);
            }
      
            MusicSetViewModel msvm = new MusicSetViewModel()
            {
                id = set.id,
                Name = set.Name
            };
            List<SongViewModel> svms = new List<SongViewModel>();
            foreach (var song in set.Songs)
            {
                var request = this.YouTube.Videos.List("snippet");
                request.Id = song.Id;
                var response = await request.ExecuteAsync(token);
                var video = response.Items.SingleOrDefault();
                if (video != null)
                {
                    svms.Add(new SongViewModel()
                    {
                        Id = video.Id,
                        Name = video.Snippet.Title,
                        Skip = song.Skip,
                        Take = song.Take
                    });
                }
            }
            msvm.Songs = svms.ToArray();
            return msvm;
        }
        [HttpPost]
        [Authorize()]
        public Task SaveSet([FromBody]MusicSet set, CancellationToken token = default(CancellationToken))
        {
            return this.MusicAdapter.SaveMusicSet(set, token);
        }
    }
}