using System;
using System.Collections.Generic;
using System.Text;
using Transformation.Run.Radio.Core;
using System.Threading.Tasks;
using System.Threading;
using Transformation.Run.Radio.Middle.Core;
using Transformation.Run.Radio.Data.Core;

namespace Transformation.Run.Radio.Middle
{
    public class MusicSetMiddleware : IMusicSetMiddleware
    {
        protected IMusicAdapter MusicAdapter { get; private set; }
        protected ICurrentSetAdapter CurrentSetAdapter { get; private set; }
        public MusicSetMiddleware(IMusicAdapter adapter, ICurrentSetAdapter currentSet)
        {
            this.MusicAdapter = adapter;
            this.CurrentSetAdapter = currentSet;
        }
        public async Task<MusicSet> GetNextSet(string tenant, string musicSetId = null, CancellationToken token = default(CancellationToken))
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
            return set;
        }
    }
}
