using System;
using System.Collections.Generic;
using System.Text;
using Transformation.Run.Radio.Core;
using System.Threading.Tasks;
using System.Threading;

namespace Transformation.Run.Radio.Middle.Core
{
    public interface IMusicSetMiddleware
    {
        Task<MusicSet> GetNextSet(string tenant, string musicSetId = null, CancellationToken token = default(CancellationToken));
        Task DeleteSet(MusicSet set, CancellationToken token = default(CancellationToken));
    }
}
