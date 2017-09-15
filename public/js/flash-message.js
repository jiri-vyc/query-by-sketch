function flashMessage(text, type){
	console.log(type);

	if (!type){
		type = 'success';
	}
	$('#flash-message').addClass(type);
	$("#flash-message").text(text);
	$("#flash-message").fadeIn(750).delay(1200).fadeOut(750); 
}

