///<reference path="jquery.ts"/>
///<reference path="youtube.d.ts"/>
///<reference path="linq4js.ts"/>
///<reference path="knockout.ts"/>
import { MusicSet, Song } from "./YoutubePlaylist";
declare var setId: string;
declare var tenantId: string;
$(() => {
    var vm = new MusicSetViewModel(tenantId, setId);
    ko.applyBindings(vm, $("#MusicSetView").get(0));
    
});
export enum Providers {
    youTube = "youTube",
    soundCloud = "soundCloud"
}
export interface SongViewModel {
    Id: KnockoutObservable<string>;
    Skip: KnockoutObservable<number>;
    Take: KnockoutObservable<number>;
    Provider: KnockoutObservable<Providers>;
}
export class MusicSetViewModel {
    public MusicSet: KnockoutObservable<MusicSet> = ko.observable();
    public Songs: KnockoutObservableArray<SongViewModel> = ko.observableArray();
    public Name: KnockoutObservable<string> = ko.observable();
    public IsDeleteVisisble: KnockoutObservable<boolean> = ko.observable(false);
    public IsSaveEnabled: KnockoutObservable<boolean> = ko.observable(true);
    constructor(protected tenantId : string, protected setId?: string) {
        if (this.setId === "")
            this.setId = null;
        this.RemoveSong = <(song: SongViewModel) => void>this.RemoveSong.bind(this);
        this.MusicSet.subscribe(set => {
            this.IsDeleteVisisble(set.id != null);
            this.IsSaveEnabled(true);
            this.Songs.removeAll();
            set.songs.ForEach(song => {
                var s: SongViewModel = {
                    Id: ko.observable(song.id),
                    Skip: ko.observable(song.skip),
                    Take: ko.observable(song.take),
                    Provider: ko.observable(Providers[song.provider])
                }
                this.Songs.push(s);
            });
            this.Name(set.name);
        });
        if (this.setId != null)
            this.LoadSet();
        else {
            this.MusicSet({
                id: null,
                name: "Enter a Set Name Here",
                songs: [],
                tenant: tenantId
            })
        }
    }
    public RemoveSong(song: SongViewModel) {
        this.Songs.remove(song);
    }
    public AddSongSlot(): void {
        this.Songs.push({
            Id: ko.observable(),
            Provider: ko.observable(Providers.youTube),
            Skip: ko.observable(),
            Take: ko.observable()
        })
    }
    public DeleteSet(): void {
        this.IsSaveEnabled(false);
        $.ajax(<JQuery.AjaxSettings<any>>{
            url: '/api/music/' + this.MusicSet().id,
            type: "DELETE",
            dataType: "json",
            headers: {
                "accept": "application/json",
                "content-type": "application/json"
            }
        }).then(() => alert("Set Deleted"));
    }
    public SaveSet(): void{
        this.IsSaveEnabled(false);
        var musicSet: MusicSet = {
            id: this.MusicSet().id,
            name: this.Name(),
            tenant: this.MusicSet().tenant,
            songs: this.Songs().Select(s => <Song>{
                id: s.Id(),
                provider: s.Provider(),
                name: null,
                skip: s.Skip(),
                take: s.Take()
            })
        }
        $.ajax(<JQuery.AjaxSettings<any>>{
            url: '/api/music/',
            type: "POST",
            dataType: "json",
            headers: {
                "accept": "application/json",
                "content-type": "application/json"
            },
            data: JSON.stringify(musicSet)
        }).then(() => alert("Set saved"));
    }
    public LoadSet(): void{
        $.ajax(<JQuery.AjaxSettings<any>>{
            url: '/api/music/' + this.setId,
            type: "GET",
            dataType: "json",
            headers: {
                "accept": "application/json",
                "content-type": "application/json"
            }
        }).then(set => this.MusicSet(set));
    }
}