// ==UserScript==
// @name           Onpuchan Reveal Abbreviated Comments
// @namespace      http://niw.at/
// @description    Reveal abbreviated comments on Onpuchan BBS
// @include        http://rail-uploader.khz-net.com/*
// ==/UserScript==

(function() {
try {
	function arrayEach(a, f) {
		for(var i = 0; i < a.length; i++) {
			f(a[i], i);
		}
	}
	function arrayMap(a, f) {
		var res = [];
		for(var i = 0; i < a.length; i++) {
			res[i] = f(a[i], i);
		}
		return res;
	}
	function arrayCompact(a) {
		var res = [];
		for(var i = 0; i < a.length; i++) {
			if(a[i]) {
				res.push(a[i])
			}
		}
		return res;
	}
	function insertNext(h, a) {
		h.parentNode.insertBefore(a, h.nextSibling);
	}
	function insertBefore(h, a) {
		h.parentNode.insertBefore(a, h);
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

	function onpuchanTopics(context) {
		var anchors = xpath(".//input[@value='削除']/ancestor::form[position()=1]/a[text()='返信']/preceding-sibling::a[child::input[@name='delete[]']][position()=1]", context)
		var topics = arrayMap(anchors, function(anchor, index) {
			var item = anchor, elements = [];
			while(item && item != anchors[index + 1]) {
				if(item.tagName && item.tagName.toLowerCase() == "hr") {
					break;
				}
				elements.push(item);
				item = item.nextSibling;
			}
			var tag = document.createElement("div");
			insertBefore(anchor, tag);
			arrayEach(elements, function(a) {
				var i = xpath(".//input[@value='削除']", a)[0];
				while(i) {
					if(i.tagName && i.tagName.toLowerCase() == "hr") {
						break;
					}
					var sibling = i.previousSibling;
					insertNext(tag, i);
					i = sibling;
				}
				a.parentNode.removeChild(a);
				tag.appendChild(a);
			});
			return tag;
		});
		return topics;
	}
	arrayEach(onpuchanTopics(document), function(topic) {
		var reply = xpath(".//a[contains(text(), '返信')]", topic)[0];
		var abbreviate = xpath(".//*[contains(text(), '省略')]", topic)[0];
		if(reply && abbreviate) {
			var href = reply.getAttribute("href");
			var anchor = document.createElement("a");
			anchor.setAttribute("style", "cursor: hand; font-size: 10px; color: #fff; padding: 4px; border: 1px solid #00f; background: #36c;");
			var onClick = function() {
				anchor.removeEventListener("click", onClick, false);
				anchor.innerHTML = "読み込み中...";
				xmlHttpRequest({method: "GET", url: href, onload: function(http) {
					var html = document.createElement("div");
					html.innerHTML = http.responseText;
					arrayEach(onpuchanTopics(html), function(t) {
						insertNext(topic, t);
					});
					topic.parentNode.removeChild(topic);
				}});
			}
			anchor.addEventListener("click", onClick, false);
			anchor.innerHTML = "全部表示";
			insertNext(abbreviate, anchor);
		}
	});
} catch(exception) {
	var tag = document.createElement("div");
	tag.setAttribute("style", "padding: 4px; font-size: 10px; color: #fff; border: 1px solid #f00; background: #c00;");
	tag.appendChild(document.createTextNode(exception));
	document.body.insertBefore(tag, document.body.firstChild);
}
})();
