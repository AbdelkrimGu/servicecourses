const express = require('express');
const router = express.Router();
const axios = require('axios');

const Teacher = require('../Models/Teacher');

const url = "https://userservice-production-dd99.up.railway.app";

router.get("/teachers", async (req,res) => {
    let teachers = await Teacher.find({}).populate('groups').select('-enrollements');
    // Create a list of teacher IDs
    let teacherIds = teachers.map((teacher) => teacher._id);
    await axios.post(url + "/api/v1/open/", { teacherIds })
    .then(async (response) => {
        let data = response.data;
        let resp = addExtraInfo(data, teachers);
        return res.json(data);
        //console.log(object);
    })
    .catch((error) => {
    });
    //res.json(teachers);
});


router.get("/teacher", async (req,res) => {
    let id = req.query.id;
    let teacher = await Teacher.findOne({_id : id}).populate('groups').select('-enrollements');
    console.log(teacher.groups);

    await axios.get(url + "/api/v1/open/teacher?id=" + id)
    .then(async (response) => {
        let data = response.data;
        data.groups = teacher.groups;
        return res.json(data);
        //console.log(object);
    })
    .catch((error) => {
        return res.status(400);
    });
    //res.json(teachers);
});

function addExtraInfo(firstList, secondList) {
    for (let i = 0; i < firstList.length; i++) {
      const teacherId = firstList[i].id;
      const extraInfo = secondList.find((teacher) => teacher._id === teacherId);
      if (extraInfo) {
        firstList[i] = { ...firstList[i], groups: extraInfo.groups };
      }
    }
}

module.exports = router;