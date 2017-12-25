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
    public class CurrentSetDataAdapter : CosmosDataAdapter, ICurrentSetAdapter
    {
        public CurrentSetDataAdapter(CosmosDataToken dataToken) : base(dataToken) { }
        
        public async Task<CurrentSet> GetCurrentSet(string tenant, CancellationToken token = default(CancellationToken))
        {
            CurrentSet set = null;
            await UseClient(async client =>
            {
                var query = CreateQuery<CurrentSet>(client, new FeedOptions() { MaxItemCount = 1 }).Where(
                    s => s.Tenant == tenant).AsDocumentQuery();
                set = (await query.ExecuteNextAsync<CurrentSet>(token)).SingleOrDefault();
            });
            return set;
        }

        public Task SetCurrentSet(CurrentSet set, CancellationToken token = default(CancellationToken))
        {
            return UseClient(client => client.UpsertDocumentAsync(this.DataPath, set));
        }
    }
}
