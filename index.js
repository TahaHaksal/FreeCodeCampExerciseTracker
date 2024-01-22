const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//require("dotenv");

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.use(bodyParser.urlencoded({ extended: true }));

console.log(process.env['MONGO_URI']);
mongoose.connect(process.env['MONGO_URI']);
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
});

const exerciseSchema = new mongoose.Schema({
  user: {
    type: userSchema,
    required: true,
  },
  description: { type: String },
  date: { type: Date },
});

const User = mongoose.model("User", userSchema);
const Exercise = mongoose.model("Exercise", exerciseSchema);

app.post("/api/users", (req, res) => {
  const user = new User(req.body.uname);
  console.log(user);
  res.json({
    username: user.name,
    _id: user._id,
  });
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
