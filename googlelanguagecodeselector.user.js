// ==UserScript==
// @name           Google Language Code Selector
// @version        0.3.0
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

	function remove_all_input(form, name) {
		array_each(xpath(".//input[@name='" + name + "']", form), function(a) {
			a.parentNode.removeChild(a);
		});
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
			button.setAttribute("class", "lsb");
			button.setAttribute("value", LANGUAGES[keys[i]]);
			button.addEventListener("click", function(e) {
				remove_all_input(this.form, "lr");
				var hidden = document.createElement("input");
				hidden.setAttribute("type", "hidden");
				hidden.setAttribute("name", "lr");
				hidden.setAttribute("value", "lang_" + key);
				this.form.appendChild(hidden);
				this.form.submit();
			}, false);
			return button;
		} else {
			var select = document.createElement("select");
			select.setAttribute("name", "lr");
			hash_each(LANGUAGES, function(key, lang) {
				var option = document.createElement("option");
				option.setAttribute("value", "lang_" + key);
				if(key == selected) {
					option.setAttribute("selected", "");
				}
				option.appendChild(document.createTextNode(lang));
				select.appendChild(option);
			});
			select.addEventListener("change", function() {
				this.form.submit();
			}, false);
			var container = document.createElement("span");
			container.appendChild(select);
			return container;
		}
	}
	function current_lang() {
		document.location.href.replace(/hl=([^&]+)&?/, '').replace(/lr=lang_([^&]+)&?/, '');
		return (RegExp.$1) ? RegExp.$1 : "en";
	}

	var selected = current_lang();
	array_each(xpath("//form", document), function(form) {
		var q = xpath(".//input[@name='q']", form);
		if(q.length) {
			if(!BUTTON_MODE) {
				remove_all_input(form, "lr");
			}
			var submit = xpath(".//input[@type='submit']", form);
			if(submit && (submit = submit[0])) {
				var selector = lang_select(selected);
				insertNext(submit, selector);
				var container = submit.parentNode;
				if(container && container.getAttribute("class") == "lsbb") {
					submit.setAttribute("style", "border-right: 1px solid #cccccc;");
					var width = submit.offsetWidth + selector.offsetWidth;
					container.setAttribute("style", "width: " + width + "px;");
				}
			}
		}
	});
} catch(exception) {
	var tag = document.createElement("div");
	tag.setAttribute("style", "padding: 4px; font-size: 10px; color: #fff; border: 1px solid #f00; background: #c00;");
	tag.appendChild(document.createTextNode(exception));
	document.body.insertBefore(tag, document.body.firstChild);
}
})();
