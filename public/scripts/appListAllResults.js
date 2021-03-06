SC.initialize({
  client_id: '95f22ed54a5c297b1c41f72d713623ef'
});
var theSearchResults = [];
var trackUrl = "";
var topResult = "";
class NameForm extends React.Component{
	constructor(trackName){
		super();
		this.state = {artistName:"", trackName:"", searchResults:theSearchResults, trackUrl:"", trackId:0, platformsToSearch:[]};
		this.setPlatformsToSearch = this.setPlatformsToSearch.bind(this);
		this.searchSubmit = this.searchSubmit.bind(this);
	}

	populateSearchResults(tracks, artistValue){
		tracks.collection.forEach(function(track){
			theSearchResults.push(track);
			if(track.user.username.toUpperCase()==artistValue.toUpperCase()){
				console.log("Found it!!");
				topResult = track;
			}
		});
	}
	
	findTrackInTracks(tracks, artistValue){			
		this.populateSearchResults(tracks, artistValue);
		if(theSearchResults.length==0){
			let searchedTrack = this.state.trackName;
			if(tracks.next_href){
				console.log(tracks.next_href+searchedTrack);
				fetch(tracks.next_href+searchedTrack)
					.then(function(moreTracks){
						if (!moreTracks.ok) {
							throw new Error("HTTP error, status = " + response.status);
						}
						console.log(moreTracks);
						return moreTracks.json();
					})
					.then(function(moreTracksJSON){
						if(moreTracksJSON){
							console.log("Next: "+moreTracksJSON.next_href+searchedTrack);
						}
					});
			} else {
				console.log("no more results!");
			}
		} else {
			this.setState({searchResults:theSearchResults});
			this.updateTrackURL();
		}
	}
	
	getAllTheSearchResults(){
		var foundTrackListNode;
		let artistValue = this.state.artistName;
		do{
			SC.get('/tracks', {limit:10, linked_partitioning:1, q:this.state.trackName})
			.then(
				(tracks)=> {
					console.log("Searching");
					console.log(artistValue);
					console.log(tracks);
					foundTrackListNode = tracks;
					this.findTrackInTracks(foundTrackListNode, artistValue);
				}
			);
		}while(theSearchResults==0 && foundTrackListNode);
	}

	updateTrackURL(){
		var latestIndex =this.state.searchResults.length-1; 
		var track_url = (latestIndex>=0)?this.state.searchResults[latestIndex].stream_url:"...";
		var track_id = (latestIndex>=0)?this.state.searchResults[latestIndex].id:"0";
		console.log(track_url);
		console.log(track_id);
		this.setState({trackUrl:track_url});
		this.setState({trackId:track_id});
	}

	searchSubmit(event){
		event.preventDefault();
		console.log(event.target.elements.thisTrackname.value);
		console.log("ref value: "+this.trackInputNode.value);
		console.log("ref value: "+this.artistInputNode.value);
		this.setState({trackName:this.trackInputNode.value, artistName:this.artistInputNode.value},this.getAllTheSearchResults);
	}
	
	setPlatformsToSearch(changeEvent){
		console.log(changeEvent.target.id);
		let platform = this.state.platformsToSearch;
		if(changeEvent.target.checked){
			platform.push(changeEvent.target.id);
		} else {
			platform = platform.filter(e => e !== changeEvent.target.id);
		}
		console.log(platform);
		this.setState({platformsToSearch: platform});
		console.log(this.state.platformsToSearch);
	}

	render(){
		return (<div>
					<form onSubmit={this.searchSubmit}>
						<label>Find song:</label>							
						<input type="text" name="thisTrackname" ref={node => {this.trackInputNode = node}}/>
						<input type="text" name="thisArtistName" ref={node => {this.artistInputNode = node}}/>
						<div>
							<span>
								<input type="checkbox" name="spotifyCheck" id="spotifyCheck" onChange={(e)=>this.setPlatformsToSearch(e)} />Spotify
							</span>
							<span>
								<input type="checkbox" name="soundcloudCheck" id="soundcloudCheck" onChange={this.setPlatformsToSearch} />Soundcloud
							</span>
							<span>
								<input type="checkbox" name="bandcampCheck" id="bandcampCheck" onChange={this.setPlatformsToSearch}/>Bandcamp
							</span>
						</div>
						<input type="submit"/>							
					</form>
		<div><b>Search results for </b><span>{(this.state.trackName)?this.state.trackName:"___"}</span> by {(this.state.artistName)?this.state.artistName:"___"} in {this.state.platformsToSearch}</div>

					<hr/>
					<div>{(this.state.searchResults.length>0)?this.state.searchResults[0].stream_url:"..."}</div>
					<hr/>
					<div>
						<h3>Top result</h3>
						<iframe width="80%" height="166" scrolling="no" frameBorder="no" src={"https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/"+topResult.id+"&amp;color=ff5500"}>
						</iframe>
					</div>
					<hr/>
					<div>
						<h3>Suggested searches</h3>
					</div>
					<ul>{this.state.searchResults.map((results)=>
						<iframe width="80%" height="166" 
					scrolling="no" frameBorder="no" src={"https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/"+results.id+"&amp;color=ff5500"}>
					</iframe>
					)}</ul>
				</div>
		);
	}
}	
var rootElement = document.getElementById("root");
var element = <NameForm/>

ReactDOM.render(element, rootElement);