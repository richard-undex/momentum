// Momentum Dashboard Page Script

m.isValidDate = function isValidDate(d) {
  if ( Object.prototype.toString.call(d) !== "[object Date]" ) {
	return false;
  }
  return !isNaN(d.getTime());
};

function isNewDay(date) {
  var today = new Date(localStorage.today);

  if ((today.getDate() !== date.getDate() && date.getHours() >= 5) || (today.getDate() == date.getDate() && date.getHours() >= 5 && today.getHours() < 5)) {
	return true;
  }

  return false;
}

function isDateInFuture(date) {
  return Date.parse(date) > Date.parse(new Date());
}

function ensureLocalStorageDatesAreValid() {
  var date = new Date();
  var dateKeys = ['today', 'backgroundUpdate'];

  for (var i in dateKeys) {
	var lsDate = new Date(localStorage[dateKeys[i]]);
	if (!m.isValidDate(lsDate) || isDateInFuture(lsDate)) {
	  //console.log('resetting ' + dateKeys[i]);
	  localStorage[dateKeys[i]] = date;
	}
  }
}

/** Models **/
m.models.Date = Backbone.Model.extend({
	defaults: function () {
		var date = new Date();
		var hour12clock = JSON.parse(localStorage.hour12clock);
		return {
			date: date,
			hour12clock: hour12clock
		};
	},
	initialize: function(){
		this.listenTo(this, 'change:date', this.updateTime, this);
	},
	getTimeString: function(date) {
		var hour12clock = this.get('hour12clock');
		date = date || this.get('date');
		var hour = date.getHours();
		var minute = date.getMinutes();
		if (hour12clock == true) {
			hour = ((hour + 11) % 12 + 1);
		}
		if (hour < 10 && !hour12clock) { hour = "0" + hour; }
		if (minute < 10) { minute = "0" + minute; }
		return hour + ':' + minute;
	},
	getTimePeriod: function() {
		if (this.get('date').getHours() >= 12) { return 'PM'; } else { return 'AM' };
	},
	updateTime: function() {
		var now = this.getTimeString();
		if (this.get('time') != now) {
			this.set('time', now);
		}
	}
});


/** Collections **/



/** Views **/

m.views.CenterClock = Backbone.View.extend({
	id: 'centerclock',
	template: Handlebars.compile( $("#centerclock-template").html() ),
	events: {
		"dblclick": "toggleFormat",
	},
	initialize: function () {
		this.render();
		this.listenTo(this.model, 'change:time', this.updateTime, this);
	},
	render: function () {
		var time = this.model.getTimeString();

		var variables = { time: time };
		var order = (this.options.order  || 'append') + 'To';

		this.$el[order]('#' + this.options.region).html( this.template(variables) ).fadeTo(500, 1);
		this.$time = this.$('.time');
		this.$format = this.$('.format');
	},
	toggleFormat: function () {
		ga('send', 'event', 'Time', 'Format Toggled');
		var hour12clock = !this.model.get('hour12clock');
		this.model.set({ hour12clock: hour12clock });
		localStorage.hour12clock = hour12clock;
		if (hour12clock) {
			setTimeout(function(){
				$('.format').addClass('show');
			}, 40);
			this.$format.html(this.model.getTimePeriod());
		} else {
			$('.format').removeClass('show');
		}
	},
	updateTime: function () {
		this.$time.html(this.model.getTimeString());
	}
});

function setEndOfContenteditable(contentEditableElement) {
	var range, selection;
	if (document.createRange) {
		range = document.createRange();
		range.selectNodeContents(contentEditableElement);
		range.collapse(false);
		selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	}
}

m.views.Greeting = Backbone.View.extend({
	id: 'greeting',
	template: Handlebars.compile( $("#greeting-template").html() ),
	events: {
		"dblclick .name": "editName",
		"keypress .name": "onKeypress",
		"keydown .name": "onKeydown",
		"blur .name": "saveName",
		"webkitAnimationEnd .name": "onAnimationEnd"
	},
	initialize: function () {
		this.render();
		this.listenTo(this.model, 'change:time', this.updatePeriod, this);
	},
	render: function () {
		var period = this.getPeriod();
		var name = localStorage.name;
		var variables = { period: period, name: name };
		var order = (this.options.order  || 'append') + 'To';

		this.$el[order]('#' + this.options.region).html( this.template(variables) ).fadeTo(500, 1);

		this.$period = this.$('.period');
		this.$name = this.$('.name');
	},
	getPeriod: function () {
		var now = this.model.get('date');
		var hour = now.getHours();
		var period;
		if (hour >= 3 && hour < 12) period = 'morning';
		if (hour >= 12 && hour < 17) period = 'afternoon';
		if (hour >= 17 || hour < 3) period = 'evening';
		return period;
	},
	updatePeriod: function () {
		this.$period.html(this.getPeriod());
	},
	editName: function () {
		if (!this.$name.hasClass('editing')) {
		  this.$name.attr('contenteditable', true).addClass('editing pulse').focus();
		  setEndOfContenteditable(this.$name.get(0));
		}
	},
	onAnimationEnd: function (e) {
	  if (e.originalEvent.animationName === "pulse") {
		this.$name.removeClass('pulse');
	  }
	},
	onKeypress: function (e) {
		if (e.keyCode == 13) {
			e.preventDefault();
			this.saveName();
		}
	},
	onKeydown: function (e) {
		if (e.keyCode === 27) {
			this.$name.html(localStorage.name); //revert
			this.doneEditingName();
		}
	},
	saveName: function () {
		ga('send', 'event', 'Name', 'Changed');
		var newName = this.$name.html();
		if (newName === "") {
		  this.$name.html(localStorage.name); //revert
		} else {
		  localStorage.name = newName;
		}
		this.doneEditingName();
	},
	doneEditingName: function () {
		this.$name.attr('contenteditable', false).removeClass('editing').addClass('pulse');
	}
});

