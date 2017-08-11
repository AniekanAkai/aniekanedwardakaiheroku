var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema= new Schema({
	name:String,
	email:String,
	password:String,
	status:String,
	createdAt:{type:Date, default:Date.now}
});
mongoose.model("user", UserSchema);
