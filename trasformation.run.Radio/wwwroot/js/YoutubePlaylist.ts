///<reference path="jquery.ts"/>
///<reference path="youtube.d.ts"/>
///<reference path="linq4js.ts"/>
///<reference path="knockout.ts"/>
export function onYouTubeIframeAPIReady() : void{
    var player = new radio.Transformation.run.PlayistPlayer($("#player").get(0));
    ko.applyBindings(player, $("#PlayerView").get(0));
}
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
    playedSongs?: KnockoutObservableArray<Song>;
}
export namespace radio.Transformation.run {
    export class PlayistPlayer{
        protected ExcludeList: string[] = [];
        protected Player: YT.Player;
        public CurrentSet: KnockoutObservable<MusicSet> = ko.observable();
        public SetList: KnockoutObservableArray<MusicSet> = ko.observableArray();
        constructor(protected element: HTMLElement) {
            this.LoadNextSet();
            this.CurrentSet.subscribe(set => this.PlaySet());
        }
        protected LoadNextSet() {
            $.ajax({
                type: "POST", dataType: "json",
                url: "api/music/next",
                headers: {
                    "accept": "application/json",
                    "content-type": "application/json"
                },
                data: JSON.stringify(this.ExcludeList)
            }).then(s => {
                var set = <MusicSet>s;
                if (this.ExcludeList.length > 3)
                    this.ExcludeList.shift();
                this.ExcludeList.push(set.id);
                var newSet: MusicSet = {
                    id: set.id, name: set.name, songs: set.songs, playedSongs: ko.observableArray()
                }
                if (this.SetList().length > 5)
                    this.SetList.shift();
                this.SetList.push(newSet);
                this.CurrentSet(newSet);
                }).fail(err => console.error(err));
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
                this.LoadNextSet();
        }
    }
}