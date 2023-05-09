const express = require('express');
const router = express.Router();
const axios = require('axios');
const JwtVerifier = require("../functions/JwtVerifier");
const Group = require("../Models/Group");
const Teacher = require("../Models/Teacher");
const Course = require("../Models/Course");
const Student = require("../Models/Student");
const Enrollement = require("../Models/Enrollement");
const {RtcTokenBuilder, RtcRole} = require("agora-token");
const appID = '8f6e8de6a56448ddb685f1a335a2d81a';
const appCertificate = '7224990ecc4f4c5eaae02b5525633470';
const role = RtcRole.PUBLISHER;
 
const expirationTimeInSeconds = 3600
 
const currentTimestamp = Math.floor(Date.now() / 1000)
 
const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

router.post("/create" , async(req,res)=>{
    try {
        const user = await JwtVerifier.teacher(req.headers.authorization.split(' ')[1]);
        let teacher = await Teacher.findById(user.id);
        if (!teacher) {
            const newTeacher = new Teacher({
                _id: user.id,
                groups: [] 
                // Set default name here
                // Add other default properties as necessary
            });
            await newTeacher.save();
        }

        // Find the student again to make sure we have the latest version
        teacher = await Teacher.findOne({_id : user.id});
        // Extract the necessary values from the request body
        const { nom, group, dateTime, price, status } = req.body;

        // Create a new Course instance
        const course = new Course({
            nom: nom,
            teacher: teacher._id,
            group: group,
            presents: [],
            absents: [],
            dateTime: dateTime,
            price: price,
            status: status
        });


        // Save the new course to the database
        await course.save();

        const ggroup = await Group.findById(group);
        ggroup.courses.push(course._id);
        await ggroup.save();
        console.log(ggroup);

        // Send the new course in the response
        res.status(201).json(course);
        
    } catch (error) {
        console.log(error);
        res.status(401).json(error);
    }
});
router.get("/" , async(req,res)=>{
    try {
        const user = await JwtVerifier.teacher(req.headers.authorization.split(' ')[1]);
        let teacher = await Teacher.findById(user.id);
        if (!teacher) {
            const newTeacher = new Teacher({
                _id: user.id,
                groups: [] 
                // Set default name here
                // Add other default properties as necessary
            });
            await newTeacher.save();
        }

        // Find the student again to make sure we have the latest version
        teacher = await Teacher.findOne({_id : user.id});
        // Find all courses associated with the given teacher ID
        const courses = await Course.find({ teacher: teacher._id }).populate('teacher group presents absents');

        // Send the courses in the response
        res.json(courses);
        
    } catch (error) {
        console.log(error);
        res.status(401).json(error);
    }
});
router.get('/start/:courseId' , async(req,res)=>{
    try {
        const user = await JwtVerifier.teacher(req.headers.authorization.split(' ')[1]);
        const courseId = req.params.courseId;

        // Check if a course with the given ID exists
        const course = await Course.findOne({_id : courseId , teacher : user.id});
        
        if (course !== null) {
            course.status = "started"

            
            const channelName = courseId;
            const uid = user.id;
            const token = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, 0, role, privilegeExpiredTs);
            console.log("Token With Integer Number Uid: " + token);
            course.token = token;
            await course.save();
            
            
            // Send a boolean value indicating whether the course exists or not
            res.json({ exists: course !== null , token : course.token });            
        }
        else{
            res.status(403).json({exists : false});
        }        
        
    } catch (error) {
        console.log(error);
        res.status(401).json(error);
    }
});

router.post('/test' , (req,res)=>{
    console.log(req.headers.authorization);
    res.status(200).json({token : req.headers.authorization});
})
router.get('/join/:courseId' , async(req,res)=>{
    try { 
        console.log(req.headers.authorization);
        const user = await JwtVerifier.student(req.headers.authorization.split(' ')[1]);

        const courseId = req.params.courseId;
        const studentId = user.id;

        // Find the course by courseId and populate its `group` field with the corresponding group document
        const course = await Course.findById(courseId).populate('group');

        // Check if the student's group is the same as the group of the course
        if (course.group.students.includes(studentId)) {
            // Add the user ID to the presents array
            course.presents.push(studentId);

            // Save the course instance with the updated presents array
            await course.save();
            console.log(course.token);
            return res.status(200).send({ isStudentInCourseGroup: true , token : course.token });
        } else { 
            return res.status(401).send({ isStudentInCourseGroup: false });
        }
        
    } catch (error) {
        console.log(error);
        res.status(401).json(error); 
    }
});

module.exports = router;