m.views.Install = Backbone.View.extend({
	id: 'install',
	className: 'font-light',
	template: Handlebars.compile( $("#install-template").html() ),
	events: {
	},
	initialize: function () {
		this.render();
	},
	render: function () {
		// check to see what div to display, display it
		var order = (this.options.order  || 'append') + 'To';
		this.$el[order]('#' + this.options.region).html(this.template()).fadeTo(500, 1);

		var isChrome = window.chrome
		var vendorName = window.navigator.vendor
		if (isChrome !== null && vendorName === "Google Inc." && chrome && chrome.app) {
			if (chrome.app.isInstalled) {
				$('.install-complete').show();
			} else {
				$('.install').show();
			}
		} else if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
			// Firefox
			$('.firefox').show()
		} else {
			$('.not-chrome').show();
		}
	}
});

// Parent view
m.views.Dashboard = Backbone.View.extend({
	initialize: function () {
		// set up empty localstorage variables for JSON.parse
		// remove this one we get sync set up
		if (!localStorage.hour12clock) {
			localStorage.hour12clock = false;
		}
		if (!localStorage['momentum-messageRead']) {
			localStorage['momentum-messageRead'] = JSON.stringify({ version: "0" });
		}

		var names = ["good looking", "superstar", "smarty pants", "gorgeous", "lovely", "friend", "pal", "classy", "rockstar", "you wonderful human"];
		var name = names[Math.floor(Math.random() * names.length)];
		//if (!localStorage.name) {
			localStorage.name = name;
		//}

		m.models.date = new m.models['Date']();

		m.collect.backgrounds = new m.collect.Backgrounds();
		m.collect.backgrounds.fetch({async: false});

		m.views.install = new m.views.Install({ region: 'center-below' });

		m.views.background = new m.views.Background({
		  collection: m.collect.backgrounds,
		  model: m.models.date,
		  region: 'background'
		});

		this.render();

		ensureLocalStorageDatesAreValid();

		this.dateIntervalId = setInterval(function () {
		  m.models.date.set('date', new Date());
		}, 100);
	},
	render: function () {
		// Load widgets
		m.views.greeting = new m.views.Greeting({ model: m.models.date, region: 'center', order: 'prepend' });
		m.views.centerClock = new m.views.CenterClock({ model: m.models.date, region: 'center', order: 'prepend' });
	}
});


/** Bootstrap **/

$(function() {
	var fadetime = 500;

	/* Init */
	var appUrl = 'https://chrome.google.com/webstore/detail/apdfllckaahabafndbhieahigkjlhalf';

	/* Create parent AppView */
	m.appView = new m.views.Dashboard();

	/* Chrome store inline install */
	$('.install-app, .try-again').click(function(e) {
		ga('send', 'event', 'Install', 'Chrome', 'Button Clicked');
		//e.preventDefault();
		//chrome.webstore.install('https://chrome.google.com/webstore/detail/laookkfknpbbblfpciffpaejjkokdgca', handleInstallSuccess, handleInstallFailure);
	});

	function handleInstallSuccess() {
		ga('send', 'event', 'Install', 'Chrome', 'App Installed');
		$('.install').fadeTo(fadetime, 0, function() {
			$('.install').hide();
			$('.install-complete').fadeTo(fadetime, 1);
		});
	}

	function handleInstallFailure(error) {
		ga('send', 'event', 'Install', 'Chrome', 'Install Failed', error);
		$('.install, .install-failure').fadeTo(fadetime, 0, function() {
			$('.install').hide()
			$('.install-failure').fadeTo(fadetime, 1);
		});
	}

	// feature rotator
	function shuffle(array) {
		for (var i = array.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
		return array;
	}

	var $feature = $('.feature');
	var features = ["inspiration", "todo", "weather", "quotes", "photography", "focus", "positivity", "motivation"];
	shuffle(features);
	$feature.html(features[features.length - 1]);
	$feature.css('width', $feature.width());

	$.fn.rotateFeatures = function() {
		var feature = features.shift()
		features.push(feature);

		var self = this;
		self.fadeTo(fadetime, 0, function() {
			self.append('<span class="prototype">' + feature + '</span>');
			var newWidth = self.find('.prototype').width();
			self.css('width', newWidth + 'px').html(feature).fadeTo(fadetime, 1);
		});
		return this;
	};

	setInterval(function() {
		$feature.rotateFeatures();
	}, 4000);

	//$('.daily-item').fadeOut().html(dailytasks[1]).fadeIn();
});


