var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema= new Schema({
	name:String,
	email:{type:String, unique:true, required:true},
	password:{type:String, required:true},
	status:String,
	createdAt:{type:Date, default:Date.now}
});
mongoose.model("user", UserSchema);
