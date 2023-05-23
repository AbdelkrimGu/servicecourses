const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const model = mongoose.model;

const paiementSchema = Schema({
    contenu : {type : String, required : true},
    from : {type : String , required : true},
});

const Paiement = model("Paiement" , paiementSchema);

module.exports = Paiement;