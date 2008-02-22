// ==UserScript==
// @name           Onpuchan Reveal Abbreviated Comments
// @namespace      http://niw.at/
// @description    Reveal abbreviated comments on Onpuchan BBS
// @include        http://rail.uploader.dyndns.org/*
// ==/UserScript==

(function() {
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

	function onpuchan_topics(context) {
		var topics = [];
		hr = xpath(".//form/form/hr", context);
		for(var i = 0; i < hr.length; i++) {
			var item = hr[i].nextSibling, elements = [], flag = false;
			while(item != hr[i+1] && item != null) {
				if(item.tagName == "INPUT" && item.getAttribute("name") == "delete[]") {
					flag = true;
				}
				elements.push(item);
				item = item.nextSibling;
			}
			if(!flag) {
				continue
			}
			var tag = document.createElement("div");
			array_each(elements, function(a) {
				a.parentNode.removeChild(a);
				tag.appendChild(a);
			});
			topics.push([hr[i],tag]);
		}
		return topics;
	}
	array_each(onpuchan_topics(document), function(topic) {
		var placepoint = topic[0];
		var tag = topic[1];

		var link = xpath(".//a[contains(text(), '返信')]", tag)[0];
		var abbreviate = xpath(".//*[contains(text(), '省略')]", tag)[0];
		if(link && abbreviate) {
			var href = link.getAttribute("href");
			var anchor = document.createElement("a");
			anchor.setAttribute("style", "cursor: hand; font-size: 10px; color: #fff; padding: 4px; border: 1px solid #00f; background: #36c;");
			var f = function() {
				anchor.removeEventListener("click", f, false);
				anchor.innerHTML = "Loading...";
				xmlHttpRequest({method: "GET", url: href, onload: function(http) {
					var html = document.createElement("div");
					html.innerHTML = http.responseText;
					array_each(onpuchan_topics(html), function(t) {
						tag.parentNode.removeChild(tag);
						insertNext(placepoint, t[1]);
					});
				}});
			}
			anchor.addEventListener("click", f, false);
			anchor.innerHTML = "Load Partial";
			insertNext(abbreviate, anchor);
		}
		insertNext(placepoint, tag);
	});
} catch(exception) {
	var tag = document.createElement("div");
	tag.setAttribute("style", "padding: 4px; font-size: 10px; color: #fff; border: 1px solid #f00; background: #c00;");
	tag.appendChild(document.createTextNode(exception));
	document.body.insertBefore(tag, document.body.firstChild);
}
})();
