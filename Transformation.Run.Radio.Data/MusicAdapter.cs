using System;
using System.Collections.Generic;
using System.Text;
using Transformation.Run.Radio.Data.Core;
using Transformation.Run.Radio.Core;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;
using Microsoft.Azure.Documents.Client;
using Microsoft.Azure.Documents.Linq;
namespace Transformation.Run.Radio.Data
{
    public class MusicAdapter : CosmosDataAdapter, IMusicAdapter
    {
        public MusicAdapter(CosmosDataToken token) : base(token)
        {
        }
        public async Task<IEnumerable<MusicSet>> GetMusicSets(string tenantId, CancellationToken token = default(CancellationToken))
        {
            List<MusicSet> sets = new List<MusicSet>();
            await UseClient(async client =>
            {
                var query = CreateQuery<MusicSet>(client).Where(m => m.Tenant == tenantId).AsDocumentQuery();
                while(query.HasMoreResults)
                {
                    sets.AddRange(await query.ExecuteNextAsync<MusicSet>(token));
                }
            });
            return sets;
        }

        public async Task<MusicSet> GetNextSet(string tenant, string[] excludeIds = null,  CancellationToken token = default(CancellationToken))
        {
            if (excludeIds?.Length == 0)
                excludeIds = null;
            string eQuery = excludeIds?.Select(e => $"'{e}'").Aggregate((working, next) => working += $",{next}");
            MusicSet set = null;
            await UseClient(async client =>
            {
                var proc = await client.ExecuteStoredProcedureAsync<MusicSet>("dbs/NER-AA==/colls/NER-AKrObgA=/sprocs/NER-AKrObgABAAAAAAAAgA==/", eQuery, tenant);
                set = proc.Response;
            });
            return set;
        }

        public async Task<MusicSet> GetSet(string id, CancellationToken token = default(CancellationToken))
        {
            MusicSet set = null;
            await UseClient(async client =>
            {
                var query = CreateQuery<MusicSet>(client, new FeedOptions() { MaxItemCount = 1 }).Where(
                    s => s.id == id).AsDocumentQuery();
                set = (await query.ExecuteNextAsync<MusicSet>(token)).SingleOrDefault();
            });
            return set;
        }

        public Task SaveMusicSet(MusicSet set, CancellationToken token = default(CancellationToken))
        {
            return UseClient(client => client.UpsertDocumentAsync(this.DataPath, set));
        }
    }
}
