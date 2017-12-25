using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Transformation.Run.Radio.Core;

namespace trasformation.run.Radio.Models
{
    public class TenantViewModel
    {
        public Tenant Tenant { get; set; }
        public IEnumerable<MusicSet> Sets { get; set; }
    }

    public struct TenantMusicSet
    {
        public string TenantId { get; set; }
        public string SetId { get; set; }
        public TenantMusicSet(string tenantId, string setId)
        {
            this.TenantId = tenantId;
            this.SetId = setId;
        }
    }
}
