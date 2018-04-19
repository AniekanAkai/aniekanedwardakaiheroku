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

var mongoDBHost = process.env.MONGODB_URI || "localhost";
mongoose.connect('mongodb://'+mongoDBHost+'/myblog');

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

app.get("/deleteArticle/:articleName", function(req, res){
		article.remove({"title":req.params.articleName}, function(err){
			if(err){
				return err;
			}
			console.log("Deleting the article: " + req.params.articleName);
			io.sockets.emit("deleteArticle", req.params.articleName);			
		});		
});

app.get("/sendNewArticle/:articleName",  function(req, res){
	
	article.findOne({"title":req.params.articleName}, function(err, articleInfo){
		if(err){
			console.log("Error occured.");
			console.log(err);
			res.send(404);
		}else{
			console.log("No Error occured.");
			console.log(articleInfo);
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