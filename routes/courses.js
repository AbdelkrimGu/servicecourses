const express = require('express');
const router = express.Router();
const axios = require('axios');
const JwtVerifier = require("../functions/JwtVerifier");
const Group = require("../Models/Group");
const Teacher = require("../Models/Teacher");
const Course = require("../Models/Course");
const Student = require("../Models/Student");
const Enrollement = require("../Models/Enrollement");
const PieceJointe = require("../Models/PieceJointe");
const {RtcTokenBuilder, RtcRole} = require("agora-token");
const fileUploader = require("../functions/BackBlaze");
const appID = '8f6e8de6a56448ddb685f1a335a2d81a';
const appCertificate = '7224990ecc4f4c5eaae02b5525633470';
const multer = require('multer');
const role = RtcRole.PUBLISHER;

const upload = multer({ dest: 'uploads/' });
 
const expirationTimeInSeconds = 7200
 
const currentTimestamp = Math.floor(Date.now() / 1000)
 
const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

const url = 'https://userservice-production-dd99.up.railway.app'

router.post("/create" , upload.array('files'), async(req,res)=>{
//router.post("/create" , async(req,res)=>{
    console.log(req.body);
    console.log(req.body.files);
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
        const {  group, time ,plan } = req.body;

        // Create a new Course instance
        const course = new Course({
            teacher: teacher._id,
            group: group,
            presents: [],
            absents: [],
            piecesjointes : [],
            plan : plan,
            dateTime: time,
            status: "prochainement"
        });


        // Save the new course to the database
        await course.save();
        console.log(req.files);
        console.log(req.files.files);

        const uploadPromises = Object.values(req.files).map(async (file) => {
            console.log(file);
            let response = await fileUploader.uploadFileToBackblaze(file);
            let url = "https://f005.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=";
            let piecejointe = new PieceJointe({
              course: course._id,
              lien: url + response.fileId,
              fileName: file.originalname
            });
            await piecejointe.save();
            course.piecesjointes.push(piecejointe._id);
          });
        
          // Await all the promises using Promise.all
          await Promise.all(uploadPromises);

        await course.save();

        await course.populate('piecesjointes');



        const ggroup = await Group.findById(group);
        ggroup.courses.push(course._id);
        await ggroup.save();

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
router.get("/:courseId" , async(req,res)=>{
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
        const courseId = req.params.courseId;
        // Find all courses associated with the given teacher ID
        const course = await Course.findOne({_id : courseId, teacher: teacher._id }).populate('teacher group presents absents');

        let students = course.group.students;
        // Send the courses in the response
        await axios.post(url + "/api/v1/open/students", { students })
        .then(async (response) => {
            let data = response.data;
            console.log(data);
            let resp = await addExtraInfo(students, data);
            return res.json({course:course,students:resp});
            //console.log(object);
        })
        .catch((error) => {
        });
        return res.json(course);
        
    } catch (error) {
        console.log(error);
        res.status(401).json(error);
    }
});

async function addExtraInfo(firstList, secondList) {
    let thirdList = [];
    for (let i = 0; i < firstList.length; i++) {
      const studentId = firstList[i];
      const extraInfo = secondList.find((student) => student.id === studentId);
      if (extraInfo) {
        thirdList[i] = { extraInfo };
      }
    }
    return thirdList;
}


router.get('/finish/:courseId' , async(req,res)=>{
    try {
        const user = await JwtVerifier.teacher(req.headers.authorization.split(' ')[1]);
        const courseId = req.params.courseId;

        // Check if a course with the given ID exists
        const course = await Course.findOne({_id : courseId , teacher : user.id});
        
        if (course !== null) {
            course.status = "fait"
            await course.save();  
            
            // Send a boolean value indicating whether the course exists or not
            res.json({ finished : course.status });            
        }
        else{
            res.status(403).json({exists : false});
        }        
        
    } catch (error) {
        console.log(error);
        res.status(401).json(error);
    }
});

router.get('/start/:courseId' , async(req,res)=>{
    try {
        const user = await JwtVerifier.teacher(req.headers.authorization.split(' ')[1]);
        const courseId = req.params.courseId;
        console.log(courseId);

        // Check if a course with the given ID exists
        const course = await Course.findOne({_id : courseId , teacher : user.id});
        
        if (course !== null) {
            course.status = "encours"

            
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


router.get('/join/:courseId' , async(req,res)=>{
    try { 
        console.log(req.headers.authorization);
        const user = await JwtVerifier.student(req.headers.authorization.split(' ')[1]);

        const courseId = req.params.courseId;
        const studentId = user.id;

        console.log(studentId);

        // Find the course by courseId and populate its `group` field with the corresponding group document
        const course = await Course.findById(courseId).populate('group');

        console.log("teacher : ",course.teacher);

        if(course.status !== "encours"){
            if (course.status === "prochainement"){
                return res.status(402).json({message:"ce cours en-ligne est pas encore lancé"});
            }
            else{
                return res.status(402).json({message:"ce cours en-ligne est déja fait"});
            }            
        }

        console.log(course.group.students.includes(studentId));

        // Check if the student's group is the same as the group of the course
        if (course.group.students.includes(studentId)) {
            let student = await Student.findOne({_id : user.id});
            if (course.presents.includes(studentId)){
                return res.status(200).send({ isStudentInCourseGroup: true , token : course.token }); 
            }
            else {
                if(student.balance < course.group.pricePerLecture){
                    return res.status(402).json({message:"votre balance ne vous permet pas d'entrer"})
                }
                console.log(student.balance);
                student.balance -= course.group.pricePerLecture;
                console.log(student.balance);
                await student.save();
                console.log(student.balance);

                let teacher = await Teacher.findById(course.teacher);
                console.log(teacher.revenue);
                teacher.revenue += course.group.pricePerLecture;

                await teacher.save();
                console.log(teacher.revenue);

                // Add the user ID to the presents array
                course.presents.push(studentId);
    
                // Save the course instance with the updated presents array
                await course.save();
                console.log(course.token);
                return res.status(200).send({ isStudentInCourseGroup: true , token : course.token });
            }
            
        } else { 
            return res.status(401).send({ isStudentInCourseGroup: false });
        }
        
    } catch (error) {
        console.log(error);
        res.status(401).json(error); 
    }
});

module.exports = router;
