using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace trasformation.run.Radio.Models
{
    public class MusicSetViewModel
    {
        public string id { get; set; }
        public string Name { get; set; }
        public SongViewModel[] Songs { get; set; }
        public string Tenant { get; set; }
    }
    public class SongViewModel
    {
        public string Id { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
        public string Name { get; set; }
    }
}
