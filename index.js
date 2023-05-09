const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require('cors');



app.use(cors());

port = 8050;

const courseRouter = require("./routes/courses");
const studentRouter = require("./routes/students");
const teacherRouter = require("./routes/teachers");

mongoose.connect('mongodb://127.0.0.1:27017/courses', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

app.use(express.json());

app.use("/api/courses" , courseRouter);
app.use("/api/students" , studentRouter);
app.use("/api/teachers" , teacherRouter);




app.listen(port, () => console.log("Server listening on port"+ port + "!"))