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
	
var utils = require("./utility");

require("./models/users");
require("./models/sections");
require("./models/articles");

var userController = require("./controllers/users");
var articleController = require("./controllers/articles");
//var sectionController = require("./controllers/sections");
	
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(logger('common'));
app.use(express.static(__dirname+'/public'));

app.set('view engine', 'ejs');

app.use(session({secret:"amoeba"}));

var CONFIG = require('./conf/systemconfig.json');

var mongoDBHost = CONFIG.databaseHost || "localhost";
var mongoDBPort = CONFIG.databasePort || 27017;
console.log(mongoDBHost);

// mongodb://adminAkaiHeroku1:iwillchange1991@ds141175.mlab.com:41175/heroku_25qfl71w
if(mongoDBHost == "localhost"){
	mongoose.connect('mongodb://localhost:'+CONFIG.databasePort+'/'+CONFIG.databaseName);//'/myblog');
}else{
	mongoose.connect('mongodb://'+CONFIG.databaseUser+':'+CONFIG.databasePassword+"@"+mongoDBHost+":"+mongoDBPort+"/"+CONFIG.databaseName);//'/myblog');
}
var article = mongoose.model("article");

app.get("/", articleController.home);
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

io.sockets.on('connection',function(socket){
	console.log("socket connected.");	
});

server.listen(port);