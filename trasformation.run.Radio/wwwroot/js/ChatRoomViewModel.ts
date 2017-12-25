//NOTE: Because of a bug with the signalR Typescript defs there is a _fixed.js
//that must be updated with the const .... require line commented out
///<reference path="jquery.ts"/>
///<reference path="youtube.d.ts"/>
///<reference path="linq4js.ts"/>
///<reference path="knockout.ts"/>
import { MusicSet, PlayistPlayer, Song } from "./YoutubePlaylist";
import * as signalR from "../lib/signalr/index";
declare var tenant: string;
export interface UserDTO {
    id: string;
    tenant: string;
    name: string;
}
export interface UserViewModel {
    Id?: string;
    Tenant: string;
    Name: KnockoutObservable<string>;
    CurrentSet: KnockoutObservable<MusicSet>;
    CurrentSong: KnockoutObservable<Song>;
}
export interface Message {
    User: UserDTO;
    Message: string;
}
export class ChatViewModel {
    public User: UserViewModel;
    public IsReady: KnockoutObservable<boolean> = ko.observable(false);
    public LoggedInUsers: KnockoutObservableArray<UserViewModel> = ko.observableArray();
    public Messages: KnockoutObservableArray<Message> = ko.observableArray();
    public NewMessage: KnockoutObservable<string> = ko.observable();
    public IsUnloading: KnockoutObservable<boolean> = ko.observable();
    constructor(protected player: PlayistPlayer, protected id: string) {
        this.User = {
            Id: id,
            Tenant: tenant,
            Name: ko.observable(),
            CurrentSet: ko.observable(player.CurrentSet()),
            CurrentSong: ko.observable()
        }
        $(window).bind("beforeunload", () => {
            if (!this.IsUnloading()) {
                player.Hub.send("logout", this.GetUserDTO()).then(() => window.close());
                this.IsUnloading(true);
                return false;
            }
            else
                return true;
        })
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
            var u = <UserDTO>user;
            var m = <MusicSet>set;
            var s = <Song>song;
            var uvm: UserViewModel = this.LoggedInUsers().Where(us => us.Id == u.id).FirstOrDefault();
            if (uvm == null) {

                this.LoggedInUsers.push({
                    Id: u.id,
                    CurrentSet: ko.observable({
                        id: m.id,
                        name: m.name,
                        playedSongs: null,
                        songs: [],
                        tenant: m.tenant
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
                    tenant: m.tenant
                });
                uvm.CurrentSong({
                    id: s.id,
                    name: s.name,
                    provider: s.provider
                });
            }
        });
        player.Hub.on("login", user => {
            var u = <UserDTO>user;
            var cs: Song = {
                id: null,
                name: "",
                provider: null
            };
            var ss: MusicSet = {
                id: null,
                name: "",
                playedSongs: ko.observableArray(),
                songs: [],
                tenant: u.tenant
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
            })
        });
        player.Hub.on("logout", id => {
            var user = this.LoggedInUsers().Where(u => u.Id === id).First();
            if (user != null)
                this.LoggedInUsers.remove(user);
        });
        player.Hub.on("broadcastSetChange", (user, set) => {
            var u = <UserDTO>user;
            var m = <MusicSet>set;
            var vm = this.LoggedInUsers().Where(us => us.Id === u.id).First();
            vm.CurrentSet(m);
        });
        player.Hub.on("broadcastSongChange", (user, song) => {
            var u = <UserDTO>user;
            var m = <Song>song;
            var vm = this.LoggedInUsers().Where(us => us.Id === u.id).First();
            vm.CurrentSong(m);
        });
        player.Hub.on("sendMessage", (user, message) => {
            this.Messages.push({
                Message: message,
                User: user
            })
        });
    }
    protected GetUserDTO(): UserDTO {
        return {
            id: this.User.Id,
            name: this.User.Name(),
            tenant: this.User.Tenant
        };
    }
    protected GetCurrentSet(): MusicSet {
        return {
            id: this.User.CurrentSet().id,
            name: this.User.CurrentSet().name,
            songs: [],
            tenant: this.User.CurrentSet().tenant
        };
    }
    protected GetCurrentSong(): Song {
        var song = this.User.CurrentSet().playedSongs().LastOrDefault();
        return {
            id: song.id,
            name: song.name,
            provider: song.provider
        };
    }
    public Login(): void {
        this.player.Hub.send("login", this.GetUserDTO()).then(() =>
            this.player.Hub.send("discoverClients", this.User.Tenant, this.id).then(() =>
                this.player.Hub.send("broadcastSetChange", this.GetUserDTO(), this.GetCurrentSet()).then(() =>
                    this.player.Hub.send("broadcastSongChange", this.GetUserDTO(), this.GetCurrentSong()).then(() => this.IsReady(true)))));
    }
    public Logout(): void {
        this.player.Hub.send("logout", this.User.Id).then(() => this.IsReady(false));
    }
    public SendMessage() {
        this.player.Hub.send("sendMessage", this.GetUserDTO(), this.NewMessage()).then(() => this.NewMessage(""));
    }
}