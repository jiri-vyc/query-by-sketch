var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var PicturesModel = require('./../models/PicturesModel');


var uploadpath = path.join(__dirname, '/../public/uploads/');
var sift_uploadpath = path.join(__dirname, '/../public/uploads/sift/');
var sift_bin_path = path.join(__dirname, '/../bin/sift.exe');


/* GET pictures/list. */
router.get('/list', function(req, res, next) {
	PicturesModel.getPicturesList(req.db, function(err, docs){
		res.render('pictures_list', {list: docs}, function(err, html){
			res.send(html);
		})
	});
});

router.get('/:filename', function(req, res, next){
    var filename = req.params.filename;
	var uploadUrl = req.protocol + '://' + req.get('host') + '/upload/base64/';
    PicturesModel.getPicturesList(req.db, function(err, docs){
        res.render('index', { title: 'Sketch an image & find similar', uploadCallbackUrl: uploadUrl, list: docs, image: filename});
    });
});

module.exports = router;
