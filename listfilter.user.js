// ==UserScript==
// @name           List Filter
// @namespace      http://niw.at/
// @description    Filtering the list elements
// @include        *
// ==/UserScript==

(function() {
try {
	Array.prototype.each = function(f) {
		for(var i = 0; i < this.length; i++) {
			f(this[i]);
		}
	}
	Array.prototype.map = function(f) {
		var result = []; //new Array(this.length);
		for(var i = 0; i < this.length; i++) {
			result[i] = f(this[i]);
		}
		return result;
	}
	Object.prototype.each = function(f) {
		for(var key in this) {
			if(!(this[key] && this[key] == this.__proto__[key])) {
				f(key, this[key]);
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

	function dofilter(listtag, childtagnames) {
		return function(e) {
			var terms = this.value.split(" ");
			var collection = xpath(".//*[" + childtagnames.map(function(a){ return "(name() = '" + a + "')" }).join(" or ") + "]", listtag);
			collection.each(function(node) {
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
	listtags.each(function(tagname, childtagnames) {
		xpath("//" + tagname + "[" + childtagnames.map(function(a){ return "(count(.//" + a + ") > 10)" }).join(" or ") + "]", document).each(function(listtag) {
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
			input.addEventListener("search", dofilter(listtag, childtagnames), true);
			listtag.parentNode.insertBefore(input, listtag);
			inputs.push(input);
		});
	});
	document.body.addEventListener("keydown", function(e) {
		// press Ctrl+F to switch filter field
		if(e.ctrlKey && e.keyCode == 70) {
			inputs.each(function(input) {
				input.style.display = (input.style.display == "none") ? "" : "none";
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
