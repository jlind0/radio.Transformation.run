//NOTE: Because of a bug with the signalR Typescript defs there is a YoutubePlaylist_fixed.js
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
    public IsYouTube: KnockoutObservable<boolean> = ko.observable(true);
    protected AspectRatio: number = 390.0/640.0;
    constructor(protected element: HTMLElement) {
        this.CurrentSet.subscribe(set => {
            if (this.SetList().length > 2)
                this.SetList.shift();
            this.SetList.push(set);
            this.PlaySet();
        });
        
        this.Hub = new signalR.HubConnection("hubs/music");
        $(window).resize(() => {
            if (this.YouTubePlayer != null) {
                var width = Math.floor($(window).width() * 0.35);
                var height = Math.floor(width * this.AspectRatio);
                this.YouTubePlayer.setSize(width, height);
            }
        });
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
        this.Hub.start().then(() => {
            this.Hub.send("enlist", tenant).then(() => this.LoadNextSet(false)).then(() => this.Hub.send("getConnectionId"));
        })
            
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
            if (this.YouTubePlayer != null)
                this.YouTubePlayer.destroy();
            var width = Math.floor($(window).width() * 0.35);
            var height = Math.floor(width * this.AspectRatio);
            if (song.provider === "youTube") {
                this.IsYouTube(true);
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
                this.IsYouTube(false);
                var widget = SC.Widget("sc-widget");
                widget.load(song.id, {
                    auto_play: true,
                    show_artwork: true
                })
                widget.bind(SC.Widget.Events.READY, () => {
                    widget.play();
                    widget.getCurrentSound(sound => {
                        song.name = sound.user.username + ' - ' + sound.title;
                        set.playedSongs.push(song);
                    });
                    widget.bind(SC.Widget.Events.FINISH, () => this.PlaySet());
                });
              
            }
            
        }
        else
            this.LoadNextSet(true);
    }
}