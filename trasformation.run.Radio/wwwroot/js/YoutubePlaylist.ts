﻿//NOTE: Because of a bug with the signalR Typescript defs there is a YoutubePlaylist_fixed.js
//that must be updated with the const .... require line commented out
///<reference path="jquery.ts"/>
///<reference path="youtube.d.ts"/>
///<reference path="linq4js.ts"/>
///<reference path="knockout.ts"/>
import * as signalR from "../lib/signalr/index"
import { ChatViewModel } from "./ChatRoomViewModel"
export function onYouTubeIframeAPIReady() : void{
    var player = new PlayistPlayer($("#player").get(0));
    ko.applyBindings(player, $("#PlayerView").get(0));
}
declare var tenant: string;
declare var SC: any;
declare var Vimeo: any;
export enum Providers {
    youTube = "youTube",
    soundCloud = "soundCloud",
    vimeo = "vimeo"
}
export interface Song {
    id: string;
    provider: string;
    name: string;
    skip?: number;
    take?: number;
}
export interface MusicSet {
    id: string;
    name: string;
    songs: Song[];
    tenant: string;
    isActive: boolean;
    playedSongs?: KnockoutObservableArray<Song>;
}
export class PlayistPlayer{
    protected YouTubePlayer: YT.Player;
    public CurrentSet: KnockoutObservable<MusicSet> = ko.observable();
    public SetList: KnockoutObservableArray<MusicSet> = ko.observableArray();
    public SetQueue: KnockoutObservableArray<MusicSet> = ko.observableArray();
    public Hub: signalR.HubConnection;
    public ChatRoom: KnockoutObservable<ChatViewModel> = ko.observable();
    public Provider: KnockoutObservable<Providers> = ko.observable(Providers.youTube);
    public IsYouTube: KnockoutComputed<boolean>;
    public IsSoundCloud: KnockoutComputed<boolean>;
    public IsVimeo: KnockoutComputed<boolean>;
    protected AspectRatio: number = 390.0 / 640.0;
    protected SoundCloudSong: Song;
    protected LastPushedId: string;
    protected VimeoPlayer: any;
    constructor(protected element: HTMLElement) {
        this.IsSoundCloud = ko.computed(() => this.Provider() == Providers.soundCloud);
        this.IsVimeo = ko.computed(() => this.Provider() == Providers.vimeo);
        this.IsYouTube = ko.computed(() => this.Provider() == Providers.youTube);
        this.CurrentSet.subscribe(set => {
            if (this.SetList().length > 2)
                this.SetList.shift();
            this.SetList.push(set);
            this.PlaySet();
        });
        
        this.Hub = new signalR.HubConnection("hubs/music");
        $(() => $(window).resize(() => {
            if (this.YouTubePlayer != null) {
                var width = Math.floor($(window).width() * 0.35);
                var height = Math.floor(width * this.AspectRatio);
                this.YouTubePlayer.setSize(width, height);
            }
        }));
        this.Hub.on("queueSet", data => {
            var set = <MusicSet>data;
            if (!this.SetQueue().Any(s => s.id == set.id) && this.CurrentSet().id != set.id)
                this.SetQueue.push({
                    id: set.id,
                    name: set.name,
                    songs: set.songs,
                    tenant: set.tenant,
                    playedSongs: ko.observableArray(),
                    isActive: set.isActive
                });

        });
        this.Hub.on("getConnectionId", id => this.ChatRoom(new ChatViewModel(this, id)));
        
        var widget = SC.Widget("sc-widget");
        widget.bind(SC.Widget.Events.READY, () => {
            widget.bind(SC.Widget.Events.FINISH, () => {
                this.PlaySet();
            });
            widget.bind(SC.Widget.Events.PLAY, () => {
                if (this.LastPushedId !== this.SoundCloudSong.id && !this.CurrentSet().playedSongs().Any(
                    s => s.id === this.SoundCloudSong.id)) {
                    
                    widget.getSounds(sounds => {
                        if (this.LastPushedId !== this.SoundCloudSong.id) {
                            var sound = sounds.Where(s => s.permalink_url == this.SoundCloudSong.id).FirstOrDefault();
                            this.SoundCloudSong.name = sound.user.username + ' - ' + sound.title;
                            this.CurrentSet().playedSongs.push(this.SoundCloudSong);
                            this.LastPushedId = this.SoundCloudSong.id;
                        }
                    });
                }
            });
            this.Hub.start().then(() => {
                this.Hub.send("enlist", tenant).then(() => this.LoadNextSet(false)).then(() => this.Hub.send("getConnectionId"));
            });
        });
            
    }
    protected LoadNextSet(push: boolean) {
        var currenId = null;
        if (this.CurrentSet() != null)
            currenId = this.CurrentSet().id;
        if (this.SetQueue().length > 0)
            this.CurrentSet(this.SetQueue.shift());
        else {
            $.ajax({
                type: "POST", dataType: "json",
                url: "api/music/next/" + tenant,
                headers: {
                    "accept": "application/json",
                    "content-type": "application/json"
                },
                data: JSON.stringify(currenId)
            }).then(s => {
                var set = <MusicSet>s;
                var newSet: MusicSet = {
                    id: set.id,
                    name: set.name,
                    songs: set.songs,
                    tenant: tenant,
                    playedSongs: ko.observableArray(),
                    isActive: set.isActive
                }
                if (push)
                    this.Hub.send("queueSet", set);
                    
                this.CurrentSet(newSet);
            }).fail(err => console.error(err));
        }
    }
    protected PlaySet() {
        var set = this.CurrentSet();
        if (set.songs.length > 0) {

            var song = set.songs.shift();
            
            var width = Math.floor($(window).width() * 0.35);
            var height = Math.floor(width * this.AspectRatio);
            if (song.provider === "youTube") {
                if (this.YouTubePlayer != null) {
                    this.YouTubePlayer.destroy();
                    this.YouTubePlayer = null;
                }
                this.Provider(Providers.youTube)
                this.YouTubePlayer = new YT.Player(this.element, {
                    events: {
                        onStateChange: evt => {
                            if (evt.data == YT.PlayerState.ENDED)
                                this.PlaySet();
                        },
                        onReady: () => {
                            this.YouTubePlayer.playVideo();
                            set.playedSongs.push(song);
                        },
                        onError: (err) => alert(err.data)
                    },
                    playerVars: {
                        autoplay: YT.AutoPlay.AutoPlay,
                        start: song.skip,
                        end: song.take
                    },
                    height: height,
                    width: width,
                    videoId: song.id
                });
            }
            else if (song.provider === "soundCloud") {
                this.Provider(Providers.soundCloud);
                this.SoundCloudSong = song;
                var widget = SC.Widget("sc-widget");
                widget.load(song.id, {
                    auto_play: true,
                    show_artwork: true
                });
                widget.play();

            }
            else if (song.provider == "vimeo") {
                this.Provider(Providers.vimeo);
                var options = {
                    id: song.id,
                    width: width,
                    loop: false
                };
                if (this.VimeoPlayer == null)
                    this.VimeoPlayer = new Vimeo.Player('vimeo-player', options);
                else
                    this.VimeoPlayer.loadVideo(song.id);
                var player = this.VimeoPlayer;
                var songPushed: boolean = false;
                player.on("play", data => {
                    player.getVideoTitle().then(title => {
                        if (!songPushed) {
                            song.name = title;
                            set.playedSongs.push(song);
                            songPushed = true;
                        }
                    }).catch(ex => console.error(ex));
                });
                var nextSetPlayed = false;
                player.on("ended", data => {
                    if (!nextSetPlayed) {
                        player.unload();
                        this.PlaySet();
                        nextSetPlayed = true;
                    }
                });
                player.on("loaded", data => {
                    player.play();
                });
                
            }
            
        }
        else
            this.LoadNextSet(true);
    }
}