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
});
const uploadFile = multer({storage:storage});

const authMiddleware = require('../middlewares/authMiddleware');
const loggerProducts = require('../middlewares/products_log');


router.get('/', mainController.index);
router.get('/detalleproducto/:id', mainController.detalleProducto);
router.get('/buscar', mainController.buscar);
router.get('/productos', mainController.productos);
router.get('/carrito',authMiddleware, mainController.showCarrito);
router.get('/productonuevo', authMiddleware, mainController.productoNuevo);
router.get('/opciones', authMiddleware, mainController.opciones);
router.get('/editarproducto/:id', authMiddleware, mainController.editarProducto);
router.delete('/productos/:id', authMiddleware, mainController.eliminarProducto);
router.get('/accesDenied', mainController.accesDenied);
router.get('/error', mainController.error);


router.post('/carrito/:id',authMiddleware, uploadFile.single('image'), mainController.carrito);
router.post('/productonuevo',authMiddleware, loggerProducts, uploadFile.single('image'), mainController.crearproductoNuevo);

router.put('/editarproducto/:id', authMiddleware, uploadFile.single('image'), mainController.modificarProducto);

router.get('*', mainController.notFound);



module.exports = router;
