const express = require('express');
const router = express.Router();
const { notifyBooking, notifyAccepted, notifyCompleted, notifyLogin } = require('../controllers/notificationController');


router.post('/booking', notifyBooking);
router.post('/accepted', notifyAccepted);
router.post('/completed', notifyCompleted);
router.post('/login', notifyLogin);

module.exports = router;
