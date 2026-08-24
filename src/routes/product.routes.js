const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAll, getById, create, update, softDelete, hardDelete } = require('../controllers/product.controller');

router.use(auth);

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', softDelete);
router.delete('/:id/physical', hardDelete);

module.exports = router;
