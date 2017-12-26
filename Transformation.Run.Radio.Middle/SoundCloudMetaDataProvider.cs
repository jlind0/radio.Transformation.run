using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Transformation.Run.Radio.Core;
using Transformation.Run.Radio.Core.Models;
using Transformation.Run.Radio.Middle.Core;

namespace Transformation.Run.Radio.Middle
{
    public class SoundCloudMetaDataProvider : ISongMetadataProvider
    {
        public Task<SongViewModel> PopulateMetadata(Song song, string requestingRegion = null, CancellationToken token = default(CancellationToken))
        {
            return Task.FromResult(new SongViewModel()
            {
                Id = song.Id,
                Provider = song.Provider,
                Skip = song.Skip,
                Take = song.Take
            });
        }
    }
}
