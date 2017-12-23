using System;
using System.Collections.Generic;
using System.Text;
using Transformation.Run.Radio.Core;
using System.Threading.Tasks;
using System.Threading;
namespace Transformation.Run.Radio.Data.Core
{
    public interface ICurrentSetAdapter
    {
        Task<CurrentSet> GetCurrentSet(string tenant, CancellationToken token = default(CancellationToken));
        Task SetCurrentSet(CurrentSet set, CancellationToken token = default(CancellationToken));
    }
}
