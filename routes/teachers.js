const express = require('express');
const router = express.Router();
const axios = require('axios');
const JwtVerifier = require("../functions/JwtVerifier");
const Group = require("../Models/Group");
const Teacher = require("../Models/Teacher");
const Student = require("../Models/Student");
const Enrollement = require("../Models/Enrollement");

const url = "https://userservice-production-dd99.up.railway.app";

router.post("/accept" , async(req,res)=>{
    try {
        const user = await JwtVerifier.teacher(req.headers.authorization.split(' ')[1]);
        let teacher = await Teacher.findById(user.id);
        if (!teacher) {
            const newTeacher = new Teacher({
                _id: user.id,
                groups : []
                // Set default name here
                // Add other default properties as necessary
            });
            await newTeacher.save();
        }

        // Find the student again to make sure we have the latest version
        teacher = await Teacher.findOne({_id : user.id});
        const enrollementid = req.body.enrollementid;
        console.log(enrollementid);
        let enrollement = await Enrollement.findOne({teacher : teacher._id , _id: enrollementid });
        console.log(enrollement);
        if (!enrollement) {
            throw new Error("you are not allowed to access this entity");
        }else{
            enrollement.status = "accepted";
            let group = await Group.findOne({_id : enrollement.group});
            if (group.students.includes(enrollement.student)) {
                // enrollment.student is in group.students
                responsed = "student already present in the group";
                return res.status(400).json({response : responsed});
            }
            group.students.push(enrollement.student);

            // Save the updated Group instance to the database
            group.save()
            .then(async () => {
                console.log("New student added to the group successfully.");
                const student = await Student.findById(enrollement.student);
                student.groups.push(group._id);
                await student.save();
                await enrollement.save();
                res.status(200).json(group);
            })
            .catch((error) => {
                console.error("Error while adding new student to group:", error);
                res.status(401).json(error);
            });
        }
        
    } catch (error) {
        console.log(error);
        res.status(401).json(error);
    }
});
router.post("/groups/create" , async(req,res)=>{
    try {
        const user = await JwtVerifier.teacher(req.headers.authorization.split(' ')[1]);
        console.log(user.id);
        let teacher = await Teacher.findById(user.id);
        if (!teacher) {
            const newTeacher = new Teacher({
                _id: user.id,
                groups : []
                // Set default name here
                // Add other default properties as necessary
            });
            await newTeacher.save();
        }

        // Find the student again to make sure we have the latest version
        teacher = await Teacher.findOne({_id : user.id});
        const { nom , time , pricePerLecture , description , nbEtudiants } = req.body;

        const students = []; // initialize students array with an empty array

        // Create a new group object
        const group = new Group({
            nom: nom,
            teacher: teacher._id,
            students: students,
            courses : [],
            time: time,
            pricePerLecture: pricePerLecture,
            niveau : user.niveau,
            description : description ,
            nbEtudiants : nbEtudiants
          });

        // Save the new group to the database
        await group.save();

        teacher.groups.push(group._id);

        await teacher.save();

        console.log(group);

        // Send a success response
        res.status(201).json({ message: 'Group created successfully', group });
        
    } catch (error) {
        console.log(error);
        res.status(401).json(error);
    }
});
router.get("/groups" , async(req,res)=>{
    try {
        const user = await JwtVerifier.teacher(req.headers.authorization.split(' ')[1]);
        let teacher = await Teacher.findById(user.id);
        if (!teacher) {
            const newTeacher = new Teacher({
                _id: user.id,
                groups : []
                // Set default name here
                // Add other default properties as necessary
            });
            await newTeacher.save();
        }

        // Find the student again to make sure we have the latest version
        teacher = await Teacher.findOne({_id : user.id});
        const groups = await Group.find({ teacher: teacher._id }).populate('courses');

        // Send the list of groups in the response
        res.status(200).json(groups);
        
    } catch (error) {
        console.log(error);
        res.status(401).json(error);
    }
});
router.get("/enrollements" , async(req,res)=>{
    try {
        const user = await JwtVerifier.teacher(req.headers.authorization.split(' ')[1]);
        let teacher = await Teacher.findById(user.id);
        if (!teacher) {
            const newTeacher = new Teacher({
                _id: user.id,
                groups : []
                // Set default name here
                // Add other default properties as necessary
            });
            await newTeacher.save();
        }

        // Find the student again to make sure we have the latest version
        teacher = await Teacher.findOne({_id : user.id});
        const enrollements = await Enrollement.find({ teacher: teacher._id }).populate('teacher group');
        let students = enrollements.map((enrollement) => enrollement.student);
        console.log(students);

        await axios.post(url + "/api/v1/open/students", { students })
        .then(async (response) => {
            let data = response.data;
            console.log(data);
            let resp = await addExtraInfo(enrollements, data);
            return res.json(resp);
            //console.log(object);
        })
        .catch((error) => {
        });

        // Send the list of groups in the response
        //res.status(200).json(enrollements);
        
    } catch (error) {
        console.log(error);
        res.status(401).json(error);
    }
});

router.get("/revenue" , async (req,res)=>{
    try {
        const user = await JwtVerifier.teacher(req.headers.authorization.split(' ')[1]);
        let teacher = await Teacher.findById(user.id);
        if (!teacher) {
            const newTeacher = new Teacher({
                _id: user.id,
                groups : []
                // Set default name here
                // Add other default properties as necessary
            });
            await newTeacher.save();
        }

        // Find the student again to make sure we have the latest version
        teacher = await Teacher.findOne({_id : user.id});
        return res.json(teacher);
        
        
        
    } catch (error) {
        console.log(error);
        res.status(401).json(error.message);
    }
});

async function addExtraInfo(firstList, secondList) {
    let thirdList = [];
    for (let i = 0; i < firstList.length; i++) {
      const studentId = firstList[i].student;
      const extraInfo = secondList.find((student) => student.id === studentId);
      let child = firstList[i];
      if (extraInfo) {
        thirdList[i] = { child, extraInfo };
      }
    }
    return thirdList;
}


module.exports = router;