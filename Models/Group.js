const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const model = mongoose.model;

const groupSchema = Schema({
    nom : {type : String , required : true },
    teacher : {type : Number , ref : "Teacher", required : true},
    students : [{type : Number , ref : "Student", required : true}],
    courses : [{type : Schema.Types.ObjectId , ref : "Group", required : true}],
    time: {type: String, required: true },
    pricePerLecture: {type : Number , required : true},
});

const Group = model("Group" , groupSchema);

module.exports = Group;

