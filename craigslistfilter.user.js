// ==UserScript==
// @name           Craigslist Filter
// @version        0.1.0
// @namespace      http://niw.at/
// @description    Filtering the reuslt of Craigslist
// @include        http://sfbay.craigslist.org/*apa*
// @include        http://sfbay.craigslist.org/*roo*
// ==/UserScript==

(function() {

// CONFIGURATION
// exclude keywords in regular expression (examples)
var EXCLUDE_TITLE_KEYWORDS     = /(sunset|ingleside|tenderloin)/i;
var EXCLUDE_CONTENT_KEYWORDS   = /(TMS333|3333|Redstone Properties)/gi;
// highlighted keywords in regular expression (examples)
var HIGHLIGHT_CONTENT_KEYWORDS = /(washer|dryer|in unit|w\/d|parking)/gi;
// range of budget
var MAX_RATE = 2500;
var MIN_RATE = 500;

try {
	function arrayEach(a, f) {
		for(var i = 0; i < a.length; i++) {
			f(a[i]);
		}
	}
	function insertNext(h, a) {
		h.parentNode.insertBefore(a, h.nextSibling);
	}
	function removeTag(a) {
		a.parentNode.removeChild(a);
	}
	// NOTE based on jquery.js
	function getText(elems) {
		var ret="", e;
		for(var i=0; elems[i]; i++){
			e = elems[i];
			if(e.nodeType === 3 || e.nodeType === 4) {
				ret += e.nodeValue;
			} else if(e.nodeType !== 8) {
				ret += getText(e.childNodes);
			}
		}
		return ret;
	}
	function xmlHttpRequest(option) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function(){
			if(xmlhttp.readyState == 4) {
				if(option['onload']) {
					option['onload'].call(this, xmlhttp);
				}
			}
		};
		xmlhttp.open(option['method'], option['url'], true);
		xmlhttp.send(option['data']);
	}
	function xpath(xpath, context) {
		var result = [];
		var elements = document.evaluate(xpath, context, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		for(var i = 0; i < elements.snapshotLength; i++) {
			result.push(elements.snapshotItem(i));
		}
		return result;
	}


	function strikeTag(e) {
		var span = document.createElement("span");
		span.setAttribute("style", "color: #ccc; text-decoration: line-through;");
		e.parentNode.insertBefore(span, e);
		span.appendChild(e);
		arrayEach(xpath(".//a", e), function(a){
			a.setAttribute("style", "color: #ccc;");
		});
	}
	COLORS = {
		gray: "color: #333; background: #eee; border-color: #ccc;",
		blue: "color: #27b; background: #def; border-color: #379;"
	};
	function addStatusTag(e, html, color) {
		var s = document.createElement("span");
		var style = "font-size: 10px; margin: 0 5px; border: 1px solid;";
		s.setAttribute("style", style + (COLORS[color] || COLORS["gray"]));
		if(html) {
			s.innerHTML = html;
		}
		insertNext(e, s);
		return s;
	}


	arrayEach(xpath("./blockquote/p/a", document.body), function(anchor_tag) {
		var line_tag = anchor_tag.parentNode;	
		var title = getText([line_tag]);
		var rate = 0;
		if(m = title.match(/\$([0-9]+)/)) {
			rate = parseInt(m[1]);
		}

		if(title.match(EXCLUDE_TITLE_KEYWORDS) || rate > MAX_RATE || rate <= MIN_RATE) {
			strikeTag(line_tag);
		} else {
			var status_tag = addStatusTag(anchor_tag, "Loading...");
			xmlHttpRequest({method: "GET", url: anchor_tag.getAttribute("href"), onload: function(http) {
				var html = document.createElement("div");
				html.innerHTML = http.responseText;
				var content = getText(xpath(".//div[@id='userbody']", html));

				if(m = content.match(EXCLUDE_CONTENT_KEYWORDS)) {
					status_tag.innerHTML = m.join(", ");
					strikeTag(line_tag);
				} else {
					if(m = content.match(HIGHLIGHT_CONTENT_KEYWORDS)) {
						addStatusTag(anchor_tag, m.join(", "), "blue");
					}

					var inline_tag = document.createElement("div");
					inline_tag.setAttribute("style", "margin-left: 50px; background: #eee; padding: 2px; font-size: 10px; font-family: sans-serif;");

					if(xpath(".//img", html).length == 0) {
						status_tag.innerHTML = "No Images";
						inline_tag.innerHTML = content;
						line_tag.appendChild(inline_tag);
					} else {
						var img_tags = xpath(".//table//img[contains(@alt, 'image ') or contains(@src, 'http://www.postlets.com/create/photos/')]", html);
						if(img_tags.length) {
							arrayEach(img_tags, function(img_tag) {
								img_tag.setAttribute("height", "120px");
								img_tag.setAttribute("width", "120px");
								inline_tag.appendChild(img_tag);
							});
							line_tag.appendChild(inline_tag);
						}
						removeTag(status_tag);
					}
				}
			}});
		}
	});
} catch(exception) {
	var tag = document.createElement("div");
	tag.setAttribute("style", "padding: 4px; font-size: 10px; color: #fff; border: 1px solid #f00; background: #c00;");
	tag.appendChild(document.createTextNode(exception));
	document.body.insertBefore(tag, document.body.firstChild);
}
})();
