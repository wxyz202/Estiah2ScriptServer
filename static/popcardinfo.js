window.onload = function() {
    $(".cardinfo").hover(showpop, hidepop);
    $(".cardcontent").append("<div class=\"pop\" style=\"display:none;\"></div>");
}
function showpop(w) {
    p = $(".pop");
    p.show();
    var hx = this.offsetTop;
    var hy = this.offsetLeft + this.offsetWidth;
    p.css("top", hx);
    p.css("left", hy);
}
function hidepop(w) {
    p.hide();
}

