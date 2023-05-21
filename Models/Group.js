const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const model = mongoose.model;

const groupSchema = Schema({
    nom : {type : String , required : true },
    teacher : {type : Number , ref : "Teacher", required : true},
    students : [{type : Number , ref : "Student", required : true}],
    courses : [{type : Schema.Types.ObjectId , ref : "Group", required : true}],
    time: {type: String, required: true },
    description : {type : String},
    niveauScolaire : {type : String},
    pricePerLecture: {type : Number , required : true},
    creation : {type : Date , default: Date.now},
    nbEtudiants : {type : Number , default : 15}
});

const Group = model("Group" , groupSchema);

module.exports = Group;

