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

controller.home = [
	function(req, res, next){
		section.find({}, function(err, sects){
			req.sections = sects;
			next();
		});	
	}, 
	function(req, res, next){
		article.find({}, function(err, posts){
			if("user" in req.session){
				console.log("Homepage, signed in user in session:\n"+req.session.user);
				req.sections.forEach(function(s){
					console.log(s.name);
				});				
				//console.log("Homepage, signed in user in utils: \n"+utils.signedInUser);
				res.render("home", {"currentUser":req.session.user, "sections":req.sections, "articles":posts});
			}else{
				console.log("Homepage, signed in user: \n"+{});
				res.render("home", {"currentUser":{}, "sections":req.sections, "articles":posts});
			}
		});
	}
];

controller.createArticle = [
	function(req,res,next) {
		console.log("Adding new article.")
		if("title" in req.body && req.body.title !== '') {			
			next();
		} else {
			res.send(400);
		}
		//function to validate that the todo isn't empty
	},
	function(req, res, next){
		console.log(req.body); 
		var sectionStrings = req.body.sections.split(",");
		var sections = [];
		sectionStrings.forEach(function(s){
			var query = section.where({"name":s});
			query.findOne(function(err, sect){
				sections.push(sect);
			});			
		});
		req.body.sections = sections;
		console.log(req.body); 
		article.create(req.body, function(err, post){
			if(err) return next(err);//Parameter 1 passed into next() means error occurred.
			res.redirect("/");
		});
	}
];


controller.deleteArticle = [function(req, res){
	
}];


controller.editArticle = [function(req, res, next){
	
}];
	
controller.newSection = [
	function(req,res,next) {
		console.log("Adding new section.")
		if("name" in req.body && req.body.name !== '') {			
			next();
		} else {
			res.send(400);
		}
		//function to validate that the todo isn't empty
	},
	function(req, res, next){
		console.log(req.body); 
		section.create(req.body, function(err, section){
			if(err) return next(err);//Parameter 1 passed into next() means error occurred.
			res.redirect("/");
		});
}];

controller.listArticleForSection = [function(req, res){

}];

module.exports = controller;