const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require('cors');


const allowedOrigins = ['http://127.0.0.1:5501', 'https://e87c-105-235-138-153.ngrok-free.app'];

/*app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials : true,
}));*/

app.use(cors());

port = 8050;

const courseRouter = require("./routes/courses");
const studentRouter = require("./routes/students");
const teacherRouter = require("./routes/teachers");
const exploreRouter = require("./routes/explore");

mongoose.connect('mongodb://127.0.0.1:27017/courses', {
//mongoose.connect('mongodb+srv://abdelkrim:abdelkrim31052001@saned.rgalgfx.mongodb.net/courses?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB', err));

app.use(express.json());

app.use("/api/courses" , courseRouter);
app.use("/api/students" , studentRouter);
app.use("/api/teachers" , teacherRouter);
app.use("/api/explore" , exploreRouter);





app.listen(port, () => console.log("Server listening on port"+ port + "!"))