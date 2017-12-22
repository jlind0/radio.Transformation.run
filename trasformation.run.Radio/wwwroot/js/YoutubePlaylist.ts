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
    skip?: number;
    take?: number;
}
export interface MusicSet {
    id: string;
    name: string;
    songs: Song[];
}
export namespace radio.Transformation.run {
    export class PlayistPlayer{
        protected ExcludeList: string[] = [];
        protected Player: YT.Player;
        public CurrentSet: KnockoutObservable<MusicSet> = ko.observable();
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
                if (this.ExcludeList.length > 1)
                    this.ExcludeList.shift();
                this.ExcludeList.push(set.id);
                this.CurrentSet(set);
                }).fail(err => console.error(err));
        }
        protected PlaySet() {
            var set = this.CurrentSet();
            if (set.songs.length > 0) {

                var song = set.songs.shift();
                if (this.Player != null)
                    this.Player.destroy();

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