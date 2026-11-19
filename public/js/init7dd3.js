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
		// Le destinataire est fixé dans le template (champ « To Email »), pas ici.
		templateId: 'template_jqgrotv'
	};

	// Stockage pour l'anti-spam « limitRate » d'EmailJS. Passé explicitement :
	// sans lui, emailjs.init() efface le stockage par défaut et la limite est ignorée.
	// try/catch : localStorage peut être bloqué (navigation privée, cookies refusés).
	var emailjsStorage = {
		get: function(key){
			try { return Promise.resolve(window.localStorage.getItem(key)); }
			catch(e){ return Promise.resolve(null); }
		},
		set: function(key, value){
			try { window.localStorage.setItem(key, value); } catch(e){}
			return Promise.resolve();
		},
		remove: function(key){
			try { window.localStorage.removeItem(key); } catch(e){}
			return Promise.resolve();
		}
	};

	var FrenifyDeebo = {

		init: function(){
			if(typeof emailjs !== 'undefined'){
				emailjs.init({
					publicKey: 			EMAILJS_CONFIG.publicKey,
					blockHeadless: 		true, // refuse les navigateurs automatisés (robots)
					storageProvider: 	emailjsStorage,
					limitRate: 			{ id: 'contact_form', throttle: 10000 } // 1 envoi / 10 s
				});
			}
			FrenifyDeebo.BgImg();
			FrenifyDeebo.imgToSVG();
			FrenifyDeebo.resume();
			FrenifyDeebo.modal();
			FrenifyDeebo.contactForm();
			FrenifyDeebo.anchor();
		},

		
		// Thème clair/sombre et langue : gérés par Angular (AppComponent).

		anchor: function(){

			// Native smooth scrolling: compatible with the section-by-section scroll-snap
			// (a jQuery scrollTop animation would fight against the snapping).
			$('.anchor').off('click').on('click',function(){
				var target = document.querySelector($.attr(this, 'href'));
				if(target){
					target.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
				return false;
			});
		},
		
		contactForm: function(){
			var form 	= $('.section_contact .contact_form');
			var status 	= form.find('.form_status');
			var button 	= $('#send_message');
			var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

			// attr() et non data() : jQuery mettrait en cache le texte de la 1re langue
			function text(key){ return status.attr('data-' + key); }

			// Un seul emplacement de message, annoncé aux lecteurs d'écran (aria-live).
			// .text() et non du HTML construit à la main.
			// Les erreurs restent affichées ; le succès disparaît après 6 s.
			function show(message, ok){
				status.stop(true, true).empty().append(
					$('<span>').addClass(ok ? 'contact_success' : 'contact_error').text(message)
				).slideDown(300);
				if(ok){ status.delay(6000).slideUp(500); }
			}

			// Corriger un champ efface le message d'erreur
			form.off('input.contact').on('input.contact', 'input, textarea', function(){
				if(status.find('.contact_error').length){ status.stop(true, true).slideUp(200); }
			});

			// « submit » : bouton, touche Entrée dans un champ
			form.off('submit').on('submit', function(e){
				e.preventDefault();
				if(button.prop('disabled')){ return false; }

				var name 	= $.trim($('#name').val());
				var email 	= $.trim($('#email').val());
				var phone 	= $.trim($('#phone').val());
				var message = $.trim($('#message').val());

				if(name === '' || email === '' || message === ''){
					show(text('empty'), false);
					return false;
				}
				if(!EMAIL_RE.test(email)){
					show(text('invalid'), false);
					$('#email').trigger('focus');
					return false;
				}
				if(typeof emailjs === 'undefined'){
					// script EmailJS bloqué (bloqueur de pub, réseau)
					console.error('[Contact] SDK EmailJS non chargé : envoi impossible.');
					show(text('error'), false);
					return false;
				}

				button.prop('disabled', true).attr('aria-busy', 'true');
				// Variables utilisées par le template EmailJS :
				// objet « Contact Us: {{title}} », expéditeur {{name}}, réponse à {{email}},
				// corps {{form_name}} / {{phone}} / {{form_message}}.
				// Le message part sous les deux noms : le template peut utiliser
				// {{form_message}} ou {{message}} sans que le contenu disparaisse.
				emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
					title: 			name,
					name: 			name,
					form_name: 		name,
					email: 			email,
					phone: 			phone,
					message: 		message,
					form_message: 	message
				}).then(function(){
					show(text('success'), true);
					form[0].reset();
				}, function(err){
					// Le détail de l'erreur EmailJS : status + texte du serveur
					// (ex. 400 « The template ID is invalid », 412 permission Gmail).
					console.error('[Contact] Échec EmailJS :', err && err.status, err && err.text ? err.text : err);
					show(text(err && err.status === 429 ? 'toofast' : 'error'), false);
				}).finally(function(){
					button.prop('disabled', false).removeAttr('aria-busy');
				});
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