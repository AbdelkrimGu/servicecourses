const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const model = mongoose.model;

const courseSchema = Schema({
    nom : {type : String , required : true },
    teacher : {type : Number , ref : "Teacher" , required : true},
    group : {type : Schema.Types.ObjectId , ref : "Group", required : true},
    presents: [{type : Number, ref : "Student"}],
    absents: [{type : Number , ref : "Student"}],
    token : { type: String },
    dateTime: {type: String, required: true },
    price : {type : Number , required : true},
    status : {type : String , required : true}
});

const Course = model("Course" , courseSchema);

module.exports = Course;