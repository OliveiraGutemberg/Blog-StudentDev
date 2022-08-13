const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport");

require("../models/user");
const User = mongoose.model("users");

router.get("/registro", (req, res) => {
    res.render("users/registro")
})

router.post("/registro", (req, res) => {
    var erros = []

    if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
        erros.push({text: "Nome invalido"})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({text: "Email invalido"})
    }
    if(!req.body.password || typeof req.body.password == undefined || req.body.password == null){
        erros.push({text: "Senha invalida"})
    }
    if(req.body.password.length < 4){
        erros.push({text: "Insira mais que 4 caracteres"})
    }
    if(req.body.password2 !== req.body.password){
        erros.push({text: "Senhas não correspondem"})
    }
    
    if(erros.length > 0){
        res.render("users/registro", {erros: erros})
    }else{

        User.findOne({email: req.body.email}).lean().then((user) => {
            if(user){
                req.flash("error_msg", "Ja existe uma conta com este email registrado.")
                res.redirect("/users/registro")
            }else{

                const newUser = new User({
                    nome: req.body.name,
                    email: req.body.email,
                    senha: req.body.password
                })

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.senha, salt, (err, hash) => {
                        if(err){
                            req.flash("error_msg", "Houve um errro ao tentar salvar o usuario")
                            res.redirect("/users/registro")
                        }

                        newUser.senha = hash

                        newUser.save().then(() => {
                            req.flash("success_msg", "Usuario criado com sucesso")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao criar usuario")
                            res.redirect("/users/registro")
                        })

                    })
                })

            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })

    }
})

router.get("/login", (req, res) => {
    res.render("users/login")
})

router.post("/login", (req, res, next) => {

    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/users/login",
        failureFlash: true,
    })(req, res, next)
})

router.get("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err) }
        req.flash("success_msg", "Deslogado com sucesso")
        res.redirect('/')
      })
})


module.exports = router;