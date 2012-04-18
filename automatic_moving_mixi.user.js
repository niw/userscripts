// ==UserScript==
// @name automatic moving mixi
// @include http://mixi.jp/view_diary.pl?url=*
// @include http://mixi.jp/new_friend_diary.pl*
// ==/UserScript==

!function (){
  var anchor = document.getElementsByTagName('A')
  if(document.URL.match(/view_diary.pl/)) {
    var start_external_url = document.URL.indexOf("http", 4)
    var end_external_url = document.URL.indexOf("&owner", 0)
    var external_url = unescape(document.URL.substring(start_external_url, end_external_url))
    for(var i = 0, l = anchor.length; i < l; i++) {
      if(anchor[i].href == external_url) {
        location.replace(anchor[i].href)
      }
    }
  }
}();
