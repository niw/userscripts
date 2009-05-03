// ==UserScript==
// @name           Google Language Code Selector
// @version        0.1.1
// @namespace      http://niw.at/
// @description    Select hl paramter for google query
// @include        http://www.google.*/*q=*
// @include        http://www.google.*/
// @include        http://www.google.*/webhp*
// @exclude        http://www.google.*/reader*
// ==/UserScript==

(function() {

// a list of languages which you want to show on the google search form
var LANGUAGES = {
	en: "English",
	ja: "Japanese"
};
var BUTTON_MODE = true;

try {
	function array_each(a, f) {
		for(var i = 0; i < a.length; i++) {
			f(a[i]);
		}
	}
	function hash_each(o, f) {
		for(var key in o) {
			if(!(o[key] && o[key] == o.__proto__[key])) {
				f(key, o[key]);
			}
		}
	}
	function hash_keys(o) {
		var keys = [];
		for(var key in o) {
			if(!(o[key] && o[key] == o.__proto__[key])) {
				keys.push(key);
			}
		}
		return keys;
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
	function error_span(msg) {
		var span = document.createElement("span");
		span.setAttribute("style", "background: #c00; color: #fff; font-size: 10px; padding: 3px; border: 1px solid #fff;");
		span.appendChild(document.createTextNode(msg));
		return span;
	}

	function lang_select(selected) {
		if(BUTTON_MODE) {
			var keys = hash_keys(LANGUAGES);
			var i = keys.indexOf(selected) + 1;
			if(i >= keys.length) {
				i = 0;
			}
			var key = keys[i];
			var button = document.createElement("input");
			button.setAttribute("type", "button");
			button.setAttribute("value", LANGUAGES[keys[i]]);
			button.addEventListener("click", function(e) {
				var hidden = document.createElement("input");
				hidden.setAttribute("type", "hidden");
				hidden.setAttribute("name", "hl");
				hidden.setAttribute("value", key);
				this.form.appendChild(hidden);
				this.form.submit();
			}, false);
			return button;
		} else {
			var select = document.createElement("select");
			select.setAttribute("name", "hl");
			hash_each(LANGUAGES, function(key, lang) {
				var option = document.createElement("option");
				option.setAttribute("value", key);
				if(key == selected) {
					option.setAttribute("selected", "");
				}
				option.appendChild(document.createTextNode(lang));
				select.appendChild(option);
			});
			select.addEventListener("change", function() {
				this.form.submit();
			}, false);
			return select;
		}
	}
	function current_lang() {
		document.location.href.replace(/lr=lang_[^&]+&?/, '').replace(/hl=([^&]+)&?/, '');
		return (RegExp.$1) ? RegExp.$1 : "en";
	}
	array_each(xpath("//form", document), function(form) {
		var q = xpath(".//input[@name='q']", form);
		if(q.length) {
			array_each(xpath(".//input[@name='hl']", form), function(a) {
				a.parentNode.removeChild(a);
			});
			array_each(q, function(a) {
				insertNext(a, lang_select(current_lang()));
				insertNext(a, document.createTextNode(" "));
			});
		}
	});
} catch(exception) {
	var tag = document.createElement("div");
	tag.setAttribute("style", "padding: 4px; font-size: 10px; color: #fff; border: 1px solid #f00; background: #c00;");
	tag.appendChild(document.createTextNode(exception));
	document.body.insertBefore(tag, document.body.firstChild);
}
})();
