var express = require('express');
var router = express.Router();

/* GET users index. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


/* GET user list */
router.get('/list', function(req, res, next) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e,docs){
    	if (e){
    		console.log(e);
    	}
        res.render('users', {
            "userlist" : docs
        });
    });
});

/* GET New User page. */
router.get('/newuser', function(req, res) {
    res.render('newuser', { title: 'Add New User' });
});

router.post('/adduser', function(req, res){
    var db = req.db;
    var collection = db.get('usercollection');
    var username = req.body.username;
    var usermail = req.body.useremail;

    if (!username || !usermail){
    		console.log('username or usermail NULL');
    		res.send('There was an error with the submitted data. Seems username or useremail is missing.');
    } else {
	    collection.insert({
	    	"username" : username,
	    	"email" : usermail
	    }, function(err, docs){
	    	if (err){
	    		console.log(err);
	    		res.send('There was an error with the DB.');
	    	} else {
	    		res.redirect('list');
	    	}
	    });
	}

});

module.exports = router;
