//NOTE: Because of a bug with the signalR Typescript defs there is a YoutubePlaylist_fixed.js
//that must be updated with the const .... require line commented out
///<reference path="jquery.ts"/>
///<reference path="youtube.d.ts"/>
///<reference path="linq4js.ts"/>
///<reference path="knockout.ts"/>
import * as signalR from "../lib/signalr/index"
export function onYouTubeIframeAPIReady() : void{
    var player = new radio.Transformation.run.PlayistPlayer($("#player").get(0));
    ko.applyBindings(player, $("#PlayerView").get(0));
}
declare var tenant : string;
export module radio.Transformation.run {
    export interface Song {
        id: string;
        name: string;
        skip?: number;
        take?: number;
    }
    export interface MusicSet {
        id: string;
        name: string;
        songs: Song[];
        tenant: string;
        playedSongs?: KnockoutObservableArray<Song>;
    }
    export class PlayistPlayer{
        protected Player: YT.Player;
        public CurrentSet: KnockoutObservable<MusicSet> = ko.observable();
        public SetList: KnockoutObservableArray<MusicSet> = ko.observableArray();
        public SetQueue: KnockoutObservableArray<MusicSet> = ko.observableArray();
        protected Hub: signalR.HubConnection;
        constructor(protected element: HTMLElement) {
            this.CurrentSet.subscribe(set => this.PlaySet());
            this.Hub = new signalR.HubConnection("hubs/music");
            this.Hub.on("queueSet", data => {
                var set = <MusicSet>data;
                if (!this.SetQueue().Any(s => s.id == set.id) && this.CurrentSet().id != set.id)
                    this.SetQueue.push({
                        id: set.id,
                        name: set.name,
                        songs: set.songs,
                        tenant: set.tenant,
                        playedSongs: ko.observableArray()
                    });

            });
            this.Hub.start().then(() => {
                this.LoadNextSet(false);
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
                        tenant: set.tenant,
                        playedSongs: ko.observableArray()
                    }
                    if (push)
                        this.Hub.send("queueSet", set);
                    if (this.SetList().length > 2)
                        this.SetList.shift();
                    this.SetList.push(newSet);
                    this.CurrentSet(newSet);
                }).fail(err => console.error(err));
            }
        }
        protected PlaySet() {
            var set = this.CurrentSet();
            if (set.songs.length > 0) {

                var song = set.songs.shift();
                if (this.Player != null)
                    this.Player.destroy();
                set.playedSongs.push(song);
                this.Player = new YT.Player(this.element, {
                    events: {
                        onStateChange: evt => {
                            if (evt.data == YT.PlayerState.ENDED)
                                this.PlaySet();
                        },
                        onReady: () => {
                            this.Player.playVideo();
                        },
                        onError: (err) => alert(err.data)
                    },
                    playerVars: {
                        autoplay: YT.AutoPlay.AutoPlay,
                        start: song.skip,
                        end: song.take
                    },
                    height: 390,
                    width: 640,
                    videoId: song.id
                });
            }
            else
                this.LoadNextSet(true);
        }
    }
}