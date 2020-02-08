$(function() {
	var ga = ga || function() {};

	// Handle recaptcha success callback
	function onSubmit() {
		contactForm.submit()
	}
	window.onSubmit = onSubmit

	function onError() {
		console.log('Error!')
	}
	window.onError = onError

	var $contact = $('#contact-form')
	var $name = $('#contact-name')
	var $email = $('#contact-email')
	var $comments = $('#contact-comments')
	var $button = $('#contact-submit')
	var $message = $('.contact-message')

	var contactForm = {
		submit: function (token) {
			// check that the form is filled out
			// doing non-html5 validation because the recaptcha wasn't playing well with it
			if (!$name.val()) {
				$name.addClass('error')
				this.showMessage('Please fill in your name.')
				return
			} else {
				$name.removeClass('error')
			}

			// check for email
			if (!$email.val()) {
				$email.addClass('error')
				this.showMessage('Please fill in your email address.')
				return
			} else {
				$name.removeClass('error')
			}

			// check for valid email
			var validateEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			var emailVal = jQuery.trim($('#contact-email').val());
			if (!validateEmail.test(emailVal)) {
				this.showMessage("Please check that you put in a valid email address.")
				$email.addClass('error')
				ga('send', 'event', 'Contact', 'Email Address Invalid')
				return
			} else {
				$email.removeClass('error')
			}

			// check for comments
			if (!$comments.val()) {
				$comments.addClass('error')
				this.showMessage('Please enter a message to send.')
				return
			} else {
				$comments.removeClass('error')
			}


			// submit the form and send the email
			if ($('#contact-form').find('.error').length === 0) {
				$button.attr({ 'disabled': true, 'value': 'Sending...' });
				ga('send', 'event', 'Contact', 'Form Submitted')

				$.ajax({
					type: "post",
					url: "https://api.momentumdash.com/support/ticket",
					data: $contact.serialize(),
					crossDomain: true,
					error: function(xhr, status, error) {
						contactForm.showMessage("Error sending message. Please try again.")
						ga('send', 'event', 'Contact', 'Error Sending Form');
					},
					success: function(response) {
						if (response.success == true) {
							// show success case
							var name = $('#contact-name').val().split(' ')[0];
							contactForm.showMessage("Thanks for reaching out, <span class='u--capitalize'>" + name + "</span>! We'll be in touch soon.", true)
							$button.val('Message Sent')
							ga('send', 'event', 'Contact', 'Message Sent');
						} else {
							// show error message and reset form
							contactForm.showMessage("Error sending message. Please try again.")
							ga('send', 'event', 'Contact', 'Error API Response');
						}
					}
				});
			}
		},

		resetForm: function () {
			grecaptcha.reset()
			$button.attr({ 'disabled': false, 'value': 'Send' })
		},

		showMessage: function (message, success) {
			success = success || false
			var $message = $('.contact-message')

			$message.css('opacity', 0).removeClass('error').html(message).fadeTo(500, 1)

			if (success == false)
				$message.addClass('error')

			this.resetForm()
		}
	}

	$contact.submit(function(e) {
		e.preventDefault()
		grecaptcha.execute()
	});

	$contact.keydown(function(e) {
		if (e.keyCode == 13 && (e.metaKey || e.ctrl)) {
			$contact.submit()
		}
	});

})
