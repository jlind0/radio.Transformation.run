using System;
using System.Collections.Generic;
using System.Text;
using Transformation.Run.Radio.Middle.Core;
using StructureMap;
using System.Threading;
using System.Threading.Tasks;
using Transformation.Run.Radio.Core;
using Transformation.Run.Radio.Core.Models;

namespace Transformation.Run.Radio.Middle
{
    public class MusicSetMetadataProvider : IMusicSetMetadataProvider
    {
        protected IContainer Container { get; private set; }
        public MusicSetMetadataProvider(IContainer container)
        {
            this.Container = container;
        }
        public async Task<MusicSetViewModel> PopulateMetadata(MusicSet set, string requestingRegion = null, CancellationToken token = default(CancellationToken))
        {
            MusicSetViewModel msvm = new MusicSetViewModel()
            {
                id = set.id,
                Name = set.Name,
                Tenant = set.Tenant,
                IsActive = set.IsActive
            };
            List<SongViewModel> svms = new List<SongViewModel>();
            foreach (var song in set.Songs)
            {
                var svm = await this.Container.GetInstance<ISongMetadataProvider>(song.Provider).PopulateMetadata(song, requestingRegion, token);
                if (svm != null)
                    svms.Add(svm);
            }
            msvm.Songs = svms.ToArray();
            return msvm;
        }
    }
}
