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

app.post("/newSection", articleController.newSection);

app.post("/articles/in/:sectionName", articleController.listArticleForSection);

app.listen(port, function(err){
	console.log("listening on %s", port);
});