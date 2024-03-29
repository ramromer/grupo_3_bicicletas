let express = require('express');
let router = express.Router();
let usersController = require('../controllers/usersControllers.js');
let multer = require('multer');
let path = require('path');
const db = require('../data/models');

const storage = multer.diskStorage({
    destination:  function(req, file, cb) {
        cb(null,'./public/users/avatars');
    },
    filename: function (req,file,cb){
        cb(null,`${Date.now()}_img_${path.extname(file.originalname)}`);
    }
})
const uploadFile = multer({
  storage:storage,
  fileFilter: (req, file, cb) => {
      if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/gif") {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(new Error('Solamente los formatos .gif, .png, .jpg and .jpeg estan permitidos!'));
      }
    }    
});
const {body} = require('express-validator');
const validateUserLogin = [
  body('email').notEmpty().withMessage('Por favor ingresa el email con el que te registraste'),
  body('email').isEmail().withMessage('Por favor ingresa un email valido'),
]

const validateUserRegister = [
    body('fullName').notEmpty().withMessage('Por favor ingresa tu nombre completo'),
    body('fullName').isLength({min:2}).withMessage('Tu nombre debe al menos tener 2 caracteres'),
    body('fullAddress').notEmpty().withMessage('Por favor ingresa tu direccion'),
    body('email').isEmail().withMessage('Por favor ingresa un email valido'),
    body('email').custom((value, {req}) => {
        return new Promise((resolve, reject) => {
          db.User.findOne({where:{email:req.body.email}}).then(function( user){
            
            if(Boolean(user)) {
              reject(new Error('El correo ya estgá siendo usado por otro usuario'))
            }
            resolve(true)
          }).catch(err => {console.log(err); reject(new Error('Error en el servidor'))});
        });
      }), 
    body('emailRep').isEmail().withMessage('Por favor repite tu email'),
    body('emailRep').custom((value, {req})=>{
      if (value !== req.body.email){
        throw new Error('Los email no coinciden');
      }
      return true;
    }),
    body('bday').notEmpty().withMessage('Por favor ingrese su fecha de nacimiento'),
    body('user').notEmpty().withMessage('Por favor ingrese un nombre de usuario'),
    body('user').custom((value, {req}) => {
      return new Promise((resolve, reject) => {
        db.User.findOne({where:{user:req.body.user}}).then(function( user){
          
          if(Boolean(user)) {
            reject(new Error('El usuario ya estgá siendo usado por otra persona'))
          }
          resolve(true)
        }).catch(err => {console.log(err); reject(new Error('Error en el servidor'))});
      });
    }), 
    body('key').notEmpty().withMessage('Por favor ingrese una contraseña'),
    body('key').isLength({min:8}).withMessage('Tu contraseña debe al menos tener 8 caracteres'),
    body('keyAgain').notEmpty().withMessage('Por favor repita la contraseña elegida'),
    body('keyAgain').custom((value, {req})=>{
      if (value !== req.body.key){
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
    body('user').custom((value, {req}) => {
        return new Promise((resolve, reject) => {
          db.User.findOne({where:{user:req.body.user}}).then(function( user){
            
            if(Boolean(user)) {
              reject(new Error('El usuario ya está siendo usado'))
            }
            resolve(true)
          }).catch(err => {console.log(err); reject(new Error('Error en el servidor'))});
        });
      })   
];
const validateUserUpdate = [
  body('fullName').notEmpty().withMessage('Por favor ingresa tu nombre completo'),
  body('fullName').isLength({min:5}).withMessage('Tu nombre debe al menos tener 5 caracteres'),
  body('fullAddress').notEmpty().withMessage('Por favor ingresa tu direccion'),
  body('fullAddress').isLength({min:5}).withMessage('Tu dirección debe al menos tener 5 caracteres'),
  body('bday').notEmpty().withMessage('Por favor ingrese su fecha de nacimiento'),
  body('user').notEmpty().withMessage('Por favor ingrese un nombre de usuario'),
  body('user').isLength({min:5}).withMessage('Tu usuario debe al menos tener 5 caracteres'),
  // body('key').isLength({min:8}).withMessage('Tu contraseña debe al menos tener 8 caracteres'),
  body('key').custom((value, {req})=>{
    if (value.length>0){
      if(value.length < 8){

        throw new Error('Tu contraseña debe al menos tener 8 caracteres');
      }
    }
    return true;
  }),
  body('keyAgain').custom((value, {req})=>{
    if (value !== req.body.key){
      throw new Error('Las contraseñas no coinciden');
    }
    return true;
  }),

];

const guestMiddleware = require('../middlewares/guestMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

/* POST user */
router.post('/login', validateUserLogin, usersController.loginProcess);
router.post('/register', uploadFile.single('image'), validateUserRegister, usersController.registerWrite); //crear usuario

/* PUT user */
router.put('/update/:id',authMiddleware, uploadFile.single('image'), validateUserUpdate, usersController.update);

/* DELETE user */
router.delete('/delete/:id', authMiddleware, usersController.eliminarUsuario);//eliminar usuario

/* GET users listing. */
router.get('/login',guestMiddleware, usersController.login);
router.get('/register/:email', usersController.askRegister);
router.get('/register',guestMiddleware, usersController.register);//crear usuario
router.get('/edit/:id',authMiddleware, usersController.edit);//Editar usuario
router.get('/profile',authMiddleware,usersController.profile);
router.get('/image/:file',usersController.image);
router.get('/logout', usersController.logout);
router.get('*', usersController.notFound);


module.exports = router;