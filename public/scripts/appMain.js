SC.initialize({
  client_id: 'MpLVGIOGWboHqGT3WePdQvUOVd0sswgq'
});
var theSearchResults = [];
var track_url = "";

class NameForm extends React.Component{
	constructor(trackName){
		super();
		this.state = {artistName:"", trackName:"", searchResults:theSearchResults, trackUrl:"", trackId:0};
	}

	populateSearchResults(tracks, artistValue){
		tracks.collection.forEach(function(track){
			// console.log(track.user.username);
			if(track.user.username.toUpperCase()==artistValue.toUpperCase()){
				console.log("Found it!!");
				theSearchResults.push(track);
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
						// findTrackInTracks(moreTracksJSON, artistValue);
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
				SC.get('/tracks', {limit:100, linked_partitioning:1, q:this.state.trackName})
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
		// this.updateTrackURL();
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

	searchSubmit = event => {
		event.preventDefault();
		console.log(event.target.elements.thisTrackname.value);
		console.log("ref value: "+this.trackInputNode.value);
		console.log("ref value: "+this.artistInputNode.value);
		this.setState({trackName:this.trackInputNode.value, artistName:this.artistInputNode.value},this.getAllTheSearchResults);
		// this.updateTrackURL();
	}
	
	render(){
		return (<div>
					<form onSubmit={this.searchSubmit}>
						<label>Find song:</label>							
						<input type="text" name="thisTrackname" ref={node => {this.trackInputNode = node}}/>
						<input type="text" name="thisArtistName" ref={node => {this.artistInputNode = node}}/>
						<input type="submit"/>							
					</form>
					<div><b>Search results for </b><span>{(this.state.trackName)?this.state.trackName:"___"}</span> by {(this.state.artistName)?this.state.artistName:"___"}</div>
					<hr/>
					<div>{(this.state.searchResults.length>0)?this.state.searchResults[0].stream_url:"..."}</div>						
					<iframe width="100%" height="166" 
					scrolling="no" frameBorder="no" src={"https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/"+this.state.trackId+"&amp;color=ff5500"}>
					</iframe>
				</div>
		);
	}
}	
var rootElement = document.getElementById("root");
var element = <NameForm/>

ReactDOM.render(element, rootElement);