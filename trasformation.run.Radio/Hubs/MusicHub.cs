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
        public Task QueueSet(MusicSet set)
        {
            return this.Clients.AllExcept( new string[]{
            this.Context.ConnectionId }).InvokeAsync("queueSet", set);
        }
    }
}
