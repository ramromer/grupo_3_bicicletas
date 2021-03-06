const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator");
const db = require('../data/models');

let usersController = {
  eliminarUsuario: async (req, res) => {
    console.log('llego');
    db.User.destroy({ where: { idUser: req.params.id } }).catch(
      (err) => {
        console.log(err);
      }
    );
    res.redirect('/');

  },
  login: (req, res) => {
    return res.render("./users/login.ejs");
  },
  edit: function (req, res) {
    db.User.findByPk(req.params.id)
      .then(function (Us) {
        if (Us!=undefined){
          res.render("./users/userEdit.ejs", { Us: Us });
        }else{
          res.redirect('./users/register.ejs')
        }
      })
  },
  update: function (req, res) {
    let picture;
    let key = bcryptjs.hashSync(req.body.key, 10);
    if (req.file) {
      picture = req.file.filename;
    } else {
      picture = "porDefecto.jpg";
    }
    db.User.update({
      fullname: req.body.fullName,
      addres: req.body.fullAddress,
      email: req.body.email,
      birthday: req.body.bday,
      user: req.body.user,
      key: key,
      userImage: picture,
    }, {
      where: {

        idUser: req.params.id
      }
    })
      .then(
        res.redirect("/")
      );
  },

  loginProcess: (req, res) => {
    db.User.findOne({
      where: {
        user: req.body.user
      }
    }).then((user) => {
      
      if (user) {
        let isOkThePassword = bcryptjs.compareSync(req.body.key, user.key);
        if (isOkThePassword) {
          delete user.key;
          req.session.userLogged = user;
          console.log(req.session)
          if (req.body.recordarLogin) {
            res.cookie("user", req.body.user, { maxAge: 1000 * 60 * 60 }); // esto es seguro? podemos hashear la info o usar cookies seguras
          }
          return res.redirect("/users/profile");
        } else {
          return res.render("./users/login.ejs", {
            errors: {
              email: {
                msg: "Las credenciales son inválidas",
              }
            }
          });
        }
      };
      return res.render("./users/login.ejs", {
        errors: {
          email: {
            msg: "La combinación de usuario y contraseña son invalidos o inexistente",
          },
        },
      });
    }).catch(err => console.log(" error al consultar la base de datos", err));

  },

  profile: (req, res) => {
    db.User.findOne({
      where: {
        user: req.session.userLogged.dataValues.user
      }
    }).then((user) => {
      return res.render("./users/profile", { user: user.dataValues })
    }).catch(err => console.log("63 error al consultar la base de datos", err));


  },
  logout: (req, res) => {
    req.session.destroy();
    res.clearCookie("user");
    res.redirect("/");
  },
  register: (req, res) => {
    res.render("./users/register.ejs");
  },

  registerWrite: (req, res) => {
    let errores = validationResult(req);
 
    // db.User.findOne({ 
    //   where: {
    //     user: req.body.user
    //   }
    // }).then((user)=>{
    //   if(user){
    //     res.render("./users/register.ejs", {
    //       errores: errores.mapped(),
    //       oldData: req.body,
  
    //     });/////////////////enviar validaciones par aavisar
    //   }
    // }).catch(err=> console.log(err))

    if (errores.errors.length > 0) {
      res.render("./users/register.ejs", {
        errores: errores.mapped(),
        oldData: req.body,

      });
    } else {

      let picture;
      let key = bcryptjs.hashSync(req.body.key, 10);
      if (req.file) {
        picture = req.file.filename;
      } else {
        picture = "porDefecto.jpg";
      }
      let usuarioNuevo = {
        fullname: req.body.fullName,
        addres: req.body.fullAddress,
        email: req.body.email,
        birthday: req.body.bday,
        user: req.body.user,
        key: key,
        userImage: picture,
        idUserTypeFK: req.body.userType,
      };


      db.User.create(usuarioNuevo).then(() => {
        return res.redirect(`./login/`)
      }).catch(error => res.send(error))

    }
  },

  notFound: (req, res) => {
    res.render("notFound");
  },
}

module.exports = usersController;
