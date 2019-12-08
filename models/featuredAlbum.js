var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var FeaturedAlbumSchema= new Schema({
	artistName:{type:String, required:true},
	albumName:{type:String, required:true},
	embedCode:{type:String, required:true},
	createdAt:{type:Date, default:Date.now} 
});
mongoose.model("featuredalbums", FeaturedAlbumSchema);