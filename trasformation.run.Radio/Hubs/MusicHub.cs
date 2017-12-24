using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Transformation.Run.Radio.Core;

namespace trasformation.run.Radio.Hubs
{
    public class MusicHub : Hub
    {
        public Task Enlist(string tenant)
        {
            return this.Groups.AddAsync(this.Context.ConnectionId, tenant);
        }
        public Task QueueSet(MusicSet set)
        {
            return this.Clients.Group(set.Tenant).InvokeAsync("queueSet", set);
        }
    }
}
