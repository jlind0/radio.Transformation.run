"use strict";
exports.__esModule = true;
///<reference path="jquery.ts"/>
///<reference path="youtube.d.ts"/>
///<reference path="linq4js.ts"/>
///<reference path="knockout.ts"/>
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
            var PlayistPlayer = /** @class */ (function () {
                function PlayistPlayer(element) {
                    var _this = this;
                    this.element = element;
                    this.ExcludeList = [];
                    this.CurrentSet = ko.observable();
                    this.LoadNextSet();
                    this.CurrentSet.subscribe(function (set) { return _this.PlaySet(); });
                }
                PlayistPlayer.prototype.LoadNextSet = function () {
                    var _this = this;
                    $.ajax({
                        type: "POST", dataType: "json",
                        url: "api/music/next",
                        headers: {
                            "accept": "application/json",
                            "content-type": "application/json"
                        },
                        data: JSON.stringify(this.ExcludeList)
                    }).then(function (s) {
                        var set = s;
                        if (_this.ExcludeList.length > 1)
                            _this.ExcludeList.shift();
                        _this.ExcludeList.push(set.id);
                        _this.CurrentSet(set);
                    }).fail(function (err) { return console.error(err); });
                };
                PlayistPlayer.prototype.PlaySet = function () {
                    var _this = this;
                    var set = this.CurrentSet();
                    if (set.songs.length > 0) {
                        var song = set.songs.shift();
                        if (this.Player != null)
                            this.Player.destroy();
                        this.Player = new YT.Player(this.element, {
                            events: {
                                onStateChange: function (evt) {
                                    if (evt.data == YT.PlayerState.ENDED)
                                        _this.PlaySet();
                                },
                                onReady: function () {
                                    _this.Player.playVideo();
                                },
                                onError: function (err) { return alert(err.data); }
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
                        this.LoadNextSet();
                };
                return PlayistPlayer;
            }());
            run.PlayistPlayer = PlayistPlayer;
        })(run = Transformation.run || (Transformation.run = {}));
    })(Transformation = radio.Transformation || (radio.Transformation = {}));
})(radio = exports.radio || (exports.radio = {}));
