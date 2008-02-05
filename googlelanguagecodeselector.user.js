// ==UserScript==
// @name           Google Language Code Selector
// @namespace      http://niw.at/
// @description    Select hl paramter for google query
// @include        http://www.google.*/*q=*
// @include        http://www.google.*/
// @include        http://www.google.*/webhp*
// @exclude        http://www.google.*/reader*
// ==/UserScript==

(function() {
try {
	Array.prototype.each = function(f) {
		for(var i = 0; i < this.length; i++) {
			f(this[i]);
		}
	}
	Object.prototype.each = function(f) {
		for(var key in this) {
			if(!(this[key] && this[key] == this.__proto__[key])) {
				f(key, this[key]);
			}
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

	function lang_select(selected) {
		var langs = {"en": "English", "ja": "Japanese"};
		var select = document.createElement("select");
		select.setAttribute("name", "hl");
		langs.each(function(key, lang) {
			var option = document.createElement("option");
			option.setAttribute("value", key);
			if(key == selected) {
				option.setAttribute("selected", "");
			}
			option.appendChild(document.createTextNode(lang));
			select.appendChild(option);
		});
		select.onchange = function() {
			this.form.submit();
		}
		return select;
	}
	function current_lang() {
		document.location.href.replace(/lr=lang_[^&]+&?/, '').replace(/hl=([^&]+)&?/, '');
		return (RegExp.$1) ? RegExp.$1 : "en";
	}
	xpath("//form", document).each(function(form) {
		// NOTE Current google result page was invalid HTML around form tag
		// We should fix it to add the select tag.
		//if(!form.childNodes.length) {
		if(form.getAttribute("name") == "gs") {
			var table = xpath("..//table[@class='tb']", form)[0];
			if(table) {
				form.parentNode.removeChild(form);
				table.parentNode.appendChild(form);
				table.parentNode.removeChild(table);
				form.appendChild(table);
			} else {
				form.insertNext(error_span("Language Selector: Google might change the DOM layout!"));
			}
		}
		var q = xpath(".//input[@name='q']", form);
		if(q.length) {
			xpath(".//input[@name='hl']", form).each(function(a) {
				a.parentNode.removeChild(a);
			});
			q.each(function(a) {
				a.insertNext(lang_select(current_lang()));
				a.insertNext(document.createTextNode(" "));
				modif = true;
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
