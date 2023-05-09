const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const model = mongoose.model;

const studentSchema = Schema({
    _id : {type : Number , required : true },
    premium : {type : Boolean , required : true},
    balance : {type : Schema.Types.Decimal128 , required : true},
    groups : [{type : Schema.Types.ObjectId ,ref : "Group" , required : true}],
    enrollements : [{type : Schema.Types.ObjectId ,ref : "Enrollement" , required : true}],
});

const Student = model("Student" , studentSchema);

module.exports = Student;