require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const { redirect } = require("express/lib/response");

// for level 5
//passport passport-local passport-local-mongoose
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

//const bcrypt = require('bcrypt');
//const saltRounds = 10;
//const md5 = require('md5');
//const encrypt = require("mongoose-encryption");

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


const uri = `mongodb+srv://${process.env.KEY}@cluster0.axglx.mongodb.net/insertDB?retryWrites=true&w=majority`;
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

userSchema.plugin(passportLocalMongoose);

//userSchema.plugin (encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout",(req,res)=>{
req.logout();
res.redirect("/");
});


app.post("/register", (req, res) => {
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }
    });
});

app.post("/login", (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }
    });
});

// Used upto level 4
// app.post("/register",(req,res)=>{
//  const userName = req.body.username;
//  const password = req.body.password;
//  bcrypt.hash(password, saltRounds, function(err, hash) {
//     const data = new User({
//         email: userName,
//         password: hash //md5(password)
//     });
//     data.save();
//     res.redirect("/");
// });
// });

// Used upto level 4
// app.post("/login", (req,res)=>{
//     let s =1;
//     const userName = req.body.username;
//     const password = req.body.password //md5(req.body.password);
//     User.findOne({email: userName},(err, data) => {
//         if(err){console.log(err)}
//         else{
//             bcrypt.compare(password, data.password, function(err, result) {
//                 if( result == true){
//                     s = 0;
//                     res.redirect("/secrets");
//                 }
//                 else{
//                     res.send("Email and Password does not match!");
//                 }
//             });
//         }
//     });
// });








app.listen(3000, function () {
    console.log("Server started on port 3000.");
});
