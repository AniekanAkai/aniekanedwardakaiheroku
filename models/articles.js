var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ArticleSchema= new Schema({
	title:{type:String, unique:true, required:true},
	body:String,
	sections:[{type:Schema.Types.ObjectId, ref:"section"}], //[String],
	author:{type:Schema.Types.ObjectId, ref:"user", required:true},//ref is the name of the mongoose model being used.
	createdAt:{type:Date, default:Date.now} 
});
mongoose.model("article", ArticleSchema);