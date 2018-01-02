
Object.defineProperty(exports, "__esModule", { value: true });
$(() => {
    var vm = new MusicSetViewModel(tenantId, setId);
    ko.applyBindings(vm, $("#MusicSetView").get(0));
});
class MusicSetViewModel {
    constructor(tenantId, setId) {
        this.tenantId = tenantId;
        this.setId = setId;
        this.MusicSet = ko.observable();
        this.Songs = ko.observableArray();
        this.Name = ko.observable();
        this.IsActive = ko.observable(true);
        this.IsDeleteVisisble = ko.observable(false);
        this.IsSaveEnabled = ko.observable(true);
        if (this.setId === "")
            this.setId = null;
        this.RemoveSong = this.RemoveSong.bind(this);
        this.MusicSet.subscribe(set => {
            this.IsDeleteVisisble(set.id != null);
            this.IsSaveEnabled(true);
            this.IsActive(set.isActive);
            this.Songs.removeAll();
            set.songs.ForEach(song => {
                var s = {
                    Id: ko.observable(song.id),
                    Skip: ko.observable(song.skip),
                    Take: ko.observable(song.take),
                    Provider: ko.observable(Providers[song.provider])
                };
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
                tenant: tenantId,
                isActive: true
            });
        }
    }
    RemoveSong(song) {
        this.Songs.remove(song);
    }
    AddSongSlot() {
        this.Songs.push({
            Id: ko.observable(),
            Provider: ko.observable(Providers.youTube),
            Skip: ko.observable(),
            Take: ko.observable()
        });
    }
    DeleteSet() {
        this.IsSaveEnabled(false);
        $.ajax({
            url: '/api/music/' + this.MusicSet().id,
            type: "DELETE",
            dataType: "json",
            headers: {
                "accept": "application/json",
                "content-type": "application/json"
            }
        }).then(() => alert("Set Deleted"));
    }
    SaveSet() {
        this.IsSaveEnabled(false);
        var musicSet = {
            id: this.MusicSet().id,
            name: this.Name(),
            tenant: this.MusicSet().tenant,
            songs: this.Songs().Select(s => ({
                id: s.Id(),
                provider: s.Provider(),
                name: null,
                skip: s.Skip(),
                take: s.Take()
            })),
            isActive: this.IsActive()
        };
        $.ajax({
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
    LoadSet() {
        $.ajax({
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
exports.MusicSetViewModel = MusicSetViewModel;