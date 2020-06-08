/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = '7c36ba74eb0f442cb87bef2062f22d4a'; // Your client id
var client_secret = '94ea2021369a4f0fb31f8a3baedae61d'; // Your secret
var redirect_uri = 'http://localhost:8080/app/callback'; // Your redirect uri

var access_token='';//BQCaY4E-1wQokWwIVLT1tTz7P8eHkM8R0XETo5L5BHr8OxQYgYY4Oyym6wVPyYjaFPVhkmdsEsfbnN1kexIN3rVv0hT50oehcEo-tkzFod_lo7mY1ckRO130eUDDq3Zn9RwSvfPcc8xxPz-j2jz89sSShmoQRvm4pbvMqIK68dJdFDFE7w
var refresh_token='';//AQBiNdiNyidL_DDLRAsy8f6uMkfInxekqrN_iWN-2fEA4H3NSoK6RbKuyHqtokkQQP75D5cgGSHEdIXgshIwxR3UxDaCuAy8zLePHbaMJJNQw7QsHlDeoz_0cbxt5b153Qo
var controller = {};

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

controller.login = function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
};

// Redirects to 
// http://localhost:8080/#access_token=BQCaY4E-1wQokWwIVLT1tTz7P8eHkM8R0XETo5L5BHr8OxQYgYY4Oyym6wVPyYjaFPVhkmdsEsfbnN1kexIN3rVv0hT50oehcEo-tkzFod_lo7mY1ckRO130eUDDq3Zn9RwSvfPcc8xxPz-j2jz89sSShmoQRvm4pbvMqIK68dJdFDFE7w&refresh_token=AQBiNdiNyidL_DDLRAsy8f6uMkfInxekqrN_iWN-2fEA4H3NSoK6RbKuyHqtokkQQP75D5cgGSHEdIXgshIwxR3UxDaCuAy8zLePHbaMJJNQw7QsHlDeoz_0cbxt5b153Qo
controller.callback = function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
  var homeUrl = '/app/'

  if (state === null || state !== storedState) {
    res.redirect(homeUrl +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect(homeUrl +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect(homeUrl +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
};

controller.refreshtoken = function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
};

module.exports = controller;