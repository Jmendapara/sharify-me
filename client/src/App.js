import React, { Component } from 'react';
import './App.css';
import Spotify from 'spotify-web-api-js';
import logo from './Sharify.png';


const spotifyWebApi = new Spotify();

class App extends Component {

  constructor() {

    super();

    const params = this.getHashParams();

    this.state = {

      loggedIn: params.access_token ? true : false,
      numberOfTracksEntered: 50,
      allTracks: [],
      playListName: '',
      userId: '',
      playlistURL: '',
      newPlayListId: ''

    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);


    if (params.access_token) {
      spotifyWebApi.setAccessToken(params.access_token);
    }


  }

  componentDidMount() {

    this.handleSubmit();

  }

  getHashParams() {

    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;

  }

  handleChange(event) {

    this.setState({ playListName: event.target.value });

  }


  handleSubmit(event) {

    const limit = {

      limit: this.state.numberOfTracksEntered

    };

    spotifyWebApi.getMySavedTracks(limit)
      .then((response) => {
        console.log(response);
        this.setState({
          allTracks: response.items
        })
      })

    spotifyWebApi.getMe()
      .then((response) => {
        this.setState({ userId: response.id });
        console.log(this.state);
      })

  }

  handleFormSubmit(event) {

    const options = {

      "name": this.state.playListName,
      "description": "" + this.state.userId + "'s recently liked songs.",
      "public": "true"

    }

    if (this.state.allTracks.length <= 0) {

      alert("Oops, you need at least one song in your playlist!")
      this.handleSubmit();
      return;

    }

    const uris = [];

    for (let i = 0; i < this.state.allTracks.length; i++) {

      uris.push(this.state.allTracks[i].track.uri)

    }

    spotifyWebApi.createPlaylist(this.state.userId, options)
      .then((response) => {
        this.setState({ playlistURL: response.external_urls.spotify })
        return spotifyWebApi.addTracksToPlaylist(this.state.userId, response.id, uris)
      }).then((response) => {
        window.open(this.state.playlistURL, "_self");
      })

    event.preventDefault();

  }

  logOut() {

    this.setState({

      allTracks: [],
      playListName: '',
      userId: '',
      playlistURL: '',
      newPlayListId: '',
      loggedIn: false

    });

  }

  handleDelete = trackId => {

    const tempTracks = this.state.allTracks.filter(eachTrack => eachTrack.track.id !== trackId);
    console.log(tempTracks)
    this.setState({ allTracks: tempTracks });

  }

  showSongList() {

    return (

      <div className="trackListParent">

          <div>
            <div className="refresh">
              <button id="refreshB" onClick={() => this.handleSubmit()}>
                Reset List
              </button>
            </div>
          </div>

        <div id="deleteInstruction">
          <p id="deleteInstruction">Click on a song to delete it from the playlist.</p>
        </div>

        <div className="trackList">
          <ol>
            {this.state.allTracks.map(eachTrack => (
              <li key={eachTrack.track.id} onClick={() => this.handleDelete(eachTrack.track.id)}>
                <img src={eachTrack.track.album.images[2].url}></img>
                <h3>{eachTrack.track.name}</h3>
                <p id = "artistName">{eachTrack.track.artists[0].name}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="formParent">
            <form onSubmit={this.handleFormSubmit} className="container__item">
              <input type="text" value={this.state.playListName} onChange={this.handleChange} className="form__field" placeholder="Playlist Name (Ex: WoosyDoosy)" />
              <div className="submitButton">
                <button type="submit" value="Submit" className="btn btn--primary btn--inside uppercase">CREATE PLAYLIST</button>
              </div>
            </form>
        </div>

      </div>

    );
  }

  render() {

    return (

      <div className={this.state.loggedIn ? 'App' : 'App-back'}>

        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          {this.state.loggedIn ?
            <button className="LogOutButton" onClick={() => this.logOut()}>LOG OUT</button>
            : null}
        </div>

        {!this.state.loggedIn ?

          [
            <div className="LoginIn">

              <div className="LoginInside">
                <p className="LoginInDes">The fastest way to create a playlist of your most recently liked songs.</p>
                <p className="LoginInP">To get started, please log in with your Spotify account.</p>
                <a href="http://sharify-backend.herokuapp.com/login"> <button className="LoginButton">LOG IN</button></a>
              </div>

              <div className="footer">
                <p id="name"> Created by: Jay Mendapara</p>
              </div>

            </div>
          ]

          :

          <div className="ListFormParent">
            {this.showSongList()}
          </div>
          }

      </div>
    );

  }

}

export default App;
