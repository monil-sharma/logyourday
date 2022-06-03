const express= require("express");
const bodyParser= require("body-parser");
const mongoose= require("mongoose");
const ejs= require("ejs");
const session= require("express-session");
const passport= require("passport");
const passportLocalMongoose= require("passport-local-mongoose");
const { application } = require("express");

const app=express();
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret: "<some text>",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("<connection URL>");


const itemsSchema=new mongoose.Schema({
    listItem: String
  });

const List= mongoose.model("List", itemsSchema);

const postSchema= new mongoose.Schema({
    postTitle: String,
    content: String
  });
  
const Post= mongoose.model("Post", postSchema);

const userSchema= new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    todolist: [itemsSchema],
    journal: [postSchema]
});

userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.route("/")
.get((req,res)=>{
    res.sendFile("index.html");
});

app.route("/login")
.post((req,res)=>{
    if (req.isAuthenticated()){
        console.log("Success");
        res.redirect("/dashboard");
      } else {
          console.log("fail");
        res.redirect("/");
      }
});

app.get("/logout", function(req, res){
    req.logout((err)=>{
        if(err)
        throw err;
        res.redirect("/");
    });
    
  });


app.route("/register")
.post((req,res)=>{
    console.log(req.body.username);
    User.register({username: req.body.username, firstName: req.body.fName, lastName: req.body.lName}, req.body.password, function(err, user){
        if (err) {
          console.log(err);
          res.redirect("/");
        } else {
          passport.authenticate("local")(req, res, function(){
            res.redirect("/dashboard");
          });
        }
      });
});

app.get("/dashboard", (req,res)=>{
    res.render("dashboard", {titleName: "Test Name"});
});


app.get("/todolist", (req,res)=>{
    res.render("list", {listTitle: "Title Name", newListItems:["test"]});
});


app.get("/journal", (req,res)=>{
    res.render("journal", {startingContent: "Random quote", posts: []});
});




app.listen(3000, ()=>{
    console.log("Server started successfully");
});