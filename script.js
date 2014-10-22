Remix.$(document).on('click', 'header .r-menu', function(e){
	e.preventDefault();
	if(Remix.$('#r-menuPanel').css('left') == '-250px'){
		Remix.$('#r-menuPanel').css('left','0px');
		Remix.$('#r-menuPanel').prev('form').css('left','250px');
	}else{
		Remix.$('#r-menuPanel').css('left','-250px');
		Remix.$('#r-menuPanel').prev('form').css('left','0px');
	}
})