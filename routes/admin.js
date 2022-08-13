const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

require("../models/Categoria")
const Categoria = mongoose.model("categorias")

require("../models/user")
const User = mongoose.model("users")

require("../models/Posts")
const Post = mongoose.model("posts")

const {eAdmin} = require("../helpers/eAdmin")


router.get('/', eAdmin, (req, res) => {
    res.render('admin/index')
});

router.get("/users", eAdmin, (req, res) => {
    User.find().lean().then((users) => {
        res.render("admin/users", {users: users})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao listar usuarios")
        res.render("/")
    })
})

router.post("/users/deletar", eAdmin, (req, res) => {
    User.remove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Usuario deletado com sucesso!")
        res.redirect("/admin/users")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar")
        res.redirect("/admin/users")
    })
})

router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().lean().sort({date:'desc'}).then((categorias) => {
        res.render('admin/categorias', {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar categorias")
        res.redirect("/admin")
    })
});

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render('admin/addcategorias')
});

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
        res.render("admin/editcategorias", {categoria: categoria})
    }).catch((err) => {
        req.flash("error_msg", "Esta categoria não existe")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/edit", eAdmin, (req, res) => {
    Categoria.findOne({_id: req.body.id}).then((categoria) => {

        categoria.nome = req.body.nome;
        categoria.slug = req.body.slug;

        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editada com sucesso")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao salvar edição")
            res.redirect("/admin/categorias")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a categoria")
        res.redirect("/admin/categorias")
    });
});


router.post("/categorias/deletar", eAdmin, (req, res) => {
    Categoria.remove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar")
        res.redirect("/admin/categorias")
    })
})

router.post('/categorias/nova', eAdmin, (req, res) => {

    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome invalido"})
    };

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug invalido"})
    };

    if(req.body.nome.length < 3){
        erros.push({texto: "Nome pequeno"})
    };

    if(req.body.slug.length < 3){
        erros.push({texto: "Slug pequeno"})
    };

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso.")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao salvar categoria.")
            res.redirect('/admin')
        })
    }

});

router.get("/posts", eAdmin, (req, res) => {
    Post.find().lean().populate("categoria").sort({data:"desc"}).then((posts) => {
        res.render("admin/posts", {posts: posts})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        res.redirect("/admin")
    })
    
})

router.get("/posts/add", eAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addposts", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulario!")
        res.redirect("/admin")
    })
})

router.post("/posts/new", eAdmin, (req, res) => {

    var erros = []

    if(req.body.categoria == "0"){
        erros.push({texto: "Registre uma categoria"})
    }
    if(erros.length > 0){
        res.render("admin/addposts", {erros: erros})
    }else{
        const newPost = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descrição: req.body.descrição,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Post(newPost).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso")
            res.redirect("/admin/posts")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao criar postagem!")
            res.redirect("/admin/posts")
        })
    }

})

router.get("/posts/edit/:id", eAdmin, (req, res) => {
    Post.findOne({_id: req.params.id}).lean().then((post) => {

        Categoria.find().lean().then((categoria) => {
            res.render("admin/editposts", {categoria: categoria, post: post})
        }).catch((err) => {
            req.flash("error_msg", "Erro ao listar categorias")
            res.redirect("/admin/posts")
        })
    }).catch((err) => {
        req.flash("error_msg", "Esta postagem não existe")
        res.redirect("/admin/posts")
    })
})

router.post("/post/edit", eAdmin, (req, res) => {
    Post.findOne({_id: req.body.id}).then((post) => {

        post.titulo = req.body.titulo
        post.slug = req.body.slug
        post.descrição = req.body.descrição
        post.conteudo = req.body.conteudo
        post.categoria = req.body.categoria

        post.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso")
            res.redirect("/admin/posts")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao salvar edição")
            res.redirect("/admin/posts")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a postagem")
        res.redirect("/admin/posts")
    });
});

router.post("/posts/deletar", eAdmin, (req, res) => {
    Post.remove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/admin/posts")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar")
        res.redirect("/admin/posts")
    })
})

module.exports = router