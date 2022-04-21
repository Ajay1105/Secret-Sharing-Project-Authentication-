require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const { redirect } = require("express/lib/response");
const app = express();
const md5 = require('md5');
//const encrypt = require("mongoose-encryption");

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

const uri = 'mongodb+srv://aky11052003:Engineering@cluster0.axglx.mongodb.net/insertDB?retryWrites=true&w=majority';
try {
    mongoose.connect(
      uri,
      { useNewUrlParser: true, useUnifiedTopology: true },
      () => console.log("Mongoose is connected")
    );
  } catch (e) {
    console.log("could not connect");
}

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//userSchema.plugin (encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });
const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/secrets", function (req, res) {
    res.render("secrets");
});

app.post("/register",(req,res)=>{
 const userName = req.body.username;
 const password = req.body.password;
 const data = new User({
     email: userName,
     password: md5(password)
 });
 data.save();
 res.redirect("/");
});

app.post("/login", (req,res)=>{
    let s =1;
    const userName = req.body.username;
    const password = md5(req.body.password);
    User.findOne({email: userName},(err, data) => {
        if(err){console.log(err)}
        else{
            if( data.password == password){
                s = 0;
                res.redirect("/secrets");
            }
            else{
                res.send("Email and Password does not match!");
            }
        }
    });
});








app.listen(3000, function () {
    console.log("Server started on port 3000.");
});
