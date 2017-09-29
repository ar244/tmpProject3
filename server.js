// Include Server Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var flash = require('connect-flash');

// Require History Schema
var Story = require("./models/Story");
var User = require("./models/User");

// Create Instance of Express
var app = express();
// Sets an initial port. We'll use this later in our listener
var PORT = process.env.PORT || 3000;

// Run Morgan for Logging
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

app.use(express.static("public"));

// handlebars
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "index" }));
app.set("view engine", "handlebars");


// User authentication
var session = require("express-session");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var expressValidator = require("express-validator");

app.use(expressValidator());

// from express session github

app.use(session({
  secret: 'jklsjflsfds',
  resave: false,
  saveUninitialized: false,
  //cookie: { secure: true }
}));

// passport github
// initialize and integrate with express session
app.use(passport.initialize());
app.use(passport.session());

// -------------------------------------------------
mongoose.Promise = global.Promise;
// MongoDB Configuration configuration (Change this URL to your own DB)
mongoose.connect("mongodb://localhost/randomActs");
var db = mongoose.connection;

db.on("error", function(err) {
  console.log("Mongoose Error: ", err);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// called from authenticate in post /login
// username and password names cannot be changed and come from form
passport.use(new LocalStrategy(
  function(username, password, done) {
    
    console.log("username = " + username);
    console.log("password = " + password);

    User.find({'username':username, 'password':password}, function(err, doc) {  
    if (err) {
      console.log(err);
    } else {
      // if user is found
      if (doc.length !== 0) {
        console.log(doc[0]);
        // get user id and add it to the session
        const userId = doc[0]._id;
        console.log("user id = " + userId);

        // run login function from passport to log user id in session
        
        //req.login(userId, function(err) {
          
          return done(null, userId);
        //});
        
      } else {
        // user not found
        console.log("Username or password invalid");
        return done(null, false);
      }
    }
      
  });
}));

// post login route
app.post("/login", passport.authenticate("local", {
  successRedirect: "/loggedin",
  failureRedirect: "/login"
}));

// app.get("/", function(req,res) {
//   res.sendFile(__dirname + "/public/index.html");
// });

app.get("/loggedin", function(req,res) {
  res.sendFile(__dirname + "/public/index_loggedin.html");
});

// main page with stories
app.get("/stories", function(req, res) {

  // if (req.isAuthenticated()) {
  //   res.sendFile(__dirname + "/public/index_loggedin.html");
  // } else {
  //   res.sendFile(__dirname + "/public/index.html");
  // }
  console.log("app.get /stories");

  // We will find all the records, sort it in descending order, then limit the records to 5
    Story.find({}).sort([
    ["date", "descending"]
    ]).limit(10).exec(function(err, doc) {
    if (err) {
      console.log(err);
    }
    else {
      console.log(doc);
      res.send(doc);
    }
  });
});



app.get("/login", function(req, res) {
  res.sendFile(__dirname + "/public/login.html");
});

app.get("/logout", function(req, res) {
  req.logout();
  req.session.destroy();
  res.sendFile(__dirname + "/public/index.html");
});

//serve sign up html when the signup route is hit
app.use("/signup", function(req, res) {
  res.sendFile(__dirname + "/public/signup.html");
});

//serve newstory html when the newstory route is hit -- this route is somehow not working
app.use("/newstory", function(req, res) {

  if (req.isAuthenticated()) {
    res.sendFile(__dirname + "/public/newstory_loggedin.html");
  } else {
    res.sendFile(__dirname + "/public/newstory.html");
  }
  
});

//serve newstory html when the newstory route is hit
app.use("/", function(req, res) {

  if (req.isAuthenticated()) {
    res.sendFile(__dirname + "/public/index_loggedin.html");
  } else {
    res.sendFile(__dirname + "/public/index.html");
  }
  
});

// //about us routes - why not working
// app.use("/about", function(req, res) {

//   if (req.isAuthenticated()) {
//     res.sendFile(__dirname + "/public/aboutus_loggedin.html");
//   } else {
//     res.sendFile(__dirname + "/public/aboutus.html");
//   }
  
// });

//redirect to index.html when a nonexisting route is hit
// app.use("*", function(req, res) {
//   res.sendFile(__dirname + "/public/index.html");
// });

// signup page
app.post("/users", function(req, res) {

  // Check if username and password already exist

  User.find({'username':req.body.username, 'password':req.body.password}, function(err, doc) {  
    if (err) {
      console.log(err);
    } else {
      // if user is found
      if (doc.length !== 0) {
        console.log(doc[0]);
        console.log("This username and password are taken");
        res.redirect("/signup");
      } else {
      // user does not exist in db
      // Here we'll save the location based on the JSON input.
      // We'll use Date.now() to always get the current date time
      var user = new User({
        username: req.body.username,
        password: req.body.password,
        picUrl: req.body.picUrl,
        email: req.body.email,
        date: Date.now()
      });

      console.log("BODY: " + req.body);

      user.save(function(err, doc) {
        if(err) { 
            console.log(err);
        } else {
          //res.send(doc);
        
          const userId = doc._id;
          console.log("user id = " + userId);
          
          req.login(userId, function(err) {
              res.redirect("/loggedin");
          });
        }
      });  // user.save
    }  // if user not found
  }
  });  // user.find
});

// write user id (serialize) to the session
passport.serializeUser(function(userId, done) {
    done(null, userId);
});

// read user id from the session
passport.deserializeUser(function(userId, done) {
  //User.findById(userId, function (err, user) {
    done(null, userId);
  //});
});


app.post("/stories", function(req, res) {

  // get user id stored in the sesion
  console.log(req.user);
  console.log(req.isAuthenticated());

  if (req.isAuthenticated()) {
    // Here we'll save the location based on the JSON input.
    // We'll use Date.now() to always get the current date time
    var story = new Story({
      postedBy: req.user,
      title: req.body.title,
      longVersion: req.body.longV,
      date: Date.now()
    })

    console.log("BODY: " + req.body);

    story.save(function(err, doc) {
        if(err) { 
          console.log(err);
        } else {
          res.redirect("/loggedin");
        }

    });
  } else {
    // user is not logged in
    console.log("Please log in");
  }
});

app.post("/updateHearts", function(req, res) {
  console.log(req.body);
  var id=req.body.id;
  //var hearts=parseInt(req.body.hearts);

  console.log("here " + id + " " + hearts);
  Story.findOneAndUpdate({
    _id: id
  }, {
    $set: {
      hearts: parseInt(hearts)+1
    }
  }, { upsert: true }).exec(function(err) {

    if (err) {
      console.log(err);
    }
    else {
      res.send("Updated Hearts!");
    }
  });


});

// -------------------------------------------------

// Listener
app.listen(PORT, function() {
  console.log("App listening on PORT: " + PORT);
});
