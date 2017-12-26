using System;
using System.Collections.Generic;
using System.Text;
using Transformation.Run.Radio.Core;
using System.Threading.Tasks;
using System.Threading;


namespace Transformation.Run.Radio.Data.Core
{
    public interface IMusicAdapter
    {
        Task<MusicSet> GetNextSet(string tenant,string[] excludeIds = null , CancellationToken token = default(CancellationToken));
        Task SaveMusicSet(MusicSet set, CancellationToken token = default(CancellationToken));
        Task<MusicSet> GetSet(string id, CancellationToken token = default(CancellationToken));
        Task<IEnumerable<MusicSet>> GetMusicSets(string tenantId, CancellationToken token = default(CancellationToken));
        Task DeleteSet(string id, CancellationToken token = default(CancellationToken));
    }

    public class CosmosDataToken
    {
        public Uri Path { get; private set; }
        public string Key { get; private set; }
        public string Database { get; private set; }
        public string Collection { get; private set; }
        public CosmosDataToken(Uri path, string key, string database, string collection)
        {
            Path = path;
            Key = key;
            Database = database;
            Collection = collection;
        }
    }
}
