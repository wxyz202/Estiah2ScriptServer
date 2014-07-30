var MouseCoordinate = {
    init: function(){
        var self = this;
        self.x = self.y = 0;
        $("body").mousemove(function(e){
            self.x = e.pageX;
            self.y = e.pageY;
        });
    }
};
var Pop = {
    show: function(e) {
        var cardInfo = $(this);
        Pop.timeoutId = window.setTimeout(function(){
            var cardId = cardInfo.attr("data-id");
            var p = $("#pop");
            p.html(cardInfos[cardId].fx);
            //p.appendTo(cardInfo);
            p.css("left", MouseCoordinate.x);
            p.css("top", MouseCoordinate.y);
            p.show();
        }, 300);
    },
    hide: function(e) {
        window.clearTimeout(Pop.timeoutId);
        $("#pop").hide();
    },
};

var plusCardInCardContent = function(cardId) {
    var cardInfo = $(".cardcontent .cardinfo[data-id=\"" + cardId + "\"]");
    var chooseNum = parseInt(cardInfo.find(".choose-num").text());
    var totalNum = parseInt(cardInfo.find(".total-num").text());
    chooseNum++;
    cardInfo.find(".choose-num").text(chooseNum);
    if (chooseNum == totalNum) {
        cardInfo.addClass("e-transparent");
    }
};
var minusCardInCardContent = function(cardId) {
    var cardInfo = $(".cardcontent .cardinfo[data-id=\"" + cardId + "\"]");
    var chooseNum = parseInt(cardInfo.find(".choose-num").text());
    chooseNum--;
    cardInfo.find(".choose-num").text(chooseNum);
    cardInfo.removeClass("e-transparent");
};
var plusCardInGear = function(cardId) {
    var cardInfo = $(".cardcontent .cardinfo[data-id=\"" + cardId + "\"]");
    var gear;
    if (cardInfo.hasClass("scard")) {
        gear = $("#gear-scard");
    } else {
        gear = $("#gear-card");
    }
    var gearCardInfo = gear.find(".cardinfo[data-id=\"" + cardId + "\"]");
    if (gearCardInfo.length === 0) {
        gearCardInfo = $("#gear-cardinfo-template").clone();
        gearCardInfo.removeAttr("id");
        gearCardInfo.removeClass("e-hide");
        gearCardInfo.addClass("cardinfo");
        gearCardInfo.attr("data-id", cardId);
        gearCardInfo.find(".cardname span").text(cardInfo.find(".cardname span").text());
        ["rarity-common", "rarity-uncommon", "rarity-rare", "rarity-epic", "rarity-class"].forEach(function(cls){
            if (cardInfo.hasClass(cls)){
                gearCardInfo.addClass(cls);
            }
        });
        gearCardInfo.appendTo(gear);
        gearCardInfo.hover(Pop.show, Pop.hide);
        gearCardInfo.find(".fonticon-plus").click(function() {
            var chooseNum = parseInt(cardInfo.find(".choose-num").text());
            var totalNum = parseInt(cardInfo.find(".total-num").text());
            if (chooseNum + 1 > totalNum){
                return;
            }
            plusCardInCardContent(cardId);
            plusCardInGear(cardId);
        });
        gearCardInfo.find(".fonticon-minus").click(function() {
            var chooseNum = parseInt(cardInfo.find(".choose-num").text());
            if (chooseNum == 0){
                return;
            }
            minusCardInCardContent(cardId);
            minusCardInGear(cardId);
        });
    }
    var chooseNum = parseInt(gearCardInfo.find(".choose-num").text());
    chooseNum++;
    gearCardInfo.find(".choose-num").text(chooseNum);
};
var minusCardInGear = function(cardId) {
    var cardInfo = $(".cardcontent .cardinfo[data-id=\"" + cardId + "\"]");
    var gear;
    if (cardInfo.hasClass("scard")) {
        gear = $("#gear-scard");
    } else {
        gear = $("#gear-card");
    }
    var gearCardInfo = gear.find(".cardinfo[data-id=\"" + cardId + "\"]");
    var chooseNum = parseInt(gearCardInfo.find(".choose-num").text());
    chooseNum--;
    if (chooseNum > 0) {
        gearCardInfo.find(".choose-num").text(chooseNum);
    } else {
        gearCardInfo.remove();
    }
};

$(function() {
    MouseCoordinate.init();
    $(".cardcontent").append("<div class='pop' id='pop' style='display:none;'></div>");
    $(".cardinfo").hover(Pop.show, Pop.hide);
    $("#pop").hover(function(){
        $("#pop").show();
    }, function(){
        $("#pop").hide();
    });

    $(".cardcontent .cardinfo .fonticon-plus").click(function(){
        var cardId = $(this).parents(".cardinfo").attr("data-id");
        var chooseNum = parseInt($(".cardcontent .cardinfo[data-id=\"" + cardId + "\"] .choose-num").text());
        var totalNum = parseInt($(".cardcontent .cardinfo[data-id=\"" + cardId + "\"] .total-num").text());
        if (chooseNum + 1 > totalNum){
            return;
        }
        plusCardInCardContent(cardId);
        plusCardInGear(cardId);
    });
});
