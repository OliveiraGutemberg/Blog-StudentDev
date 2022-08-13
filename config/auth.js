const LocalStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

// model de usuario
require("../models/user")
const User = mongoose.model("users")

module.exports = function(passport) {

    passport.use(new LocalStrategy({usernameField: 'email'}, (email, senha, done) => {
        User.findOne({email: email}).lean().then((user) => {
            if(!user){
                return done(null, false, {message: "Esta conta não existe"})
            }

            bcrypt.compare(senha, user.senha, (error, success) => {

            if(success){
                return done(null, user)
            }else{
                return done(null, false, {message: "Senha incorreta"})
            }
        })
    })
}))

    passport.serializeUser((user, done) => {
        done(null, user)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user)
        })
    })
}