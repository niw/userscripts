// ==UserScript==
// @name          Google Thumbnails for Safari
// @version       0.3.5
// @namespace     http://niw.at/
// @description   Adds web site thumbnail images to google search results, original is from http://flet.ch/things/greasemonkey/
// @include       http://www.google.*/search*
// ==/UserScript==

(function () {
	Array.prototype.each = function(f) {
		for(var i = 0; i < this.length; i++) {
			f(this[i]);
		}
	}
	HTMLElement.prototype.insertNext = function(a) {
		this.parentNode.insertBefore(a, this.nextSibling);
	}
	function xpath(xpath, context) {
		var result = [];
		var elements = document.evaluate(xpath, context, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		for(var i = 0; i < elements.snapshotLength; i++) {
			result.push(elements.snapshotItem(i));
		}
		return result;
	}
	function error_span(msg) {
		var span = document.createElement("span");
		span.setAttribute("style", "background: #c00; color: #fff; font-size: 10px; padding: 3px; border: 1px solid #fff;");
		span.appendChild(document.createTextNode(msg));
		return span;
	}
	xpath("//*[(name() = 'div' and @class='g') or (name() = 'h3' and @class='sem')]", document).each(function(result) {
		var result_link = xpath("./h2/a", result)[0];
		if(result_link) {
			result.setAttribute("style", result.getAttribute("style") + "; clear: left;");
			var result_url = result_link.getAttribute("href");
			var real_result_url = result_url.replace(/^(?:([^\/].*)|\/url\?.*q=([^&]+)&?.*$)/i, "$1$2");
			var thumb_url = "http://open.thumbshots.org/image.pxf?url=" + real_result_url;

			var thumbnail = document.createElement("div");
			thumbnail.setAttribute("style", "float: left; margin: 0 8px 2px 0; width: 110px; height: 80px; overflow: hidden; background: #D5DDF3; border: 1px solid #3366CC;");
			thumbnail.innerHTML = '<a href="' + result_url + '"><img src="' + thumb_url + '" align="left" height="80" width="110" /></a>';
			result_link.insertNext(thumbnail);
		}
	});
})();
