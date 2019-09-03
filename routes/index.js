const express = require('express');
const router = express.Router();

router.get('/hello', function(req, res, next) {
  res.send('helllllo');
});

module.exports = router;
