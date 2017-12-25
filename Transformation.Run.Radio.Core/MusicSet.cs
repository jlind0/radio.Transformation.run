using System;
using System.Collections.Generic;
using System.Text;

namespace Transformation.Run.Radio.Core
{
    public class MusicSet
    {
        public string id { get; set; }
        public string Name { get; set; }
        public Song[] Songs { get; set; }
        public string Tenant { get; set; }
    }
    public class Song
    {
        public string Id { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
        public string Provider { get; set; }
    }
}
