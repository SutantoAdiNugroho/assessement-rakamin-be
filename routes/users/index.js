const router = require('express').Router();
const controller = require('./controller');
const middleware = require('../../middleware');

router.get('', middleware.authenticate, controller.getAllUsers);

module.exports = router;
