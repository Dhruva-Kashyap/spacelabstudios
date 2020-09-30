var utils = {
    show : function(result, options){
        var $sender = options.sender;
        var $target = $($sender.data('target'));
        var $targetHide = $($sender.data('hide'));
        if (!$target.length)
            return false;
        $target.show();
        if ($targetHide.length)
            $targetHide.hide();
    },
    popoverShowed : function(result, options){
        initAjaxContent(result.find('.webui-popover-content'))
    },
    imageUploaded : function(result, options){
        whApp.closePopup();
        if (!result.data.preview)
            return false;
        var $imageInput = $('form input[name="image['+ (result.data.key) +']"], form input[name="'+ (result.data.key) +'"]').first();
        if (!$imageInput.length)
            return false;
        $parent = $imageInput.parents('.image-uploader-holder:first');
        $imageInput.val(result.data.value);
        if ($parent){
            $parent.find('div[data-param="'+ (result.data.key) +'"]').css('background-image', 'url('+ result.data.preview +')')
            $parent.find('img[data-param="'+ (result.data.key) +'"]').attr('src', result.data.preview);
            $parent.addClass('imageUploaded');
        }else{
            whApp.log('parent not found!')
        }
    },
    alertClosed : function(result, options){
        whApp.route(options.sender.data('action'), false, {
            hash : false
        })
    },
    findNextCommentsTextarea : function(result, options){
        if (!whApp.userId){
            return whApp.showMessage('Вы не авторизированы', 'danger');
        }

        var $comments = options.sender.closest('.form-comments:visible');
        if (!$comments.length)
            $comments = $content.find('.form-comments:visible');
        if (!$comments.length)
            $comments = $content.find('#comments');

        if (!$comments.length)
            return;

        var $textarea = $comments.find('textarea:visible');

        if ($textarea.length){
            $textarea.focus();
        }else{
            options.scroll = true;
        }

        if (options.scroll){
            $(window).scrollTop($comments.offset().top);
        }
        return $comments
    }
};


var mainmenu = {
    search : {
        toggle : function(result, options){
            $('#search').fadeToggle(function(){
                if ($(this).is(':visible')){
                    $(this).find('input').focus();
                }
            });
        },
        submit : function(result, options){
            mainmenu.search.toggle();
        }
    },
    toggle : function(result, options){
        if (!whApp.isMobile())
            return;

        var active = $menu.hasClass('active');
        if (active){
            $menu.fadeOut();
            niceScrollObj.hide();
        }else{
            $menu.fadeIn();
            niceScrollObj.show();
        }
        options.sender.toggleClass('active');
        $menu.toggleClass('active');
    },
    click : function(result, options){
        return true;
    }
};

var filter = {
    date : {
        change : function(result, options){
            //var val = options.sender.find('option[value="'+ options.sender.val() +'"]').text().trim();

            if(options.sender.data('disable')){
                return true;
            }

            var val = +options.sender.val().trim();
            var url = options.sender.data('url') + '/year/' + val;
            if (!val){
                url = options.sender.data('url');
            }
            whApp.route(url, function(result, options){
                $('#portfolio > .items').html(result.data.html);
                whApp.handleRouteHash(result, options);
                ajaxscroll.reset();
                $('#sects > .items > .item').removeClass('active').first().addClass('active')
            }, {
                params : {
                    dynamic : true
                }
            });
        }
    },
    sects : {
        click : function(result, options){
            //var val = options.sender.find('option[value="'+ options.sender.val() +'"]').text().trim();
            var url = options.sender.attr('href');
            options.sender.addClass('active').siblings().removeClass('active');
            $('#portfolio .filter-date select')
                .data('disable', true)
                .val(0)
                .trigger('change')

            whApp.route(url, function(result, options){
                $('#portfolio > .items').html(result.data.html);
                whApp.handleRouteHash(result, options);
                ajaxscroll.reset();
                $('#portfolio .filter-date select').data('disable', false)
            }, {
                params : {
                    dynamic : true
                }
            });
        }
    },
    scroll : {
        click : function(result, options){
            var $item = $('[data-type="'+ options.sender.attr('data-value') +'"]:first');
            if ($item.length){
                whApp.scrollTo($item);
            }
        }
    }
};
