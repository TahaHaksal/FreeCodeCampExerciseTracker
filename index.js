const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env['MONGO_URI']);
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
});

const exerciseSchema = new mongoose.Schema({
  username: {type: String, required: true},
  _userId: {type: mongoose.Types.ObjectId, required: true},
  description: { type: String, required: true },
  duration: {type: Number, required: true},
  date: { type: Date, required: true},
});

const User = mongoose.model("User", userSchema);
const Exercise = mongoose.model("Exercise", exerciseSchema);

app.post("/api/users", async (req, res) => {
  if (!req.body.username){
    res.json({
      error: "Username is required"
    });
    return ;
  }
  const user = new User({username: req.body.username});
  await user.save();
  res.json({
    username: user.username,
    _id: user._id,
  });
});

app.get("/api/users", async (req, res) => {
  const users = await User.find({}, 'username _id').exec();
  res.json(users);
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const user = await User.find({_id: req.params._id}).exec();
  let dateString = req.body.date ? new Date(req.body.date) : new Date();
  const exercise = new Exercise({
    username: user[0].username,
    _userId: user[0]._id,
    duration: parseInt(req.body.duration),
    description: req.body.description,
    date: dateString,
  });
  const {username, _userId, description, duration, date} = exercise;
  await exercise.save();
  res.json({
    username: username,
    _id: _userId,
    description: description,
    duration: duration,
    date: dateString.toDateString()
  });
})

app.get('/api/users/:_id/logs', async (req, res) => {
  const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 0;
  let fromDate = req.query.from ? new Date(req.query.from) : new Date(0);
  let toDate = req.query.to ? new Date(req.query.to) : new Date();
  const exercises = await Exercise
  .find({_userId: req.params._id, date: {$gte: fromDate, $lte: toDate}}, 'description duration date')
  .limit(limit)
  .exec();
  const user = await User.find({_id: req.params._id}).exec();
  const transformedExercises = exercises.map((exercise) => ({
    description: exercise.description,
    duration: exercise.duration,
    date: new Date(exercise.date).toDateString()
  }));
  res.json({
    username: user.username,
    count: transformedExercises.length,
    _id: user._id,
    log: transformedExercises
  });
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
