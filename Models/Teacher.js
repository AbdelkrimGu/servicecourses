const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const model = mongoose.model;

const teacherSchema = Schema({
    _id : {type : Number , required : true },
    groups : [{type : Schema.Types.ObjectId ,ref : "Group" , required : true}],
    enrollements : [{type : Schema.Types.ObjectId ,ref : "Enrollement" , required : true}],
    revenue : {type : Schema.Types.Decimal128 , default : 0},
});

const Teacher = model("Teacher" , teacherSchema);

module.exports = Teacher;