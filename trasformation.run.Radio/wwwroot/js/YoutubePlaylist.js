"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//NOTE: Because of a bug with the signalR Typescript defs there is a YoutubePlaylist_fixed.js
//that must be updated with the const .... require line commented out
///<reference path="jquery.ts"/>
///<reference path="youtube.d.ts"/>
///<reference path="linq4js.ts"/>
///<reference path="knockout.ts"/>
const signalR = require("../lib/signalr/index");
function onYouTubeIframeAPIReady() {
    var player = new radio.Transformation.run.PlayistPlayer($("#player").get(0));
    ko.applyBindings(player, $("#PlayerView").get(0));
}
exports.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
var radio;
(function (radio) {
    var Transformation;
    (function (Transformation) {
        var run;
        (function (run) {
            class PlayistPlayer {
                constructor(element) {
                    this.element = element;
                    this.CurrentSet = ko.observable();
                    this.SetList = ko.observableArray();
                    this.SetQueue = ko.observableArray();
                    this.CurrentSet.subscribe(set => {
                        if (this.SetList().length > 2)
                            this.SetList.shift();
                        this.SetList.push(set);
                        this.PlaySet();
                    });
                    this.Hub = new signalR.HubConnection("hubs/music");
                    this.Hub.on("queueSet", data => {
                        var set = data;
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
                        this.Hub.send("enlist", tenant).then(() => this.LoadNextSet(false));
                    });
                }
                LoadNextSet(push) {
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
                            var set = s;
                            var newSet = {
                                id: set.id,
                                name: set.name,
                                songs: set.songs,
                                tenant: tenant,
                                playedSongs: ko.observableArray()
                            };
                            if (push)
                                this.Hub.send("queueSet", set);
                            this.CurrentSet(newSet);
                        }).fail(err => console.error(err));
                    }
                }
                PlaySet() {
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
                                autoplay: 1 /* AutoPlay */,
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
            run.PlayistPlayer = PlayistPlayer;
        })(run = Transformation.run || (Transformation.run = {}));
    })(Transformation = radio.Transformation || (radio.Transformation = {}));
})(radio = exports.radio || (exports.radio = {}));
//# sourceMappingURL=YoutubePlaylist.js.map