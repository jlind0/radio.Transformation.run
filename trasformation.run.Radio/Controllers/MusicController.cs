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
using Google.Apis.YouTube.v3.Data;
using Google.Apis.YouTube.v3;
namespace trasformation.run.Radio.Controllers
{
    [Produces("application/json")]
    [Route("api/Music")]
    public class MusicController : Controller
    {
        protected IMusicAdapter MusicAdapter { get; private set; }
        protected YouTubeService YouTube { get; private set; }
        public MusicController(IMusicAdapter musicAdapter, YouTubeService youTube)
        {
            this.MusicAdapter = musicAdapter;
            this.YouTube = youTube;
        }

        [HttpPost("Next")]
        public async Task<MusicSetViewModel> GetNextSet([FromBody]string[] excludes, CancellationToken token = default(CancellationToken))
        {
            var set = await this.MusicAdapter.GetNextSet(excludes, token);
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
                if(video != null)
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