// ==UserScript==
// @name           List Filter
// @namespace      http://niw.at/
// @description    Filtering the list elements
// @include        *
// @exclude        *.google.*/*
// ==/UserScript==

(function() {
try {
	function array_each(a, f) {
		for(var i = 0; i < a.length; i++) {
			f(a[i]);
		}
	}
	function array_map(a, f) {
		var result = []; //new Array(this.length);
		for(var i = 0; i < a.length; i++) {
			result[i] = f(a[i]);
		}
		return result;
	}
	function hash_each(o, f) {
		for(var key in o) {
			if(!(o[key] && o[key] == o.__proto__[key])) {
				f(key, o[key]);
			}
		}
	}
	function xpath(xpath, context) {
		var result = [];
		var elements = document.evaluate(xpath, context, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		for(var i = 0; i < elements.snapshotLength; i++) {
			result.push(elements.snapshotItem(i));
		}
		return result;
	}
	function isSafari() {
		return /Konqueror|Safari|KHTML/.test(navigator.userAgent);
	}
	function isFirefox() {
    	return navigator.userAgent != null && navigator.userAgent.indexOf( "Firefox/" ) != -1;
	}

	function dofilter(listtag, childtagnames) {
		return function(e) {
			var terms = this.value.split(" ");
			array_each(xpath(".//*[" + array_map(childtagnames, function(a){ if(isFirefox()) { a = a.toUpperCase(); }; return "(name() = '" + a + "')" }).join(" or ") + "]", listtag), function(node) {
				var display = "";
				var innerText = node.innerHTML.replace(/<[^>]+>/g, "");
				for (var i = 0; i < terms.length; i++) {
					var text = innerText;
					if (terms[i].toLowerCase() == terms[i]) {
						text = text.toLowerCase();
					}
					if (text.indexOf(terms[i]) < 0) {
						display = "none";
					}
				}
				node.style.display = display;
			});
		}
	}

	var listtags = {
		"table": ["td", "th"],
		"ol": ["li"],
		"ul": ["li"],
		"dl": ["dt", "dd"]
	}
	var inputs = [];
	hash_each(listtags, function(tagname, childtagnames) {
		array_each(xpath("//" + tagname + "[" + array_map(childtagnames, function(a){ return "(count(.//" + a + ") > 10)" }).join(" or ") + "]", document), function(listtag) {
			var input = document.createElement('INPUT');
			input.setAttribute("type", "search");
			input.setAttribute("placeholder", "Filter");
			input.setAttribute("autosave", location.href);
			input.setAttribute("results", 5);
			input.setAttribute("incremental", true);
			with (input.style) {
				fontSize = "8px";
				border = "1px solid #ddd";
				margin = "2px";
				display = "none";
			}
			input.addEventListener(isSafari() ? "search" : "keydown", dofilter(listtag, childtagnames), true);
			listtag.parentNode.insertBefore(input, listtag);
			inputs.push(input);
		});
	});
	document.body.addEventListener("keydown", function(e) {
		// press Ctrl+F to switch filter field
		if(e.ctrlKey && e.keyCode == 70) {
			array_each(inputs, function(input) {
				input.style.display = (input.style.display == "none") ? "" : "none";
			});
		}
	}, false);
} catch(exception) {
	var tag = document.createElement("div");
	tag.setAttribute("style", "padding: 4px; font-size: 10px; color: #fff; border: 1px solid #f00; background: #c00;");
	tag.appendChild(document.createTextNode(exception));
	document.body.insertBefore(tag, document.body.firstChild);
}
})();
