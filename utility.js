var mongoose = require("mongoose"),
	article = mongoose.model("article"),
	section = mongoose.model("section"),
	Person = mongoose.model("user"),
	dbControl = {},
	express = require("express"),
	app = express(),
	server = require('http').createServer(app),
	session= require("express-session"),
	io = require("socket.io").listen(server);

dbControl.addNewArticle = function(title, content, sections, author){
		
		var body = {};
		body.title = title;
		body.body = content;
		body.author = author;
		
		var sectionStrings = sections.split(",");
		var sectionsArray = [];
		sectionStrings.forEach(function(s){
			var query = section.where({"name":s});
			query.findOne(function(err, sect){
				sectionsArray.push(sect);
			});			
		});
		body.sections = sectionsArray;
		//console.log(body); 
		article.create(body, function(err, post){
			if(err){
				console.log(err);
				return false;//Parameter 1 passed into next() means error occurred.
			}
			return true;
		});
};
dbControl.removeArticle = function(title){
	article.remove({"title":title}, function(err){
		if(err){
			return err;
		}
		console.log("Deleting the article: " + title );
		return true;	
	});
};
dbControl.addNewUser = function(name, email, pw){};
dbControl.removeUser = function(email){};

module.exports = dbControl;