/*
	Strata by HTML5 UP
	html5up.net | @n33co
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var settings = {

		// Parallax background effect?
			parallax: true,

		// Parallax factor (lower = more intense, higher = less intense).
			parallaxFactor: 20

	};

	skel.breakpoints({
		xlarge: '(max-width: 1800px)',
		large: '(max-width: 1280px)',
		medium: '(max-width: 980px)',
		small: '(max-width: 736px)',
		xsmall: '(max-width: 480px)'
	});

	$(function() {

		var $window = $(window),
			$body = $('body'),
			$header = $('#header');

		// Disable animations/transitions until the page has loaded.
			$body.addClass('is-loading');

			$window.on('load', function() {
				$body.removeClass('is-loading');
			});

		// Touch?
			if (skel.vars.mobile) {

				// Turn on touch mode.
					$body.addClass('is-touch');

				// Height fix (mostly for iOS).
					window.setTimeout(function() {
						$window.scrollTop($window.scrollTop() + 1);
					}, 0);

			}

		// Fix: Placeholder polyfill.
			$('form').placeholder();

		// Prioritize "important" elements on medium.
			skel.on('+medium -medium', function() {
				$.prioritize(
					'.important\\28 medium\\29',
					skel.breakpoint('medium').active
				);
			});

		// Header.

			// Parallax background.

				// Disable parallax on IE (smooth scrolling is jerky), and on mobile platforms (= better performance).
					if (skel.vars.browser == 'ie'
					||	skel.vars.mobile)
						settings.parallax = false;

				if (settings.parallax) {

					skel.on('change', function() {

						if (skel.breakpoint('medium').active) {

							$window.off('scroll.strata_parallax');
							$header.css('background-position', 'top left, center center');

						}
						else {

							$header.css('background-position', 'left 0px');

							$window.on('scroll.strata_parallax', function() {
								$header.css('background-position', 'left ' + (-1 * (parseInt($window.scrollTop()) / settings.parallaxFactor)) + 'px');
							});

						}

					});

				}

		// Main Sections: Two.

			// Lightbox gallery.
				$window.on('load', function() {
					intializeJS();
					$('#two').poptrox({
						caption: function($a) { return $a.next('h3').text(); },
						overlayColor: '#2c2c2c',
						overlayOpacity: 0.85,
						popupCloserText: '',
						popupLoaderText: '',
						selector: '.work-item a.image',
						usePopupCaption: true,
						usePopupDefaultStyling: false,
						usePopupEasyClose: false,
						usePopupNav: true,
						windowMargin: (skel.breakpoint('small').active ? 0 : 50)
					});

				});

	});

})(jQuery);

var speaks_array = [], total_median, total_mean;

function intializeJS() {

	$('.upload-tabs').off('click').on('click', function() {
		$('.tabs-input').trigger('click');
	})

	$('.tabs-input').off('change').on('change', function() {
		$('.tabs-submit').trigger('click');
	});


	$('.tabs-submit').on('click', function(e) {
		e.preventDefault();
		var form = $('.upload-tabs-form');
        var formData = new FormData(form[0]);

		$.ajax({
			url: 'php/helper.php',
			data: formData,
			type: 'POST',
			async: false,
            mimeType: "multipart/form-data",
            cache: false,
            contentType: false,
            processData: false,
            dataType: 'json',
			success: function(response) {
				if(response['status'] == 'success') {
					$('.upload-message').text(response['message']).show();
					$('.calculate-avg').show();
					speaks_array = response['speaks_array']
				}
			}
		});
	});


	$('.calculate-avg').on('click', function() {
		var data = {
			'speaks_array' : speaks_array,
			'action' : 'calculate-avg'
		};
		$.ajax({
			url: 'php/helper.php',
			data: data,
			type: 'POST',
			dataType: 'json',
			success: function(response) {
				if(response['status'] == 'success') {
					total_median = response['total_median'];
					total_mean = response['total_mean'];
					$('.display_average').html(response['display_html']).show();
				} else {
					alert(response['message']);
				}
			}
		});
	});

	$('.submit-btn').on('click', function() {
		var tour_name = $('#tour-name').val();
		var data = {
			'action' : 'upload-gscript',
			'tour_name' : tour_name,
			'median' : total_median,
			'mean' : total_mean
		};
		$('.sheets-url').removeClass('hidden').show();
		$.ajax({
			url: 'php/helper.php',
			data: data,
			type: 'POST',
			dataType: 'json',
			success: function(response) {
			}
		});

	});
}

