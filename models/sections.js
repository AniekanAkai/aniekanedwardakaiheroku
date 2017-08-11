var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var SectionSchema= new Schema({
	name:String,
	description:String,
	creator:{type:Schema.Types.ObjectId, ref:"user"},
	permittedViewers:[{type:Schema.Types.ObjectId, ref:"user"}],
	permittedAuthors:[{type:Schema.Types.ObjectId, ref:"user"}],
	createdAt:{type:Date, default:Date.now}
});
mongoose.model("section", SectionSchema);
