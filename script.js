/*for panel*/
Remix.$(document).on('click', 'header .r-menu', function(e){
	e.preventDefault();
	if(Remix.$('#r-menuPanel').css('left') == '-260px'){
		Remix.$('#r-menuPanel').css('left','0px');
		Remix.$('#r-menuPanel').prev('form').css('left','260px');
	}else{
		Remix.$('#r-menuPanel').css('left','-260px');
		Remix.$('#r-menuPanel').prev('form').css('left','0px');
	}
});

/*for accordian*/
Remix.$(document).on('click', '.r-collapsHeading', function(e){
	e.preventDefault();
	Remix.$(this).closest('.r-accordian').children().children('.r-accordianHeading').find('.r-icon').addClass('icon-angle-right').removeClass('icon-angle-up');
	if(Remix.$(this).parent().next().css('display') == 'none'){
		Remix.$(this).closest('.r-accordian').children().children('.r-accordianContent').hide();
		Remix.$(this).closest('.r-accordianHeading').next().show();
		Remix.$(this).children('.r-icon').addClass('icon-angle-up').removeClass('icon-angle-right');
	}else{
		Remix.$(this).closest('.r-accordian').find('.r-accordianContent').hide();
		Remix.$(this).children('.r-icon').addClass('icon-angle-right').removeClass('icon-angle-up');
	}
});

/*for popup*/
Remix.$(document).on('click', '.r-popupLink', function(e){
	e.preventDefault();
	var _target = Remix.$(this).attr('href');
	Remix.$(_target).removeClass("r-popupInactive").addClass("r-popupActive");
	Remix.$('.r-overlay').show();
});
Remix.$(document).on('click', '.r-overlay', function(e){
	e.preventDefault();
	Remix.$('.r-popupActive').addClass("r-popupInactive").removeClass("r-popupActive");
	Remix.$(this).hide();
});