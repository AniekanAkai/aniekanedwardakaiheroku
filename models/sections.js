var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var SectionSchema= new Schema({
	name:{type:String, unique:true},
	description:String,
	creator:{type:Schema.Types.ObjectId, ref:"user", required:true},
	//permittedViewers:[{type:Schema.Types.ObjectId, ref:"user"}],
	//permittedAuthors:[{type:Schema.Types.ObjectId, ref:"user"}],
	createdAt:{type:Date, default:Date.now}
});
mongoose.model("section", SectionSchema);
