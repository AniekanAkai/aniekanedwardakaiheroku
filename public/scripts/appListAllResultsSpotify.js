//Spotify acc username x02slau8us6w21f5tpyrr4cd2
//Spotify pw wehrlos2020
//Spotify client id 7c36ba74eb0f442cb87bef2062f22d4a

var oauthToken="";
var theSearchResults = [];
var trackUrl = "";
var topResult = "";
// var Spotify = require('spotify-web-api-js');
var spotifyApi = new SpotifyWebApi();
var findSpotifyTrackInTracks;
class NameForm extends React.Component{
	constructor(trackName){
		super();
		this.state = {artistName:"", trackName:"", searchResults:theSearchResults, trackUrl:"", trackId:0};
	}

	isSpotifyTrackByArtist(track){
		track.artists.forEach(function(artist){
			if(artist.name.toUpperCase()==artistValue.toUpperCase()){
				return true;
			}
		});
		return false;
	}

	isSoundcloudTrackByArtist(track){
		return (track.user.username.toUpperCase()==artistValue.toUpperCase());
	}


	populateSearchResults(tracks, artistValue){
		console.log(tracks);
		tracks.forEach(function(track){
			theSearchResults.push(track);
			if(isSpotifyTrackByArtist(track)){
				console.log("Found it!!");
				topResult = track;
			}
		});
		console.log(theSearchResults);

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

	findSpotifyTrackInTracks = (tracks, artistValue) => {
		this.populateSearchResults(tracks, artistValue);
		this.setState({searchResults:theSearchResults});
		this.updateTrackURL();
	}


	spotifyGetAllSearchResults(){
		let foundTrackListNode;
		let artistValue = this.state.artistName;
		let trackName = this.state.trackName;
		do {
			console.log("Num of results: "+theSearchResults.length);
			spotifyApi.setAccessToken(oauthToken);
			spotifyApi.searchTracks(trackName).then(
				(data) => {
				  console.log('Searching spotify for "'+trackName+'" by '+artistValue, data);
				  foundTrackListNode = data.tracks.items;
				  this.findSpotifyTrackInTracks(foundTrackListNode, artistValue);
				},
				(err) => {
				  console.error(err);
				}
			  );
			console.log("Num of results"+theSearchResults.length);
		} while(theSearchResults==0 && foundTrackListNode);
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
		theSearchResults = [];
		this.setState({searchResults:theSearchResults});

		this.setState({trackName:this.trackInputNode.value, artistName:this.artistInputNode.value},this.spotifyGetAllSearchResults);
	}


	spotifyLogin(spotifyAuthToken) {
		if (spotifyAuthToken) {
			oauthToken = spotifyAuthToken;
			return <div>Access Token: {spotifyAuthToken}</div>;
		}
		return <a href="/app/spotifyLogin" class="btn btn-primary">Log in with Spotify</a>;
	}

	render(){
		return (<div>
					{this.spotifyLogin(spotifyAuthToken.innerText)}
					<form onSubmit={this.searchSubmit}>
						<label>Find song:</label>							
						<input type="text" name="thisTrackname" ref={node => {this.trackInputNode = node}}/>
						<input type="text" name="thisArtistName" ref={node => {this.artistInputNode = node}}/>
						<input type="submit"/>							
					</form>
					<div><b>Search results for </b><span>{(this.state.trackName)?this.state.trackName:"___"}</span> by {(this.state.artistName)?this.state.artistName:"___"}</div>
					<hr/>
					<div>{(this.state.searchResults.length>0)?this.state.searchResults[0].stream_url:"..."}</div>
					<hr/>
					<div>
						<h3>Top result</h3>
						<iframe width="80%" height="166" scrolling="no" frameBorder="no" src={"https://embed.spotify.com/?uri=spotify:track:"+topResult.id} allowtransparency='true'></iframe>
					</div>
					<hr/>
					<div>
						<h3>Suggested searches</h3>
					</div>
					<ul>{this.state.searchResults.map((results)=>
						<iframe width="80%" height="166" scrolling="no" frameBorder="no" src={"https://embed.spotify.com/?uri=spotify:track:"+results.id} allowtransparency='true'></iframe>
					)}</ul>
				</div>
		);
	}
}	

var spotifyAuthToken=document.getElementById("spotifyAuthToken");
var rootElement = document.getElementById("root");
var element = <NameForm/>

ReactDOM.render(element, rootElement);