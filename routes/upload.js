var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var jimp = require('jimp');
var gm = require('gm');
var exec = require('child_process').exec;
var path = require('path');


var uploadpath = path.join(__dirname, '/../public/uploads/');
var sift_uploadpath = path.join(__dirname, '/../public/uploads/sift/');
var sift_bin_path = path.join(__dirname, '/../bin/sift.exe');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadpath)
  },
  filename: function (req, file, cb) {
    cb(null,  Date.now() + file.originalname)
  }
})

var uploading = multer({
	storage: storage,
	limits: {fileSize: 50000, files: 1},
});
var type = uploading.single('image');

function saveToDb(db, filename){
	var collection = db.get('imagecollection');
	collection.insert({
		"filename": filename,
	});
}

function createThumbnail(filename, next){
	jimp.read(uploadpath + filename, function (err, data) {
    if (err) {
    	throw err
    } else {
	    data.resize(256, jimp.AUTO)            // resize 
	         .write(uploadpath + "thumbnail_" + filename); // save 
	         next();
	     }
	});
}

/* Convers file to greyscale PGM format and performs SIFT on it. Saves SIFT descriptor into separate .sift file */
function createSiftFile(filename, next){
	gm(uploadpath + filename).write(path.join(sift_uploadpath, filename) + '.pgm', function(err){
        if (err){
            console.log(err);
        } else {
            console.log('Finished saving as PGM without error.'); 
            exec(sift_bin_path + ' ' + path.join(sift_uploadpath, filename) + '.pgm  --descriptors=' + sift_uploadpath + filename + '.sift', function(err){
			  if (err) {
			    console.error(err);
			  } else {
			  	console.log('Finished generating SIFT descriptors without error.');
			  	next();
			  }
			});
        }
    });
}


/* GET /upload page. */
router.get('/', function(req, res, next) {
  res.render('upload', { title: 'Upload' });
});


/* POST on /upload, saves uploaded picture (via form) */
router.post('/', type, function(req, res, next){
	var imageName = req.file;
	if (!imageName){
		console.log('Error, no file.');
		res.redirect('/');
	} else {
			saveToDb(req.db, imageName.filename);
			createSiftFile(imageName.filename, function(){
				createThumbnail(imageName.filename, function(){
					res.redirect('/pictures/' + imageName.filename);
				});
			});
	}
})


/* POST /upload/base64, saves sketched picture, sends ajax response where to get updated pictures list */
router.post('/base64', function(req, res, next){
	var matches = req.body.base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

	if (matches.length !== 3 || matches[1] != "image/png"){
		console.log('Error, bad data');
		res.send('not ok');
	} else {
		buffer = new Buffer(matches[2], 'base64');
		var filename = 'sketched_' + Date.now() + 'image.png';
		fs.writeFile(uploadpath + '/' + filename, buffer, function(err){
			if (err){
				console.log(err);
				res.send('not ok');
			} else {	
				saveToDb(req.db, filename);
				createSiftFile(filename, function(){
					createThumbnail(filename, function(){
						res.send(req.protocol + '://' + req.get('host') + '/pictures/list');
					});
				});
			}
		});
	}

});



module.exports = router;
