using System;
using System.Collections.Generic;
using System.Text;
using Transformation.Run.Radio.Core;
using Transformation.Run.Radio.Core.Models;
using Transformation.Run.Radio.Middle.Core;
using Google.Apis.YouTube.v3;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;

namespace Transformation.Run.Radio.Middle
{
    public class YouTubeMetadataProvider : ISongMetadataProvider
    {
        protected YouTubeService YouTube { get; private set; }
        public YouTubeMetadataProvider(YouTubeService youTube)
        {
            this.YouTube = youTube;
        }
        public async Task<SongViewModel> PopulateMetadata(Song song, CancellationToken token = default(CancellationToken))
        {
            var request = this.YouTube.Videos.List("snippet");
            request.Id = song.Id;
            var response = await request.ExecuteAsync(token);
            var video = response.Items.SingleOrDefault();
            if (video != null)
                return new SongViewModel()
                {
                    Id = video.Id,
                    Name = video.Snippet.Title,
                    Skip = song.Skip,
                    Take = song.Take
                };
            return null;
        }
    }
}
