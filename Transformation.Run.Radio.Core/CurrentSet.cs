using System;
using System.Collections.Generic;
using System.Text;

namespace Transformation.Run.Radio.Core
{
    public class CurrentSet
    {
        public string Tenant { get; set; }
        public string id { get; set; }
        public string CurrentId { get; set; }
        public string[] Excludes { get; set; }
    }
}
