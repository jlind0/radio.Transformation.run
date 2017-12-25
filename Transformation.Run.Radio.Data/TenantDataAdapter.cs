using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Transformation.Run.Radio.Core;
using Transformation.Run.Radio.Data.Core;
using System.Linq;
using Microsoft.Azure.Documents.Client;
using Microsoft.Azure.Documents.Linq;

namespace Transformation.Run.Radio.Data
{
    public class TenantDataAdapter : CosmosDataAdapter, ITenantDataAdapter
    {
        public TenantDataAdapter(CosmosDataToken token) : base(token)
        {
        }

        public async Task<Tenant> GetTenant(string tenantId, CancellationToken token = default(CancellationToken))
        {
            Tenant tenant = null;
            await UseClient(async client =>
            {
                var query = CreateQuery<Tenant>(client, new FeedOptions() { MaxItemCount = 1 }).Where(
                    t => t.TenantId == tenantId).AsDocumentQuery();
                tenant = (await query.ExecuteNextAsync<Tenant>(token)).SingleOrDefault();
            });
            return tenant;
        }

        public async Task<IEnumerable<Tenant>> GetTenantsByClaims(string[] claims, CancellationToken token = default(CancellationToken))
        {
            List<Tenant> tenants = new List<Tenant>();
            await UseClient(async client =>
            {
                var query = CreateQuery<Tenant>(client).Where(t => claims.Contains(t.AdminRole)).AsDocumentQuery();
                while(query.HasMoreResults)
                {
                    tenants.AddRange(await query.ExecuteNextAsync<Tenant>(token));
                }
            });
            return tenants;
        }

        public Task SaveTenant(Tenant tenant, CancellationToken token = default(CancellationToken))
        {
            return UseClient(client => client.UpsertDocumentAsync(this.DataPath, tenant));
        }
    }
}
