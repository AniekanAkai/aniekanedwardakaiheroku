var mongoose = require("mongoose"),
	article = mongoose.model("article"),
	section = mongoose.model("section"),
	Person = mongoose.model("user"),
	controller = {},
	express = require("express"),
	app = express(),
	server = require('http').createServer(app),
	session= require("express-session"),
	io = require("socket.io").listen(server);

var utils = require("../utility")
//controller.signedInUser = {};

app.use(session({secret:"amoeba"}));

controller.home = [function(req, res){
	section.find({}, function(err, sects){
		if("user" in req.session){
			console.log("Homepage, signed in user in session:\n"+req.session.user);
			
			//console.log("Homepage, signed in user in utils: \n"+utils.signedInUser);
			res.render("home", {"currentUser":req.session.user, "sections":sects});
		}else{
			console.log("Homepage, signed in user: \n"+{});
			res.render("home", {"currentUser":{}, "sections":sects});
		}
	});	
}];

controller.createArticle = [function(req, res){

}];

controller.listArticles = [function(req, res){
	
}];

controller.deleteArticle = [function(req, res){
	
}];


controller.editArticle = [function(req, res, next){
	
}];
	
controller.newSection = [function(req, res){

}];

controller.listArticleForSection = [function(req, res){

}];

module.exports = controller;