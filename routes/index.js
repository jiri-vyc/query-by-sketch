var express = require('express');
var PicturesModel = require('./../models/picturesModel');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	var uploadUrl = req.protocol + '://' + req.get('host') + req.originalUrl + 'upload/base64/';
    PicturesModel.getPicturesList(req.db, function(err, docs){
        res.render('index', { title: 'Sketch an image & find similar', uploadCallbackUrl: uploadUrl, list: docs});
    });

});

router.get('/test', function(req, res, next) {
    res.render('index', { title: 'TESTing' });
});

/* GET about page */
router.get('/about', function(req, res, next) {
    res.render('about', { title: 'About' });
});

module.exports = router;
