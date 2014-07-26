window.onload = function() {
    $(".cardinfo").hover(showpop, hidepop);
    $(".cardcontent").append("<div class='pop' id='pop' style='display:none;'></div>");
}
function showpop(e) {
    var cardId = $(this).attr("data-id");
    var p = $("#pop");
    p.html(cardInfos[cardId].fx);
    p.appendTo($(this));
    var hx = this.offsetTop;
    var hy = this.offsetLeft + this.offsetWidth;
    p.css("top", hx);
    p.css("left", hy);
    p.show();
}
function hidepop(e) {
    $("#pop").hide();
}

