using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Transformation.Run.Radio.Core;
using Transformation.Run.Radio.Core.Models;

namespace trasformation.run.Radio.Hubs
{
    
    public class MusicHub : Hub
    {
        public Task GetConnectionId()
        {
            return this.Clients.Client(this.Context.ConnectionId).InvokeAsync("getConnectionId", this.Context.ConnectionId);
        }
        public Task Enlist(string tenant)
        {
            return this.Groups.AddAsync(this.Context.ConnectionId, tenant);
        }
        public Task QueueSet(MusicSet set)
        {
            return this.Clients.Group(set.Tenant).InvokeAsync("queueSet", set);
        }
        public Task BroadcastSetChange(UserViewModel user, MusicSetViewModel set)
        {
            return this.Clients.Group(set.Tenant).InvokeAsync("broadcastSetChange", user, set);
        }
        public Task BroadcastSongChange(UserViewModel user, SongViewModel song)
        {
            return this.Clients.Group(user.Tenant).InvokeAsync("broadcastSongChange", user, song);
        }
        public Task SendMessage(UserViewModel user, string message)
        {
            return this.Clients.Group(user.Tenant).InvokeAsync("sendMessage", user, message);
        }
        public Task Login(UserViewModel user)
        {
            return this.Clients.Group(user.Tenant).InvokeAsync("login", user);
        }
        public Task Logout(UserViewModel user)
        {
            return this.Clients.Group(user.Tenant).InvokeAsync("logout", user.Id);
        }
        public Task DiscoverClients(string tenant, string id)
        {
            return this.Clients.Group(tenant).InvokeAsync("discoverClients", id);
        }
        public Task BroadcastConnection(UserViewModel user, MusicSetViewModel set, SongViewModel song, string id)
        {
            return this.Clients.Client(id).InvokeAsync("broadcastConnection", user, set, song);
        }
    }
}
