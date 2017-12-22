///<reference path="jquery.ts"/>
///<reference path="youtube.d.ts"/>
///<reference path="linq4js.ts"/>
$(() => {
    new radio.Transformation.run.PlayistPlayer($("#player").get(0), ["PLUyclMg9gp7wykMZ878z9SF_GnFC-tfYO",
        "PLUyclMg9gp7x-8tvQZBMVI2D8M9Vqf5Fi","PLUyclMg9gp7zKDf_cJKmSNASWL6DuiFDw"])
});
export namespace radio.Transformation.run {
    export class PlayistPlayer{
        protected LastPlayed: number[] = [];
        protected Player: YT.Player;
        constructor(protected element: HTMLElement, protected playlist: string[]) {
        }
        protected PlayNext(): void {
            var next = 0;
            do {
                next = this.GetRandomIndex();
            }
            while (this.LastPlayed.Any(p => p == next));

            if (this.Player != null) {
                this.Player.destroy();
            }

            this.Player = new YT.Player(this.element, {
                events: {
                    onStateChange: evt => {
                        if (evt.data == YT.PlayerState.ENDED)
                            this.PlayNext();
                    },
                    onReady: () => {
                        this.Player.playVideo();
                    }
                },
                playerVars: {
                    autoplay: YT.AutoPlay.AutoPlay
                },
                videoId : this.playlist[next]
            });
            if (this.LastPlayed.length > this.playlist.length/3)
                this.LastPlayed.shift();
            this.LastPlayed.Add(next);
        }
        protected GetRandomIndex(): number {
            return Math.floor(Math.random() * this.playlist.length);
        }
    }
}