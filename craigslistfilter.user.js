// ==UserScript==
// @name           Craigslist Filter
// @version        0.0.1
// @namespace      http://niw.at/
// @description    Filtering the reuslt of Craigslist
// @include        http://sfbay.craigslist.org/sfc/apa*
// @include        http://sfbay.craigslist.org/search/apa/sfc*
// ==/UserScript==

(function() {
// exclude keywords in regular expression
var EXCLUDE_TITLE_KEYWORDS = /(ucsf|usf|richmond|sunset|marina|castro|twin|ingleside)/i;
var EXCLUDE_CONTENT_KEYWORDS = /(TMS333)/i;
var MAX_RATE = 2500;
var MIN_RATE = 0;

try {
	function array_each(a, f) {
		for(var i = 0; i < a.length; i++) {
			f(a[i]);
		}
	}
	function insertNext(h, a) {
		h.parentNode.insertBefore(a, h.nextSibling);
	}
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

	function remove_by_line(e) {
		var span = document.createElement("span");
		span.setAttribute("style", "color: #ccc; text-decoration: line-through;");
		e.parentNode.insertBefore(span, e);
		span.appendChild(e);
		array_each(xpath(".//a", e), function(a){
			a.setAttribute("style", "color: #ccc;");
		});
	}

	array_each(xpath("./blockquote/p/a", document.body), function(tag) {
		var p = tag.parentNode;	
		var href = tag.getAttribute("href");
		var title = getText([p]);
		var rate = 0;
		if(m = title.match(/\$([0-9]+)/)) {
			rate = parseInt(m[1]);
		}


		if(title.match(EXCLUDE_TITLE_KEYWORDS) || rate > MAX_RATE || rate <= MIN_RATE) {
			remove_by_line(p);
		} else {
 			var s = document.createElement("span");
			s.setAttribute("style", "font-size: 10px; color: #333; border: 1px solid #ccc; background: #eee; margin: 0 5px;");
			s.innerHTML = "Loading...";
			insertNext(tag, s);
			xmlHttpRequest({method: "GET", url: href, onload: function(http) {
				var html = document.createElement("div");
				html.innerHTML = http.responseText;

				var content = xpath(".//div[@id='userbody']", html);
				var content_text = getText(content);
				if(m = content_text.match(EXCLUDE_CONTENT_KEYWORDS)) {
					s.innerHTML = m[1];
					remove_by_line(p);
				}else {
					var div = document.createElement("div");
					div.setAttribute("style", "margin-left: 50px; background: #eee; padding: 2px; font-size: 10px; font-family: sans-serif;");

					if(xpath(".//img", html).length == 0) {
						s.innerHTML = "No Images";
						div.innerHTML = content_text;
						p.appendChild(div);
					} else {
						var images = xpath(".//table//img[contains(@alt, 'image ') or contains(@src, 'http://www.postlets.com/create/photos/')]", html);
						if(images.length) {
							array_each(images, function(i) {
								i.setAttribute("height", "120px");
								i.setAttribute("width", "120px");
								div.appendChild(i);
							});
							p.appendChild(div);
						}
						s.parentNode.removeChild(s);
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
