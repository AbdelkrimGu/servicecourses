const express = require('express');
const router = express.Router();
const axios = require('axios');
const JwtVerifier = require("../functions/JwtVerifier");
const Group = require("../Models/Group");
const Course = require("../Models/Course");
const Student = require("../Models/Student");
const Enrollement = require("../Models/Enrollement");
const Teacher = require('../Models/Teacher');

router.post("/enroll" , async(req,res,next)=>{
    try {
        const user = await JwtVerifier.student(req.headers.authorization.split(' ')[1]);
        let student = await Student.findById(user.id);
        if (!student) {
            const newStudent = new Student({
                _id: user.id,
                premium: true,
                balance : 400
                // Set default name here
                // Add other default properties as necessary
            });
            await newStudent.save();
        }

        // Find the student again to make sure we have the latest version
        const updatedStudent = await Student.findOne({_id : user.id}).populate('enrollements');
        if (!updatedStudent.premium) {
            throw new Error("Student doesn't have premium access");
        }
        const groupId = req.body.groupid;

        console.log(updatedStudent);
        const group = await Group.findOne({_id : groupId});
        const enrollmentExists = updatedStudent.enrollements.some(
            (enrollment) => enrollment.group == groupId
        );
        console.log(enrollmentExists);
        if (enrollmentExists) {
            return res.status(400).json({
              message: 'already enrolled in this group',
            });
        }

        const teacher = await Teacher.findOne({_id : group.teacher });

        let enrollement = new Enrollement({
            group: group._id,
            student: updatedStudent._id,
            teacher: group.teacher,
            status : "enrolled"
        }); 

        await enrollement.save();
        teacher.enrollements.push(enrollement._id);
        updatedStudent.enrollements.push(enrollement._id);
        await updatedStudent.save();
        await teacher.save();
        res.status(201).json(enrollement);
        
    } catch (error) {
        console.log(error);
        res.status(401).json(error.message);
    }
});


router.post("/enter" , async(req,res)=>{
    try {
        const user = await JwtVerifier.student(req.headers.authorization.split(' ')[1]);
        let student = await Student.findById(user.id);
        const courseid = req.body.courseid;
        let course = await Course.findById(courseid);
        let enrollement = await Enrollement.findOne({studentId : student._id , courseId : course._id });
        if (!enrollement) {
            throw new Error("you are not enrolled in this course");
        }else{
            enrollement.status = "entered";
        }
        
    } catch (error) {
        console.log(error);
        res.status(401).json(error);
    }
});

router.get("/cours" , async(req,res)=>{
    try {
        const user = await JwtVerifier.student(req.headers.authorization.split(' ')[1]);
        console.log(user.id);
        let student = await Student.findById(user.id);
        if (!student) {
            const newStudent = new Student({
                _id: user.id,
                premium: true,
                balance : 400
                // Set default name here
                // Add other default properties as necessary
            });
            await newStudent.save();
        }

        // Find the student again to make sure we have the latest version
        const updatedStudent = await Student.findOne({_id : user.id}).populate({
            path: 'groups'
          });
        let courses = [];
        updatedStudent.groups.forEach((group) => {
            courses.push(...group.courses);
        });
        console.log(courses);
        const specialVariable = [];

        for (let i = 0; i < courses.length; i++) {
            const course = await Course.findById(courses[i]);
            specialVariable.push(course);
          }
          // Do something with the courses array
        
        //console.log(updatedStudent);
        if (!updatedStudent.premium) {
            throw new Error("Student doesn't have premium access");
        }
        res.json(specialVariable);

        

        // Send the list of groups in the response
        //res.status(200).json(cours);
        
    } catch (error) {
        console.log(error);
        res.status(401).json(error);
    }
});


module.exports = router;