// ==UserScript==
// @name           Two Column Mixi
// @namespace      http://niw.at/
// @description    Remove ad and 3rd column from mixi
// @include        http://mixi.jp/*
// ==/UserScript==

(function() {
try {
	function array_each(a, f) {
		for(var i = 0; i < a.length; i++) {
			f(a[i]);
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

	array_each(xpath("//*[(name() = 'div') and ((@id = 'bodySub') or (@class = 'adBanner'))]", document), function(element) {
		element.style.opacity = '0.15';
	});
} catch(exception) {
	var tag = document.createElement("div");
	tag.setAttribute("style", "padding: 4px; font-size: 10px; color: #fff; border: 1px solid #f00; background: #c00;");
	tag.appendChild(document.createTextNode(exception));
	document.body.insertBefore(tag, document.body.firstChild);
}
})();
