var replaceObject = '<div class="rocks"><img src="/svg/stackOgold.svg" /></div>';
var replaceText = '<div class="chatbubble workbubble maudesays">Ugh. I sure wish this stack of gold was a pile of yummy rocks.<div class="chatarrow maudesays"></div></div>'

$('#replaceBtn').on('click', function(){
    replaceObject = $('.rocks').replaceWith(replaceObject);
    replaceText = $('.chatbubble').replaceWith(replaceText);
})