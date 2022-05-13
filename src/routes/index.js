let express = require('express');
let router = express.Router();
let mainController = require('../controllers/mainController.js');
let multer = require('multer');
let path = require('path');




const storage = multer.diskStorage({
    destination:  function(req, file, cb) {
        cb(null,'./public/images');
    },
    filename: function (req,file,cb){
        cb(null,`${Date.now()}_img_${path.extname(file.originalname)}`);
    }
})
const uploadFile=multer({storage:storage});

//`` te odio comillas raras

/* GET home page. */
router.get('/', mainController.index);
router.get('/carrito', mainController.carrito);
router.get('/detalleproducto/:id', mainController.detalleProducto);
router.get('/productonuevo', mainController.productoNuevo);
router.get('/editarproducto/:id', mainController.editarProducto);
router.get('error', mainController.error);

router.post('/productonuevo', uploadFile.single('image'), mainController.crearproductoNuevo);

// agregar nuevo elemento al array (push) y luego hacer JSON.stringify()
// fileWrite. res.redirect....


module.exports = router;


// function guardarFotoProducto () {
//     let archivo = req.body.image;

// };