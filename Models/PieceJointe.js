const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const model = mongoose.model;

const piecejointeSchema = Schema({
    course : {type: Schema.Types.ObjectId , ref : "Course" , required : true},
    fileName: {type : String , required:true},
    lien : {type : String , required : true}
});

const PieceJointe = model("PieceJointe" , piecejointeSchema);

module.exports = PieceJointe;