$.fn.slider = function() {
    if ($(this).length > 1){
        $(this).each(function(){
            $(this).slider()
        });
        return this;
    }

    var obj = $(this);
    var btn_left = obj.find('[data-param="left"]')
    var btn_right = obj.find('[data-param="right"]')
    var scroll  = +obj.data('scroll') || 1;

    var ul = obj.find("ul"),
        obj_w = obj.width(),
        li_w = ul.find("li:first").outerWidth(true),
        li_c = ul.find("li").size();

    var $activeItem = ul.find('li:nth-child(2)').addClass('active');

    ul.css({width: li_c * li_w * 2}); //делаем ul в одну строку

    if (li_c * li_w < obj_w) {  //прячем кнопки если элементов мало
        btn_left.hide();
        btn_right.hide();
    }

    var check = true;  //проверка на многокликабельность

    btn_left.unbind("click");
    btn_left.bind("click", function() {
        if (check) {
            check = false;
            for (var i = li_c - 1; i >= (li_c - scroll); i--)
                ul.find("li").eq(i - (i - li_c + 1)).clone('true').prependTo(ul);

            ul.css({'margin-left': -(scroll * li_w)});


            ul.find('li').removeClass('active');
            ul.animate({'margin-left': 0},'slow',function() {
                for (var i = li_c - 1; i >= (li_c - scroll); i--)
                    ul.find("li:last").remove();
                $activeItem = (ul.find("li:first").next());
                $activeItem.addClass('active');
                check = true;
            });
        }
    });

    btn_right.unbind("click");

    btn_right.bind("click", function() {
        if (check) {
            check = false;
            for (var i = 0; i < scroll; i++)
                ul.find("li").eq(i).clone('true').appendTo(ul);

            ul.find('li').removeClass('active');
            ul.animate({'margin-left': -(scroll * li_w)},'slow',function() {
                for (var i = 0; i < scroll; i++)
                    ul.find("li:first").remove();
                $activeItem = (ul.find("li:first").next());
                $activeItem.addClass('active');
                ul.css({'margin-left': 0});
                check = true;
            });
        }
    });

    //отменяем выделение при двойном клике
    btn_right.attr("onmousedown", "return false");
    btn_left.attr("onmousedown", "return false");
};