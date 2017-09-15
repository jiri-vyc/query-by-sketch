var express = require('express');
var router = express.Router();
var gm = require('gm');
var fs = require('fs');
var path = require('path');
var Sync = require('sync');
var picturesModel = require('./../models/picturesModel');
var threshold = 0.8;

var uploadpath = __dirname + '/../public/uploads/';

/* returns SIFT descriptors in string format */
function getSift(filename){
    return fs.readFileSync(path.join(uploadpath, '/sift/') + filename + '.sift', 'ascii');
}

/* euclidean distance of two vectors (arrays of values in each dimension) */
function getDistance(values_ref, values){
    sum = 0;
    for (var i = 0; i < values_ref.length; i++) {
        sum += Math.pow(values_ref[i] - values[i], 2);
    };
    return Math.sqrt(sum);
}

/*  calculates whether a vector has a match in set of other vectors (second file)
    if ratio between distances of Nearest Neighbour and Second Nearest Neigbour is bellow specified threshold, we have a match
 */
function isMatch(values_ref, vectors){
    var shortestDistance = Number.MAX_SAFE_INTEGER;
    var secondShortestDistance = Number.MAX_SAFE_INTEGER;

    for (var i = 0; i < vectors.length; i++){
        var values = vectors[i].split(" ");
        var distance = getDistance(values_ref, values); 
        if (distance < secondShortestDistance){
            if (distance < shortestDistance){
                shortestDistance = distance;
            } else {
                secondShortestDistance = distance;
            }
        }
    }

    if (secondShortestDistance == 0){
        return 1;
    }
    var ratio = shortestDistance / secondShortestDistance;
    return (ratio < threshold);
}

/* calculates all matches between vectors from a specified file against a second file */
function getSiftMatches(filename_ref, filename){
    var file_ref_sift = getSift(filename_ref);
    var file_sift = getSift(filename);

    var vectors_ref = file_ref_sift.split("\n");
    var vectors = file_sift.split("\n");
    var matches = 0;

    for (var i = 0; i < vectors_ref.length; i++){
        var values_ref = vectors_ref[i].split(" ");
        if (isMatch(values_ref, vectors)){
            matches += 1;
        }
    }

    return matches;
}

/*  returns a numeric evaluation of similarity of two specified files. Only requirement should be resultA-B>resultA-C => similarity(fileA, fileB) > similarity(fileA, fileC) 
*/
function calculateSimilarity(filename_ref, filename, next){
        result = 0;

        result = getSiftMatches(filename_ref, filename);
        next(null, result);
}

/* returns an array of all files and their similarities to the referenced image */
function calculateAllSimilarities(filename_ref, docs, next){
    similarities = [];
    for (var i = 0; i < docs.length; i++){
        Sync(function(){
            var result = calculateSimilarity.sync(null, filename_ref, docs[i].filename);
            return result;
        }, function(err, result){
            similarities.push({
                "filename" : docs[i].filename,
                "similarity" : result
            });
        });
    }

    next(null, similarities);
}

/* GET /sift/filename */
router.get('/:filename', function(req, res, next) {

    var db = req.db;
    var collection = db.get('imagecollection');
    var filename = req.params.filename;
    var time_start = Date.now();

    picturesModel.getPicturesList(req.db, function(e,docs){
        if (e){
            console.log(e);
        } else {
            Sync(function(){
                var results = calculateAllSimilarities.sync(null, filename, docs);
                return results;
            }, function(err, results){
                console.log('back to main');
                Sync(function(){
                    var sorted_results = results.sort(function(a, b){
                        return b.similarity - a.similarity;
                    });
                    return sorted_results;
                }, function(err, sorted_results){
                    console.log(sorted_results);
                    res.render('results', {image: filename, list: sorted_results});
                    console.log(Date.now() - time_start);
                })
            })
        }
    });

});


module.exports = router;
