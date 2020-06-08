var express = require("express"),
	app = express(),
	port = process.env.PORT || 8080,
	bodyParser = require('body-parser'), 
	multer = require('multer'),
	logger = require('morgan'),
	mongoose = require("mongoose"),
	server = require('http').createServer(app),
	io = require("socket.io").listen(server),
	fs = require("file-system"),
	session= require("express-session"),
	winston = require("winston");
	
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var spotifyConfigPath = "./conf/spotifyConfig.json";

require("./models/users");
require("./models/sections");
require("./models/articles");
require("./models/featuredAlbum");

var userController = require("./controllers/users");
var articleController = require("./controllers/articles");
var appController = require("./controllers/app");
var spotifyAuthController = require("./controllers/spotifyauth");

var utils = require("./utility");	
	
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(logger('common'));
app.use(express.static(__dirname+'/public'));
app.use(cors())
   .use(cookieParser());
app.set('view engine', 'ejs');

app.use(session({secret:"amoeba"}));

var CONFIG = require('./conf/systemconfig.json');
var SPOTIFY_CONFIG = require(spotifyConfigPath);

var mongoDBHost = CONFIG.databaseHost || "localhost";
var mongoDBPort = CONFIG.databasePort || 27017;
console.log(mongoDBHost);

if(mongoDBHost == "localhost"){	
	mongoose.connect('mongodb://localhost:27017/myblog');
} else {
	mongoose.connect('mongodb://'+CONFIG.databaseUser+':'+CONFIG.databasePassword+"@"+mongoDBHost+":"+mongoDBPort+"/"+CONFIG.databaseName);
}
var article = mongoose.model("article");
var person = mongoose.model("user");
var featuredAlbum = mongoose.model("featuredalbums");

//extractArticlesFromXML();

// Endpoints
app.get("/", articleController.home);
app.get("/listPosts", articleController.listAllArticles);
app.post("/login", userController.login);
app.get("/login", function(req, res){
	res.render("loginPage", {"errorMessage":""});
});
app.get("/logout", userController.logout);

app.get("/admin/allUsers", userController.listUsers);

app.get("/register", function(req, res){
	res.render("registerPage", {"fullname":"", "email":""});
});
app.post("/register", userController.createUser);

app.post("/admin/updateUser/:userId", userController.updateUser);

app.post("/admin/deleteUser/:userId", userController.deleteUser);

app.post("/newSection", articleController.newSection);

app.get("/articles/in/:sectionName", articleController.listArticleForSection);

app.get("/article/:articleName", articleController.showArticle);

app.post("/newArticle", articleController.createArticle);

app.get("/newArticle", articleController.createArticle);

app.get("/deleteArticle/:articleName", articleController.deleteArticle);

app.get("/removeDeletedArticle/:articleName", function(req, res){
	io.sockets.emit("deleteArticle", req.params.articleName);
	console.log("Removed the article: " + req.params.articleName);
});

app.get("/sendNewArticle/:articleName",  function(req, res){
	article.findOne({"title":req.params.articleName}, function(err, articleInfo){
		if(err){
			console.log(err);
			res.send(404);
		}else{
			io.sockets.emit('newArticle', articleInfo);
		}
	});
});

app.get("/sendNewSection/:sectionName", function(req, res){
	io.sockets.emit('addingNewSection', req.params.sectionName);
});

app.post("/updateFeaturedAlbum", function(req, res){
	console.log(req.body);
	console.log(req.params);
	var newFeature = {
		artistName:req.body.artistName,
		albumName:req.body.albumName,
		embedCode:req.body.albumEmbedded
	};
	featuredAlbum.create(newFeature, function(err, album){
		if(err){
			console.log(err);
			res.send(404);
			return next(err);
		}else{
			res.redirect("/albumOfTheWeek");
		}
	});
	
});

app.get("/albumOfTheWeek", function(req, res){
	featuredAlbum.findOne().sort({createdAt:'desc'}).exec(function(err, latestFeaturedAlbum){
		res.render("albumOfTheWeek", {"currentUser":{}, "featuredAlbum":latestFeaturedAlbum});
	});
});

app.get("/app/access_token=:access_token&refresh_token=:refresh_token", function(req, res, next){
	let newConfiguration = {};
	newConfiguration.accessToken = req.params.access_token;
	newConfiguration.refreshToken = req.params.refresh_token;
	console.log("Update spotify config: "+JSON.stringify(newConfiguration));
	updateSpotifyConfiguration(newConfiguration);
	next();
}, appController.start);

app.get("/app", appController.start);

app.get('/app/spotifyLogin', spotifyAuthController.login);
app.get('/app/callback', spotifyAuthController.callback);
app.get('/app/refresh_token', spotifyAuthController.refreshtoken);

io.sockets.on('connection',function(socket){
	console.log("socket connected.");	
});

function updateSpotifyConfiguration(newConfiguration){
	let configurationValues = {};
	if(newConfiguration.accessToken){
		configurationValues.accessToken = newConfiguration.accessToken;
	}
	if(newConfiguration.refreshToken){
		configurationValues.refreshToken = newConfiguration.refreshToken;
	}
	console.log(JSON.stringify(configurationValues));
	if(Object.keys(configurationValues).length != 0){
		fs.writeFile(spotifyConfigPath, JSON.stringify(configurationValues), (err) => {
			if (err) console.log('Error writing file:', err)
		});
	}
}

function extractArticlesFromXML(){
		fs.readFile(__dirname + '/public/xml/tumblr_debutmag.xml', function(err, data) {
			if(err){
				console.log(err);
				return;
			}
			parser.parseString(data, function (err, result) {
				if(err){
					console.log(err);
					return;
				}
				person.findOne({email:"admin@localhost.com"},function(err, users){
					if(err){
						console.log(err);
						return;
					}
					
					var channel = result.rss.channel;
					var items = channel[0];
					
					items = items.item;
					//console.log(items[0].content[0]);
					items.forEach(function(item){
						//var item = items[0];
						var title = item.title[0];				
						var wordCount = title.split(' ').length;
						
						//console.log(item.content[0]);
						if(wordCount < 10){
							if(wordCount==1 && title==""){
								//console.log("No title here");
								title = item.pubDate[0];
								utils.addNewArticle(title, item.content[0], "", users);
							}else{
								console.log(title);
								console.log("Title Word count: "+wordCount);
								utils.addNewArticle(title, item.content[0], "", users);
							}
						} else {							
							var finalStringInTitle = title.split(" ")[8];
							
							var newTitle = title.substring(0, title.indexOf(finalStringInTitle));
							var newContent = "<h3>"+title+"</h3>"+item.content[0];
							console.log("new title: "+newTitle);
							//console.log("new content: "+newContent);
						    utils.addNewArticle(newTitle, newContent, "", users);
							console.log( "Title Word count: "+wordCount);
						}			
					});
					console.log('Done');
				});
			});
		});	
}
server.listen(port);