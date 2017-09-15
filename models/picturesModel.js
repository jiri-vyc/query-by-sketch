PicturesModel = {
	getPicturesList: function(db, next){
		var collection = db.get('imagecollection');
		collection.find({},{sort: {_id: -1}, limit: 9},function(err,docs){
			if (err){
				console.log(err);
			} else {
				next(err, docs);
			}
		});
	},
}

module.exports = PicturesModel;
