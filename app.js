// Modules
    const express = require('express');
    const handlebars = require('express-handlebars');
    const bodyParse = require('body-parser');
    const mongoose = require('mongoose');

    const app = express();

    const routesAdmin = require('./routes/admin');
    const routesUser = require('./routes/user');

    const path = require('path');
    const session = require('express-session');
    const flash = require('connect-flash');
    require("./models/Posts");
    const Post = mongoose.model("posts");
    require("./models/Categoria");
    const Categoria = mongoose.model("categorias");

    const passport = require("passport");
    require("./config/auth")(passport);

// Middleware
    // Session
        app.use(session({
            secret: "cursonode",
            resave: true,
            saveUninitialized: true
        }));
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(flash());
    // Global variables
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg");
            res.locals.error_msg = req.flash("error_msg");
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null;
            next();
        })
    // Body Parse configuration
        app.use(bodyParse.urlencoded({extended: true}));
        app.use(bodyParse.json());
    // Handlebars
        app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}));
        app.set('view engine', 'handlebars');
    // Public
        app.use(express.static(path.join(__dirname,"public")));

// Mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect("mongodb://localhost/blogapp").then(() => {
    console.log("Conectado ao mongo")
    }).catch((err) => {
        console.log("Erro ao se conectar: " + err)
    });

// Routes

    // Home page
    app.get("/", (req, res) => {
        Post.find().lean().populate("categoria").sort({data: "desc"}).then((posts) => {
            res.render("index", {posts: posts})
        }).catch((err) => {
            req.flash("error_msg", "Erro ao carregar postagens")
            res.render("/404")
        })
    })

    // Ler mais
    app.get("/post/:slug", (req, res) => {
        Post.findOne({slug: req.params.slug}).lean().then((post) => {
            res.render("posts/index", {post: post})
        }).catch((err) => {
            req.flash("error_msg", "Erro ao carregar postagem")
            res.redirect("/")
        })
        
    })

    app.get("/categorias", (req, res) => {
        Categoria.find().lean().then((categorias) => {
            res.render("categorias/index", {categorias: categorias})
        }).catch((err) => {
            req.flash("error_msg", "Erro ao listar categorias")
            res.render("/")
        })
    })

    app.get("/categorias/:slug", (req, res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if(categoria){

                Post.find({categoria: categoria._id}).lean().then((posts) => {

                    res.render("categorias/posts", {posts: posts, categoria: categoria})

                }).catch((err) => {
                    req.flash("error_msg", "Erro ao listar as postagens!")
                    res.redirect("/")
                })

            }else{
                req.flash("error_msg", "Esta categoria não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Erro interno ao carregar pagina desta categoria")
            res.redirect("/")
        })
    })

    app.get("/404", (req,res) => {
        res.send("Errp 404!")
    })

    app.use('/admin', routesAdmin);
    app.use('/users', routesUser);
                                  

    
    app.listen(8081, () => {
        console.log("Servidor rodando na porta 8081")
    });