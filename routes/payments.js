const express = require('express');
const router = express.Router();

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
    res.json({message : "accepted"});
});



module.exports = router;