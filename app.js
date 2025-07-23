/*
 * Package Imports
 */

const path = require("path");
const express = require("express");
const partials = require("express-partials");
const session = require("express-session");
const passport = require("passport");
const { ClientRequest } = require("http");
const { profile } = require("console");
const GitHubStrategy = require("passport-github2").Strategy;

const app = express();

/*
 * Variable Declarations
 */

const PORT = 3000;
const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
const CALLBACK_URL = process.env.OAUTH_CALLBACK_URL;

console.log("Client ID:", CLIENT_ID);
console.log("Client Secret:", CLIENT_SECRET);
console.log("Callback URL:", CALLBACK_URL);

/*
 * Passport Configurations
 */
passport.use(
  new GitHubStrategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, done) {
      return done(null, profile);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
/*
 *  Express Project Setup
 */

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(partials());
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(
  session({
    secret: "codecademy",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
/*
 * Routes
 */

app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

/*
 * ensureAuthenticated Callback Function
 */
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

app.get("/account", ensureAuthenticated, (req, res) => {
  res.render("account", { user: req.user });
});

app.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.get("/auth/github", passport.authenticate("github", { scope: ["user"] }));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    successRedirect: "/",
  })
);
/*
 * Listener
 */

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
