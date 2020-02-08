window.ga = function (cmd, eventType, component, operation, detail ) {
	if(cmd !== 'send') return;
	var ga_sessionid = sessionStorage ? sessionStorage.getItem('ga_sessionid') : uuidv4()
	var utm_source = getUrlParameter('utm_source')
	var utm_medium = getUrlParameter('utm_medium')
	var utm_campaign = getUrlParameter('utm_campaign')
	var utm_term = getUrlParameter('utm_term')
	var utm_content = getUrlParameter('utm_content')

	if(!ga_sessionid)
	{
		ga_sessionid = uuidv4()
		sessionStorage.setItem('ga_sessionid',ga_sessionid)
	}
	try {
		var language = window.navigator.userLanguage || window.navigator.language;
		var resolution = window.screen.availWidth + 'x' + window.screen.availHeight
		var colorDepth = window.screen.colorDepth
		var viewportW = window.innerWidth;
		var viewportH = window.innerHeight;
		var viewport = viewportW+'x'+viewportH
		var request = new XMLHttpRequest();
		var code = 'UA-44319322-2'
		var message = "v=1&tid=" + code + "&cid=" + ga_sessionid +
			"&t="+eventType+
			"&ul=" + language + "&sr=" + resolution + "&vp=" + viewport	+ "&de=" +document.characterSet +
			"&sd=" + colorDepth + "&aip=1"
            message += "&dl=" + encodeURIComponent(document.location.origin+document.location.pathname)
			if(eventType=='event')
                message += "&ec=" + component;//event category
		if (operation)
			message += "&ea=" + operation;//event action
		if (detail)
			message += "&el=" + detail; //event label
		if (utm_source)
			message += "&cs=" + encodeURIComponent(utm_source);
		if (utm_medium)
			message += "&cm=" + encodeURIComponent(utm_medium);
		if (utm_campaign)
			message += "&cn=" + encodeURIComponent(utm_campaign);
		if (utm_term)
			message += "&ck=" + encodeURIComponent(utm_term);
		if (utm_content)
			message += "&cc=" + encodeURIComponent(utm_content);
		if (window.experiment && window.experiment.xid)
			message += "&xid=" + encodeURIComponent(window.experiment.xid);
		if (window.experiment && window.experiment.xvar)
			message += "&xvar=" + encodeURIComponent(window.experiment.xvar);
		request.open("POST", "https://www.google-analytics.com/collect", true);
		request.send(message);
	} catch (e) {
		//ignore
    }

	function uuidv4() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	function getUrlParameter(name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(location.search);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	};
}


ga('send', 'pageview');
