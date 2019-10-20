const bcrypt = require('bcrypt');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const dbHandler = require('../lib/dbHandler');
// const User = require('../models/User');

passport.use(new localStrategy({ usernameField: 'email',}, async (email, password, done) => {
    // const user = await User.findOne({email:email});
    const user = await dbHandler.isRecord('users', {email}, true);
    console.log('user Passport >', user);
    if(!user){
        return done(null, false, {message: 'User not found!'});
    } else {
        // const match = await user.matchPassword(password);
        console.log('user.password', user.password);
        console.log('password', password);
        const match = bcrypt.compareSync(password, user.password);
        console.log('match', match);
        if(match){
            done(null, user);
        } else {
            return done(null, false, {message:'Wrong password'});
        }
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser( async(id, done) => {
  try {
    const user = await dbHandler.isRecord('users', {id}, true);
    console.log('user from success', user);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
    // User.findById(id, (err, user) => {
    //     done(err, user);
    // });
})
