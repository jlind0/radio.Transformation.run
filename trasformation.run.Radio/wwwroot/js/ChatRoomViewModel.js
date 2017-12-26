"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ChatViewModel {
    constructor(player, id) {
        this.player = player;
        this.id = id;
        this.IsReady = ko.observable(false);
        this.LoggedInUsers = ko.observableArray();
        this.Messages = ko.observableArray();
        this.NewMessage = ko.observable();
        this.User = {
            Id: id,
            Tenant: tenant,
            Name: ko.observable(),
            CurrentSet: ko.observable(player.CurrentSet()),
            CurrentSong: ko.observable()
        };
        $(window).bind("beforeunload", () => {
            player.Hub.send("logout", this.GetUserDTO());
        });
        player.CurrentSet.subscribe(set => {
            this.User.CurrentSet(set);
            set.playedSongs.subscribe(song => this.User.CurrentSong(song.LastOrDefault()));
        });
        this.User.CurrentSet.subscribe(set => {
            if (this.IsReady())
                player.Hub.send("broadcastSetChange", this.GetUserDTO(), this.GetCurrentSet());
        });
        this.User.CurrentSong.subscribe(song => {
            if (this.IsReady())
                player.Hub.send("broadcastSongChange", this.GetUserDTO(), this.GetCurrentSong());
        });
        player.Hub.on("discoverClients", id => {
            player.Hub.send("broadcastConnection", this.GetUserDTO(), this.GetCurrentSet(), this.GetCurrentSong(), id);
        });
        player.Hub.on("broadcastConnection", (user, set, song) => {
            var u = user;
            var m = set;
            var s = song;
            var uvm = this.LoggedInUsers().Where(us => us.Id == u.id).FirstOrDefault();
            if (uvm == null) {
                this.LoggedInUsers.push({
                    Id: u.id,
                    CurrentSet: ko.observable({
                        id: m.id,
                        name: m.name,
                        playedSongs: null,
                        songs: [],
                        tenant: m.tenant,
                        isActive: m.isActive
                    }),
                    CurrentSong: ko.observable({
                        id: s.id,
                        name: s.name,
                        provider: s.provider
                    }),
                    Name: ko.observable(u.name),
                    Tenant: u.tenant
                });
            }
            else {
                uvm.CurrentSet({
                    id: m.id,
                    name: m.name,
                    playedSongs: null,
                    songs: [],
                    tenant: m.tenant,
                    isActive: m.isActive
                });
                uvm.CurrentSong({
                    id: s.id,
                    name: s.name,
                    provider: s.provider
                });
            }
        });
        player.Hub.on("login", user => {
            var u = user;
            var cs = {
                id: null,
                name: "",
                provider: null
            };
            var ss = {
                id: null,
                name: "",
                playedSongs: ko.observableArray(),
                songs: [],
                tenant: u.tenant,
                isActive: true
            };
            if (u.id == id) {
                ss = player.CurrentSet();
                cs = player.CurrentSet().playedSongs().LastOrDefault();
            }
            this.LoggedInUsers.push({
                Id: u.id,
                Name: ko.observable(u.name),
                CurrentSet: ko.observable(ss),
                CurrentSong: ko.observable(cs),
                Tenant: u.tenant
            });
        });
        player.Hub.on("logout", id => {
            var user = this.LoggedInUsers().Where(u => u.Id === id).First();
            if (user != null)
                this.LoggedInUsers.remove(user);
        });
        player.Hub.on("broadcastSetChange", (user, set) => {
            var u = user;
            var m = set;
            var vm = this.LoggedInUsers().Where(us => us.Id === u.id).First();
            vm.CurrentSet(m);
        });
        player.Hub.on("broadcastSongChange", (user, song) => {
            var u = user;
            var m = song;
            var vm = this.LoggedInUsers().Where(us => us.Id === u.id).First();
            vm.CurrentSong(m);
        });
        player.Hub.on("sendMessage", (user, message) => {
            this.Messages.push({
                Message: message,
                User: user
            });
        });
    }
    GetUserDTO() {
        return {
            id: this.User.Id,
            name: this.User.Name(),
            tenant: this.User.Tenant
        };
    }
    GetCurrentSet() {
        return {
            id: this.User.CurrentSet().id,
            name: this.User.CurrentSet().name,
            songs: [],
            tenant: this.User.CurrentSet().tenant,
            isActive: this.User.CurrentSet().isActive
        };
    }
    GetCurrentSong() {
        var song = this.User.CurrentSet().playedSongs().LastOrDefault();
        return {
            id: song.id,
            name: song.name,
            provider: song.provider
        };
    }
    Login() {
        this.player.Hub.send("login", this.GetUserDTO()).then(() => this.player.Hub.send("discoverClients", this.User.Tenant, this.id).then(() => this.player.Hub.send("broadcastSetChange", this.GetUserDTO(), this.GetCurrentSet()).then(() => this.player.Hub.send("broadcastSongChange", this.GetUserDTO(), this.GetCurrentSong()).then(() => this.IsReady(true)))));
    }
    Logout() {
        this.player.Hub.send("logout", this.User.Id).then(() => this.IsReady(false));
    }
    SendMessage() {
        this.player.Hub.send("sendMessage", this.GetUserDTO(), this.NewMessage()).then(() => this.NewMessage(""));
    }
}
exports.ChatViewModel = ChatViewModel;
//# sourceMappingURL=ChatRoomViewModel.js.map