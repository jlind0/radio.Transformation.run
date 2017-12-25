using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
using Transformation.Run.Radio.Core;

namespace Transformation.Run.Radio.Data.Core
{
    public interface ITenantDataAdapter
    {
        Task<Tenant> GetTenant(string tenantId, CancellationToken token = default(CancellationToken));
        Task<IEnumerable<Tenant>> GetTenantsByClaims(string[] claims, CancellationToken token = default(CancellationToken));
    }
}
