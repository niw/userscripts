// ==UserScript==
// @name           Craigslist Filter
// @version        0.1.1
// @namespace      http://niw.at/
// @description    Filtering the reuslt of Craigslist
// @include        http://sfbay.craigslist.org/*apa*
// @include        http://sfbay.craigslist.org/*roo*
// @include        http://sfbay.craigslist.org/*sub*
// @include        http://sfbay.craigslist.org/*hhh*
// ==/UserScript==

!function() {
  "use strict"

  var
  // exclude keywords in regular expression (examples)
  EXCLUDE_TITLE_KEYWORDS     = /(sunset|ingleside|tenderloin|excelsior)/i,
  EXCLUDE_CONTENT_KEYWORDS   = /(TMS333|3333|Redstone Properties|Triniy|421-4333|301 Executive|965 Sutter|1489 Webster|1200 Ocean Avenue)/gi,
  EXCLUDE_IMAGE_KEYWORDS     = /(logo|head|image_small|Harkins_Bill|craig2|agents|members_img|equal|powered|craiglist_images|thumb|gary|sonya)/i,
  MALWARE_KEYWORDS           = /berendtproperties.com/i,
  FLAGGED                    = /this posting has been flagged for ([^\.]+)/i,
  // highlighted keywords in regular expression (examples)
  HIGHLIGHT_CONTENT_KEYWORDS = /(washer|dryer|in unit|w\/d|parking|garage)/gi,
  // range of budget
  MAX_RATE = 5000,
  MIN_RATE = 1000,

  arrayEach = function(a, f) {
    for(var i = 0, l = a.length; i < l; i++) {
      f(a[i])
    }
  },
  insertNext = function(h, a) {
    h.parentNode.insertBefore(a, h.nextSibling)
  },
  removeTag = function(a) {
    a.parentNode.removeChild(a)
  },
  getText = function(elems) {
    var ret = ""
    for(var i = 0; elems[i]; i++){
      var e = elems[i]
      if(e.nodeType === 3 || e.nodeType === 4) {
        ret += e.nodeValue
      } else if(e.nodeType !== 8) {
        ret += getText(e.childNodes)
      }
    }
    return ret
  },
  xmlHttpRequest = function(option) {
    var xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
      if(xmlhttp.readyState === 4 && option['onload']) {
        option['onload'].call(this, xmlhttp)
      }
    }
    xmlhttp.open(option['method'], option['url'], true)
    xmlhttp.send(option['data'])
    return xmlhttp
  },
  xpath = function(xpath, context) {
    var result = [],
        elements = document.evaluate(xpath, context, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
    for(var i = 0, l = elements.snapshotLength; i < l; i++) {
      result.push(elements.snapshotItem(i))
    }
    return result
  },
  strikeTag = function(e) {
    return function(s) {
      s.setAttribute("style", "color: #ccc; text-decoration: line-through;")
      e.parentNode.insertBefore(s, e)
      s.appendChild(e)
      arrayEach(xpath(".//a", e), function(a) {
        a.setAttribute("style", "color: #ccc;")
      })
      return s
    }(document.createElement("span"))
  },
  addStatusTag = function(e, html, color) {
    var colors = {
        gray: "color: #333; background: #eee; border-color: #ccc;",
        blue: "color: #27b; background: #def; border-color: #379;"
      },
      style = "font-size: 10px; margin: 0 5px; border: 1px solid;"
    return function(s) {
      s.setAttribute("style", style + (colors[color] || colors["gray"]))
      if(html) {
        s.innerHTML = html
      }
      insertNext(e, s)
      return s
    }(document.createElement("span"))
  },
  expandTag = function(anchor_tag) {
    var line_tag = anchor_tag.parentNode,
        status_tag = addStatusTag(anchor_tag, "Loading...")
    xmlHttpRequest({method: "GET", url: anchor_tag.getAttribute("href"), onload: function(http) {
      var text = http.responseText
      if(text.match(MALWARE_KEYWORDS)) {
        status_tag.innerHTML = "MALWARE"
        strikeTag(line_tag)
        return
      }
      if(m = text.match(FLAGGED)) {
        status_tag.innerHTML = m[1]
        strikeTag(line_tag)
        return
      }

      var html = document.createElement("div")
      html.innerHTML = text

      var content = getText(xpath(".//div[@id='userbody']", html)), m
      if(m = content.match(EXCLUDE_CONTENT_KEYWORDS)) {
        status_tag.innerHTML = m.join(", ")
        strikeTag(line_tag)
        return
      }
      if(m = content.match(HIGHLIGHT_CONTENT_KEYWORDS)) {
        addStatusTag(anchor_tag, m.join(", "), "blue")
      }

      var inline_tag = document.createElement("div")
      inline_tag.setAttribute("style",
        "margin-left: 50px; background: #eee; padding: 2px;" +
        "font-size: 10px; font-family: sans-serif;")

      if(xpath(".//img", html).length === 0) {
        status_tag.innerHTML = "No Images"
        inline_tag.innerHTML = content
      } else {
        var img_tags = xpath(".//img", html), added_src = {}
        arrayEach(img_tags, function(tag) {
          var parent_tag = tag.parentNode,
              href = parent_tag.getAttribute("href"),
              alt = tag.getAttribute("alt") || "",
              src = tag.getAttribute("src") || ""
          if(href && href.match(/\.(jpg|jpeg|png)$/i) && !href.match(/photobucket.com/)) {
            src = href
            tag.setAttribute("src", href)
            tag.setAttribute("onmouseover", "")
          }
          if(!added_src[src] && src.match(/.*\.jpe?g/i) && !src.match(EXCLUDE_IMAGE_KEYWORDS)) {
            tag.setAttribute("height", "120px")
            tag.setAttribute("width", "120px")
            tag.setAttribute("style", "")
            inline_tag.appendChild(tag)
            added_src[src] = true
          }
        })
        removeTag(status_tag)
      }

      if(inline_tag.childNodes.length) {
        line_tag.appendChild(inline_tag)
      }
    }})
  }

  arrayEach(xpath("./blockquote/p/a", document.body), function(anchor_tag) {
    var line_tag = anchor_tag.parentNode,
        title = getText([line_tag]),
        m = title.match(/\$([0-9]+)/),
        rate = m ? parseInt(m[1]) : 0
    if(title.match(EXCLUDE_TITLE_KEYWORDS) || rate > MAX_RATE || rate <= MIN_RATE) {
      strikeTag(line_tag)
    } else {
      expandTag(anchor_tag)
    }
  })
}();
