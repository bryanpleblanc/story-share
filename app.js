// ===============================================
// Basic Setup
// ===============================================
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser"); // For getting form data
var favicon = require('serve-favicon'); // For Favicon
var path = require('path'); // For Favicon
var seedDB = require("./seeds"); // Seeding DB
var passport = require('passport');
var LocalStrategy = require('passport-local');
var flash = require('connect-flash');

var app = express();
mongoose.connect("mongodb://localhost/stories_app"); // For connecting to DB using mongoose, "stories_app" is name of new DB name


app.use(bodyParser.urlencoded({extended:true})); // For getting form data
app.use(favicon(path.join(__dirname, 'views', 'favicon.ico'))); // For path to favicon.ico
app.use(express.static(__dirname + "/public")); // served public directory
app.set("view engine", "ejs"); // For setting template engines


// Models
var Story = require('./models/story.js');
var Comment = require('./models/comment.js');
var User = require('./models/user.js');


// DB Seeding - test function
seedDB();

// ===============================================
// PASSPORT CONFIG.
// ===============================================
app.use(require("express-session")({
    secret: "Miley is the cutiest dog!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize()); // starts passport
app.use(passport.session()); // Piggy backs off express-session
app.use(flash());


// for storing sessions
passport.serializeUser(function(user, done){
    done(null, user.id);
});

// for decoding sessions
passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user);
    });
});

passport.use('local-signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, username, password, done){
    // Waits for everything to run before
    process.nextTick(function(){
        //check if user is in database
        console.log(username);
        User.findOne({'local.username': username}, function(err, user){
            if(err) {
                return done(err);
            }
            if(!user) {
                // false - user can't signup
                return done(null, false, req.flash('signupMessage', 'Email is already taken'));
            } else {
                console.log(username);
                var newUser = new User();
                newUser.username = username;
                newUser.password = password;
                console.log('here!');
                newUser.save(function(err){
                    if(err){
                        throw err;
                    } else {
                        return done(null, newUser);
                    }
                })
            }
        })
    });
}));





// ===============================================
// Landing Page Route - GET
// ===============================================
app.get("/", function(req, res) {
    res.render("stories/index");
});



// ===============================================
// Stories Page Routes - GET
//
// Description:
// ===============================================
app.get("/stories", function(req, res) {
    Story.find({}, function(err, allStories){
        if(err){
            console.log("could not get data!");
        } else {
            console.log("got data!");
            res.render("stories/stories", {storyList: allStories});
        }
    });
});


// ===============================================
// New Stories Route - GET
//
// Description: Displays form to be posted to /stories
// ===============================================
app.get("/stories/create-story", function(req, res) {
    res.render("stories/create-story");
});


// ===============================================
// New comments - GET
// ===============================================
app.get("/stories/:id/comments/new", isLoggedIn, function(req, res) {
    Story.findById(req.params.id, function(err, foundStory) {
        if(err) {
            console.log("can't find story by id for create-comments")
        } else {
            res.render("comments/create-comment", {story: foundStory});
        }
    });
});




// ===============================================
// Stories Page Routes - POST
//
// Description: gets data from form and add to storyList
// Array redirect back to stories page
// Need NPM "body-parser" to do this
// ===============================================
app.post("/stories", function(req, res) {
    // data from new-story form
    var title = req.body.title;
    var author = req.body.genre;
    var genre = req.body.genre;
    var image = req.body.image;
    var description = req.body.description;
    var featured = false;
    var likes = 0;
    var dislikes = 0;

    var newStory = {title, author, genre, image, description, featured, likes, dislikes};

    Story.create(newStory, function(err, newlyCreated){
        if(err) {
            console.log("Can't create story!");
        } else {
            console.log("Story created!");
            //redirect back to /stories
            res.redirect("stories/stories");
        }
    });
});

// ===============================================
// Comments Page Routes - POST
// ===============================================

app.post("/stories/:id/comments", isLoggedIn, function(req, res){
    // Look up story by ID
    var id = req.params.id;
    //console.log("id: " + id);
    Story.findById(id, function(err, foundStory) {
        if(err) {
            console.log("Can't find story!");
            res.redirect("/stories");
        } else {
            // Create comment, associate with story, and save
            Comment.create(req.body.comment, function(err, comment){
                if(err) {
                    console.log("can't create comment.")
                } else {
                    foundStory.comments.push(comment);
                    foundStory.save();
                    res.redirect("/stories/"+id);
                }
            });
        }
    });
});



// ===============================================
// More information about story - SHOW / GET
// ===============================================
app.get("/stories/:id", function(req, res) {
    var id = req.params.id;
    Story.findById(id).populate("comments").exec(function(err, foundStory){
        if(err) {
            console.log("Could not find story" + err);
        } else {
            //console.log(foundStory);
            res.render("stories/story", {story: foundStory})
        }
    });
});













// ===============================================
// AUTH ROUTE
// Show Regiser Form - GET
// ===============================================
app.get("/register", function(req, res) {
    res.render("register", {message: req.flash('signupMessage')} );
});


// ===============================================
// AUTH ROUTE
// Handle Sign up Logic - POST
// ===============================================
app.post("/register", passport.authenticate('local-signup', {
    successRedirect: '/stories',
    failureRedirect: '/register',
    failureFlash: true // sends flash message
}));

// ===============================================
// AUTH ROUTE
// Show Login Form - GET
// ===============================================
app.get("/login", function(req, res) {
    res.render("login");
});



// ===============================================
// AUTH ROUTE
// Handle Login Logic - POST
// ===============================================
app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/stories",
        failureRedirect: "/login"
    }), function(req, res) {
});


// ===============================================
// AUTH ROUTE
// Logout route - GET
// ===============================================
app.get("/logout", function(req, res) {
    req.logout;
    res.redirect("/");
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login")
}

















// ===============================================
// Run Server
// ===============================================
app.listen(3000, function(){
    console.log("Server has started");
});
