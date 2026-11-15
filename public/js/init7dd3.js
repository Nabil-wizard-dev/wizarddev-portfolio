/*
 * Copyright (c) 2021 Frenify
 * Author: Frenify
 * This file is made for CURRENT TEMPLATE
*/


(function($){
  "use strict";

	// EmailJS settings (emailjs.com > Email Services / Email Templates / Account > General)
	var EMAILJS_CONFIG = {
		publicKey: 	'E9sKoh_ocwzUX6WKb',
		serviceId: 	'service_ity4ldk',
		templateId: 'i5beb32'
	};

	var FrenifyDeebo = {

		init: function(){
			if(typeof emailjs !== 'undefined' && EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY'){
				emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
			}
			FrenifyDeebo.BgImg();
			FrenifyDeebo.imgToSVG();
			FrenifyDeebo.resume();
			FrenifyDeebo.modal();
			FrenifyDeebo.contactForm();
			FrenifyDeebo.anchor();
			FrenifyDeebo.darklight();
		},

		
		darklight: function(){
			var body 		= $('body');
			var checkbox 	= $('.deebo_fn_switcher_wrap input');

			body.removeClass('dark').addClass('light');
			checkbox.prop('checked', false);

			checkbox.off('change').on('change',function(){
				var checkBox = $(this);
				if(checkBox.is(':checked')){
					body.removeClass('light').addClass('dark');
				}else{
					body.removeClass('dark').addClass('light');
				}
				return false;
			});
		},
		
		anchor: function(){

			$('.anchor').on('click',function(){
				var selector = '.cv__content';
				if($(window).width() <= 1040){
					selector = 'body,html';
				}
				if($.attr(this, 'href') !== '#'){
					$(selector).animate({
						scrollTop: $($.attr(this, 'href')).offset().top
					}, 800);
				}

				return false;
			});	
		},
		
		contactForm: function(){
			$('#send_message').off('click').on('click', function(){
				var form		= $('.section_contact .contact_form');
				var name 		= $("#name").val();
				var email 		= $("#email").val();
				var message 	= $("#message").val();
				var phone 		= $("#phone").val();
				var spanSuccess	= form.find(".success");
				var success     = spanSuccess.data('success');
				var emailto     = form.data('email');

				spanSuccess.empty();
				if(name === '' || email === '' || message === ''){
					$('.empty_notice').slideDown(500).delay(2000).slideUp(500);
				}
				else if(typeof emailjs === 'undefined'){
					spanSuccess.append("<span class='contact_error'>Une erreur est survenue, veuillez réessayer plus tard.</span>");
					spanSuccess.slideDown(500).delay(4000).slideUp(500);
				}
				else{
					var button = $(this);
					if(button.data('sending')){ return false; }
					button.data('sending', true).css({'pointer-events': 'none', 'opacity': 0.6});
					emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
						title: 			name,
						name: 			name,
						email: 			email,
						phone: 			phone,
						form_name: 		name,
						form_message: 	message,
						time: 			new Date().toLocaleString(),
						to_email: 		emailto
					}, { publicKey: EMAILJS_CONFIG.publicKey }).then(function(){
						spanSuccess.append("<span class='contact_success'>" + success + "</span>");
						spanSuccess.slideDown(500).delay(4000).slideUp(500);
						form[0].reset();
					}, function(){
						spanSuccess.append("<span class='contact_error'>Une erreur est survenue, veuillez réessayer plus tard.</span>");
						spanSuccess.slideDown(500).delay(4000).slideUp(500);
					}).finally(function(){
						button.data('sending', false).css({'pointer-events': '', 'opacity': ''});
					});
				}
				return false;
			});
		},
		
		modal: function(){
			var self		= this;
			var modalBox	= $('.deebo_fn_modalbox');
			var item		= $('.modal_item');
			var closePopup	= modalBox.find('.closer,.extra_closer');
			var prevNext	= modalBox.find('.fn__nav');
			var extraCloser = modalBox.find('.extra_closer');
			extraCloser.on('mouseenter',function(){
				modalBox.addClass('hovered');
			}).on('mouseleave',function(){
				modalBox.removeClass('hovered');
			});
			item.on('click',function(){
				var element		= $(this);
				var content 	= element.find('.fn__hidden').html();
				
				
				var items		= element.closest('.modal_items'),
					index		= element.attr('data-index'),
					from		= items.attr('data-from');
				prevNext.attr('data-index',index);
				prevNext.attr('data-from',from);
				
				
				$('body').addClass('modal');
				modalBox.addClass('opened');
				modalBox.find('.modal_in').html(content);
				
				self.modal_prevnext(prevNext,modalBox);
				self.imgToSVG();
				self.BgImg();
				
				return false;
			});
			self.modal_prevnext(prevNext,modalBox);
			closePopup.on('click',function(){
				modalBox.removeClass('opened hovered');
				modalBox.find('.modal_in').html('');
				$('body').removeClass('modal');
				return false;
			});
		},
		
		modal_prevnext: function(prevNext,modalBox){
			var self		= this;
			prevNext.find('a').off().on('click',function(){
				var e		= $(this);
				var from 	= prevNext.attr('data-from');
				var index	= parseInt(prevNext.attr('data-index'));
				var itemss	= $('.modal_items[data-from="'+from+'"]');
				var count	= parseInt(itemss.attr('data-count'));
				if(e.hasClass('prev')){
					index--;
				}else{
					index++;
				}
				if(index < 1){index = count;}
				if(index > count){index = 1;}
				
				var content = itemss.find('.modal_item[data-index="'+index+'"] .fn__hidden').html();
				prevNext.removeClass('disabled');
				prevNext.attr('data-index',index);
				
				setTimeout(function(){
					modalBox.find('.modal_in').fadeOut(500, function() {
						$(this).html('').html(content).fadeIn(500);
					});
				},500);
					
				$(".deebo_fn_modalbox .modal_content").stop().animate({scrollTop:0}, 500, 'swing');
				
				self.modal_prevnext(prevNext,modalBox);
				self.imgToSVG();
				self.BgImg();
				return false;
			});
		},
		
		resume: function(){
			$('.deebo_fn__cv .cv__content').scrollTop(0);
			$('body').addClass('resume-opened');
		},
		
		imgToSVG: function(){
			$('img.fn__svg').each(function(){
				var img 		= $(this);
				var imgClass	= img.attr('class');
				var imgURL		= img.attr('src');

				$.get(imgURL, function(data) {
					var svg 	= $(data).find('svg');
					if(typeof imgClass !== 'undefined') {
						svg 	= svg.attr('class', imgClass+' replaced-svg');
					}
					img.replaceWith(svg);

				}, 'xml');

			});	
		},

	  	BgImg: function(){
			var div = $('*[data-bg-img]');
			div.each(function(){
				var element = $(this);
				var attrBg	= element.attr('data-bg-img');
				var dataBg	= element.data('bg-img');
				if(typeof(attrBg) !== 'undefined'){
					element.css({backgroundImage:'url('+dataBg+')'});
				}
			});
		},
    
  	};
  	
	
	// READY Functions
	// init() is called by Angular (AppComponent.ngAfterViewInit) once the template is rendered.
	

	window.FrenifyDeebo = FrenifyDeebo;

})(jQuery);