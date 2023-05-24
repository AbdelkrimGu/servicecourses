const express = require('express');
const router = express.Router();
const {DefaultSignatureValidator} = require("chargily-epay-gateway/lib/Webhook");

const Paiement = require('../Models/Paiement');


router.get("/front", async (req,res) => {
    console.log(req);
    console.log(req.body);
    const myObjectString = JSON.stringify(req.body);
    let paiement = new Paiement({
        contenu : myObjectString,
        from : "front"
    });
    console.log(paiement);
    await paiement.save();
    res.json({message : "accepted from front"});
});


router.get("/webhook", async (req,res) => {
    console.log(req);
    console.log(req.body);
    const myObjectString = JSON.stringify(req.body);
    let paiement = new Paiement({
        contenu : myObjectString,
        from : "webhook"
    });
    console.log(paiement);
    await paiement.save();

    let signature = req.header('Signature');

    let rs = DefaultSignatureValidator.isValid(
            signature, 
            process.env.CHARGILY_APP_SECRET,
            req.body); // return boolean
    res.json({message : rs});
});



module.exports = router;