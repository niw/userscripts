// ==UserScript==
// @name          Google Thumbnails for Safari
// @version       0.2.1
// @namespace     http://niw.at/
// @description   Adds web site thumbnail images to google search results, original is from http://flet.ch/things/greasemonkey/
// @include       http://www.google.*/search*
// ==/UserScript==

(function () {
try {
	function array_each(a, f) {
		for(var i = 0; i < a.length; i++) {
			f(a[i]);
		}
	}
	function insertNext(h, a) {
		h.parentNode.insertBefore(a, h.nextSibling);
	}
	function xpath(xpath, context) {
		var result = [];
		var elements = document.evaluate(xpath, context, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		for(var i = 0; i < elements.snapshotLength; i++) {
			result.push(elements.snapshotItem(i));
		}
		return result;
	}
	function addThumbnails(target) {
		array_each(xpath(".//*[((name() = 'LI' or name() = 'li') and contains(@class,'g'))]", target), function(result) {
			var result_link = xpath("./h3/a", result)[0];
			if(result_link) {
				result.setAttribute("style", result.getAttribute("style") + "; clear: left;");
				var result_url = result_link.getAttribute("href");
				var real_result_url = result_url.replace(/^(?:([^\/].*)|\/url\?.*q=([^&]+)&?.*$)/i, "$1$2");
				var letter = real_result_url.replace(/^[^:]*:\/\/(?:www\.)?(.).*/, "$1");
				var thumb_url = "http://" + letter + ".googlepreview.com/preview?s=" + real_result_url;

				var thumbnail = document.createElement("div");
				thumbnail.setAttribute("style", "float: left; margin: 0 8px 2px 0; width: 110px; height: 80px; overflow: hidden; background: #D5DDF3; border: 1px solid #3366CC;");
				thumbnail.innerHTML = '<a href="' + result_url + '"><img src="' + thumb_url + '" align="left" height="80" width="110" /></a>';
				insertNext(result_link, thumbnail);
			}
		});
	}
	document.body.addEventListener("AutoPagerize_DOMNodeInserted", function(e){
		var node = e.target;
		addThumbnails(node);
	}, false);
	addThumbnails(document);
} catch(exception) {
	var tag = document.createElement("div");
	tag.setAttribute("style", "padding: 4px; font-size: 10px; color: #fff; border: 1px solid #f00; background: #c00;");
	tag.appendChild(document.createTextNode(exception));
	document.body.insertBefore(tag, document.body.firstChild);
}
})();
