window.onload = function() {
    $(".cardinfo").hover(Pop.show, Pop.hide);
    $(".cardcontent").append("<div class='pop' id='pop' style='display:none;'></div>");
}
var Pop = {
    show: function(e) {
        var cardId = $(this).attr("data-id");
        var p = $("#pop");
        p.html(cardInfos[cardId].fx);
        p.appendTo($(this));
        var hx = e.clientX;//this.offsetTop;
        var hy = e.clientY;//this.offsetLeft + this.offsetWidth;
        p.css("left", hx);
        p.css("top", hy);
        Pop.timeoutId = window.setTimeout(function(){
            p.show();
        }, 500);
    },
    hide: function(e) {
        window.clearTimeout(Pop.timeoutId);
        $("#pop").hide();
    },
};
