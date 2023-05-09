const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const model = mongoose.model;

const enrollementSchema = Schema({
    group : {type : Schema.Types.ObjectId , ref : "Group" , required : true},
    student : {type : Number ,ref : "Student", required : true},
    teacher: {type : Number ,ref : "Teacher", required : true},
    status : {type : String , required : true},
});

const Enrollement = model("Enrollement" , enrollementSchema);

module.exports = Enrollement;

