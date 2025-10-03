// --- IMPORTS ---
require('dotenv').config(); 
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// --- ‼️ DEBUGGING .env VALUES ‼️ ---
console.log("--- SERVER STARTING ---");
console.log("CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "Loaded successfully" : "NOT LOADED OR MISSING!");
console.log("-----------------------");


// --- INITIALIZE APP ---
const app = express();
const PORT = 3000;

// --- SESSION CONFIGURATION ---
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

// --- PASSPORT INITIALIZATION ---
app.use(passport.initialize());
app.use(passport.session());

// --- PASSPORT GOOGLE STRATEGY ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    console.log('SUCCESS: User profile obtained from Google.');
    return done(null, profile);
  }
));

// --- PASSPORT SERIALIZE & DESERIALIZE ---
passport.serializeUser((user, done) => { done(null, user); });
passport.deserializeUser((user, done) => { done(null, user); });

// --- MIDDLEWARE TO CHECK IF USER IS LOGGED IN ---
function isLoggedIn(req, res, next) {
  if (req.user) { next(); } else { res.redirect('/'); }
}

// --- ROUTES ---
app.get('/', (req, res) => {
  res.send('<h1>Login Page</h1><a href="/auth/google">Authenticate with Google</a>');
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    console.log('SUCCESS: Login complete, redirecting to profile...');
    res.redirect('/profile');
  }
);

app.get('/profile', isLoggedIn, (req, res) => {
  res.send(`<h1>Profile Page</h1><p>Hello, ${req.user.displayName}!</p><a href="/logout">Logout</a>`);
});

app.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});