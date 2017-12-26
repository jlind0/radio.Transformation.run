using System;
using System.Collections.Generic;
using System.Text;
using Transformation.Run.Radio.Core;
using Transformation.Run.Radio.Core.Models;
using System.Threading;
using System.Threading.Tasks;

namespace Transformation.Run.Radio.Middle.Core
{
    public interface ISongMetadataProvider
    { 
        Task<SongViewModel> PopulateMetadata(Song song, string requestingRegion = null, CancellationToken token = default(CancellationToken));
    }
    public interface IMusicSetMetadataProvider
    {
        Task<MusicSetViewModel> PopulateMetadata(MusicSet set, string requestingRegion = null, CancellationToken token = default(CancellationToken));
    }
}
