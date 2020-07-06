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

var access_token='';//BQCaY4E-1wQokWwIVLT1tTz7P8eHkM8R0XETo5L5BHr8OxQYgYY4Oyym6wVPyYjaFPVhkmdsEsfbnN1kexIN3rVv0hT50oehcEo-tkzFod_lo7mY1ckRO130eUDDq3Zn9RwSvfPcc8xxPz-j2jz89sSShmoQRvm4pbvMqIK68dJdFDFE7w
var refresh_token='';//AQBiNdiNyidL_DDLRAsy8f6uMkfInxekqrN_iWN-2fEA4H3NSoK6RbKuyHqtokkQQP75D5cgGSHEdIXgshIwxR3UxDaCuAy8zLePHbaMJJNQw7QsHlDeoz_0cbxt5b153Qo
app.use(session({secret:"amoeba"}));

controller.start = [
	function(req, res){
		res.render("appStartPage", {spotifyAuthToken: access_token});
	}
];

module.exports = controller;