var mongoose = require("mongoose"),
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

controller.listUsers = [function(req, res, next){	
	Person.find({}, function(err, users){
		if(err) return next(err);
		res.render("listUsers", {"currentUser":req.session.user, "users": users});
		//res.render("listUsers", {"currentUser":utils.signedInUser, "users": users});
	});
}];

controller.createUser = [function(req, res){
	// add user to the db
	var newuser = {"name":req.body.fullname, "email":req.body.email, "password":req.body.password, status:"Pending"};
	if("user" in req.session){
		console.log("User is already signed in.");
		res.redirect("/");
	}else{
		Person.create(newuser,function(err,user) {
			if(err) return next(err);//Parameter 1 passed into next() means error occurred.
			
			// assign new user as signedInUser
			utils.signedInUser = user;
			req.session.user = user;
			
			// redirect to homepage
			res.redirect("/");
		});
	}
}];

controller.login = [function(req, res){
	console.log(req.body);
	if(req.body.email!=''&& req.body.password!=''){
		Person.find({email:req.body.email, password:req.body.password},function(err, users){
			
			
			// assign new user as signedInUser
			utils.signedInUser = users[0];
			req.session.user = users[0];
			
			console.log("User found.\n"+req.session.user);
			// redirect to homepage
			res.redirect("/");
		});
	}else{
		console.log("error occured");
		res.render("loginPage", {"errorMessage":"Error occured"});
	}
}];

controller.logout = [function(req, res){
	if("email" in utils.signedInUser){
		// assign new user as signedInUser
		utils.signedInUser = {};
		delete req.session.user;		
	
		// redirect to homepage
		res.redirect("/");
	}
}];


controller.updateUser = [function(req, res, next){
		if(req.body.submission){
			next();
		}else{
			console.log("user not updated.");
			res.send(400);
		}
	},function(req, res, next){
		if(req.body.submission == "Delete User"){
			console.log(req.body);
			res.send(req.body.name + "  will be deleted.");//controller.deleteUser();
		}else if(req.body.submission == "Save Changes"){
			Person.findById(req.param('userId'),function(err,user) {
				if(err) return next(err);
				if(!user) return res.send(404);
				req.updateduser = user;
				next();
			});
		}else{
			console.log(req.body.submission + " does not exist.");
		}
	}, function(req, res, next){
		for(key in req.body) {
			req.updateduser[key] = req.body[key];
		}
		req.updateduser.save(function(err,user) {
			res.redirect("/admin/allUsers");
		});
	}
];
	
controller.deleteUser = [function(req, res){

}];

controller.changeStatus = [function(req,res){

}];

module.exports = controller;