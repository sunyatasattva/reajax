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
	Remix.$('.r-accordianHeading').removeClass("r-active");
	Remix.$(this).closest('.r-accordian').children().children('.r-accordianHeading').find('.r-icon').addClass('icon-angle-right').removeClass('icon-angle-up');
	Remix.$(this).closest('.r-accordian').children().children('.r-accordianHeading').find('.r-iconContent').addClass('icon-angle-down').removeClass('icon-angle-up');
	if(Remix.$(this).parent().next().css('display') == 'none'){
		Remix.$(this).closest('.r-accordian').children().children('.r-accordianContent').hide();
		Remix.$(this).closest('.r-accordianHeading').addClass("r-active").next().show();
		Remix.$(this).children('.r-icon').addClass('icon-angle-up').removeClass('icon-angle-right');
		Remix.$(this).children('.r-iconContent').addClass('icon-angle-up').removeClass('icon-angle-down');
	}else{
		Remix.$(this).closest('.r-accordian').find('.r-accordianContent').hide();
		Remix.$(this).children('.r-icon').addClass('icon-angle-right').removeClass('icon-angle-up');
		Remix.$(this).children('.r-iconContent').addClass('icon-angle-down').removeClass('icon-angle-up');
	}
});

/*for popup*/
var touchFlag = false;
Remix.$(document).on('click', '.r-popupLink', function(e){
	e.preventDefault();
	var _target = Remix.$(this).attr('href');
	Remix.$(_target).removeClass("r-popupInactive").addClass("r-popupActive");
	Remix.$('.r-overlay, .r-extraDiv').removeClass('r-hidden');
});
Remix.$(document).on('click', '.r-user', function(e){
	e.preventDefault();
	Remix.$(".loginIframe, .r-overlay, .r-extraDiv").removeClass("r-hidden");
});
Remix.$(document).on('touchmove', '.r-overlay', function(){
	touchFlag = true;
});
Remix.$(document).on('click touchend', '.r-overlay', function(){
	if (!touchFlag) {
		Remix.$('.r-popupActive').addClass("r-popupInactive").removeClass("r-popupActive");
		Remix.$(".loginIframe").addClass("r-hidden");
		Remix.$(this).addClass('r-hidden');
		setTimeout(function(){
			Remix.$('.r-extraDiv').addClass('r-hidden');
		},500);
	};
});