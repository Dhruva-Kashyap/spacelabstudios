var whApp = {

    options : {
        ajax : true,
        session_id : 0
    },

    isMobile : function(){
        return $body.hasClass('body-mobile');
    },

    log : function(data){
        if (!data) return;
        if (typeof(data) == 'string'){
            data = {
                text : data
            }
        }
        return this.showMessage(data.text, data.type, data.options);
    },

    getFunctionFromString : function(string) {
        var scope = window;
        var scopeSplit = string.split('.');
        for (i = 0; i < scopeSplit.length - 1; i++){
            scope = scope[scopeSplit[i]];

            if (scope == undefined) return;
        }
        return scope[scopeSplit[scopeSplit.length - 1]];
    },

    initWysiwyg : function ($item){
        if (!$item.length)
            return;

        $item.editable({
            //alwaysVisible: true,
            disableRightClick: true,
            language: 'ru',
            buttons: [
                'bold',
                'italic',
                'underline',
                'strikeThrough',
                'fontSize',
                'formatBlock',
                'align',

                'insertOrderedList',
                'insertUnorderedList',
                'outdent',
                'indent',
                'color',
                'createLink',

                //'subscript',
                //'superscript',
                //'fontFamily',
                //'blockStyle',
                //'inlineStyle',
                //'selectAll',
                'insertImage',
                'undo',
                'redo',
                //'insertVideo',
                //'table',
                //'html',
                //'save',
                //'insertHorizontalRule',
                //'uploadFile',
                //'removeFormat',
                //'fullscreen',
            ]
            //toolbarExternal: true
        });
    },

    replacePageContent : function (result, options) {
        var html = (result.data.header ? '<div class="container"><div class="header-sect"><h1>'+ result.data.header +'</h1></div></div>' : '') + result.data.html;
        if (result.data.style){
            if (result.data.style.body && result.data.style.body.class){
                $body.attr('class', result.data.style.body.class);
            }
        }
        if (result.data.meta){
            $('meta[name="description"]').attr('content', result.data.meta.description);
            $('meta[name="keywords"]').attr('content', result.data.meta.keywords);
        }
        if (result.data.og){
            $('meta[property="og:title"]').attr('content', result.data.og.title || (result.data.meta ? result.data.meta.title : ''));
            $('meta[property="og:image"]').attr('content', result.data.og.image || '');
            $('meta[property="og:description"]').attr('content', result.data.og.desc || (result.data.meta ? result.data.meta.description : ''));
        }
        $('meta[property="og:url"]').attr('content', result.data.finalUrl);

        //if (result.data.pageImage && result.data.pageImage.length){
        //    $('#wrap > .bg > .image').css('background-image', 'url("' + result.data.pageImage + '")');
        //}else{
        //    $('#wrap > .bg > .image').css('background-image', 'none');
        //}


        if (0){
            if (result.data.pageVideoId && result.data.pageVideoId.length){
                initSubVideo(result.data.pageVideoId);
            }else{
                hideSubVideo();
            }
        }else{
            if (result.data.pageVideo && result.data.pageVideo.length){
                initSubVideo(null, result.data.pageVideo)
            }else{
                $pageVideo.hide().parent().hide();
                try{
                  $pageVideo.find('video').each(function(){
                    $(this).data('instance').pause();
                  });
                }catch(e){

                }

                if (result.data.pageImage){
                    $pageImage.find('.image').css('background-image', 'url('+ result.data.pageImage +')');
                    $pageImage.parent().show();
                    $pageImage.fadeIn()
                }
            }
        }




        if (result.data.breads){
            $('#breads-holder').html(result.data.breads).slideDown();
        }else{
            $('#breads-holder').slideUp();
        }

        if (result.data.widgets){
            $.each(result.data.widgets, function(place, items){
                if (!items) return true;
                $('#sidebar-' + place).html(items.join(''));
            })
        }
        $body.find('>[class^="froala-"]').remove();

        if (html){
            html = '<div class="content-inner" style="">'+ html +'</div>';
            $content.html(html);
            if (options.callback){
                whApp.handleCallback(false, options.callback);
            }
            if (location.hash){
                var $itemToScroll = $(location.hash);
                if ($itemToScroll.length){
                    options.scrollTop = $itemToScroll.offset().top;
                }
            }
            //else
            {
                if (!options || (options.scrollTop !== false)){
                    //if (location.pathname == '/')
                    {
                        options.scrollTop = 0;
                    }

                    $('html, body').animate({scrollTop:
                        options.scrollTop == 0 ?
                            options.scrollTop :
                            (options.scrollTop || $header.height()+1)
                    });
                }
            }
        }
        $body.find('.webui-popover').remove();
        //responsiveView();
    },

    showPopup : function(result, options){
        if (!result.data.html){
            if (result.data.log){
                whApp.log(result.data.log)
            }
            if (result.data.message){
                whApp.showMessage(result.data.message.text, result.data.message.type, result.data.message.options)
            }
            return;
        }
        $.fancybox.open({
            type: 'ajax',
            content: result.data.html,
            afterClose : function(){
                $(window).trigger('resize')
            }
        }, {
            minWidth	: 1000,
            maxWidth	: 1000
        });
        initAjaxContent($('.fancybox-inner'));

        var $textarea = $('.fancybox-inner').find('form textarea.form-control:first');
        $textarea.focus()
        if ($textarea.length){
            var val = $textarea.val();
            if (val.length){
                $textarea.val('').val(val);
            }
        }
    },

    showPopover : function(result, options){
        if (!result.data.html){
            if (result.data.log){
                whApp.log(result.data.log)
            }
            if (result.data.message){
                whApp.showMessage(result.data.message.text, result.data.message.type, result.data.message.options)
            }
            return;
        }
        var $sender = options.sender;

        //$sender.addClass('popover-showed');
        var popoverClass = 'popover-' + uniqId();
        var popoverOptions = $.extend({
            placement: 'bottom',
            content: result.data.html,
            animation: 'pop',
            cache: false,
            trigger: 'click',
            type: 'html',
            style: popoverClass + ' ' + $sender.data('class'),
            //callback: function($target){
            //    initAjaxContent($target.find('.webui-popover-content'));
            //}
        }, $sender.data());

        //__(popoverOptions.placement)

        if ((whApp.isMobile() || $(window).width() <= 991)
            //&& !$sender.data('placement')
        ){
            popoverOptions.placement = 'auto';
        }

        var popover = $sender
            .webuiPopover('destroy')
            .webuiPopover(popoverOptions)
            .webuiPopover('show')
            .webuiPopover('getContent');

        //initAjaxContent($('.webui-popover-' + popoverClass));
    },

    initPopover : function(result, options){
        var $sender = options.sender;
        //$sender.addClass('popover-showed');
        var popoverClass = 'popover-' + uniqId();
        var popoverOptions = $.extend({
            placement: 'bottom',
            content: result ? result.data.html : (options.content),
            animation: 'pop',
            cache: false,
            trigger: options.trigger || 'click',
            type: 'html',
            style: popoverClass + ' ' + ($sender.data('class') || options.class),
            //callback: function($target){
            //    initAjaxContent($target.find('.webui-popover-content'));
            //}
        }, $sender.data());

        var popover = $sender
            .webuiPopover(popoverOptions);

        if (options.showNow){
            setTimeout(function(){
                $sender.webuiPopover('show');
                var $popoverInner = $('.webui-popover-' + popoverClass);
                if (options.initContent){
                    initAjaxContent($popoverInner);
                }
                if (options.initCallback){
                    whApp.handleCallback($popoverInner, options.initCallback, options);
                }
            }, 100);
        }else{
            var $popoverInner = $('.webui-popover-' + popoverClass);
            if (options.initContent){
                initAjaxContent($popoverInner);
                if (options.initCallback){
                    whApp.handleCallback($popoverInner, options.initCallback, options);
                }
            }
        }


        return $popoverInner;
    },


    // ajax-loader image handler (show/hide)
    loading : function($item){
        if (!$item.length || $item.hasClass('not-loadable'))
            return false;

        switch($item[0].tagName){
            case 'INPUT':
                if ($item.attr('disabled'))
                    $item.removeAttr('disabled');
                else
                    $item.attr('disabled', 'disabled');
                break;
            case 'FORM':
            case 'DIV':
                if ($item.hasClass('loading'))
                    $item.find('#facebookG').remove();
                else
                    $item.append('<div id="facebookG" class="ajax-animation"><div id="blockG_1" class="facebook_blockG"></div><div id="blockG_2" class="facebook_blockG"></div><div id="blockG_3" class="facebook_blockG"></div></div>');
                break;
            case 'A':
                if ($item.hasClass('loadable-children')){
                    var $childs = $item.children('.loadable-child');
                    if ($item.hasClass('loading')){
                        $childs.button('reset');
                    }else{
                        $childs.button('loading');
                    }
                    $item.toggleClass('loading');
                    return;
                }else{
                    if (!$item.hasClass('btn') && !$item.hasClass('loadable'))
                        return;
                }
            default:
                if ($item.hasClass('loading'))
                    $item.button('reset');
                else
                    $item.button('loading')
                break;
        }
        $item.toggleClass('loading');
    },

    closePopup : function(that){
        $('.fancybox-close').click();
    },

    closePopover : function(that){
        $(that || 'a.ajax-popover.popover-showed').webuiPopover('destroy');
    },

    // closes all popovers and popups
    closePops : function(that){
        $('.fancybox-close').click();
        $('a.ajax-popover.popover-showed').webuiPopover('destroy');
    },

    handleRouteHash : function(result, options){
        if((BrowserDetect.browser == 'Explorer' && (BrowserDetect.version <= 9)))
            return false;

        if (options.hash === false)
            return false;

        var href = options.href;

        if (result.data.finalUrl){
            // finalUrl берется с сервера, поэтому HASH приходиться дописывать
            href = result.data.finalUrl;
            if ((temp = options.href.indexOf('#')) !== -1){
                href += options.href.substring(temp);
            }
        }else{
            if (options.xhr){
                // Работает только в хроме, пусть на всякий случай будет
                if (temp = options.xhr.getResponseHeader('TM-finalURLdhdg')){
                    href = temp;
                }
            }
        }

        if (options.type && (options.type.toLowerCase() == 'get' && options.params)){
            srchref = rgp(href);
            var params = $.extend(get_params(decodeURIComponent(href), true), options.params);
            if (params){
                href = srchref + '?' + $.param(params);
            }
        }
        inRoute = true;
        History.pushState({href: href}, result.data.meta ? result.data.meta.title : false, href);
        inRoute = false;
    },

    routeDefaultCallback : function(result, options){
        result.data = result.data || {};
        var $fancyboxInner;
        var $sender = options.sender || $();

        if ($sender.length){
            $fancyboxInner = $sender.parents('.fancybox-inner');
        }else{
            $fancyboxInner = $('.fancybox-inner:visible');
        }
        if (0 && $fancyboxInner.length && (options.closePopup !== true)){
            $fancyboxInner.html(result.data.html);
            initAjaxContent($fancyboxInner);
        }else{

            whApp.handleRouteHash(result, options);
            $('.fancybox-close').click();
            //if (options.sender && options.sender.hasClass('toSticky') && result.data.scrollTop){
            //    var $stickyParent = $(options.sender).parents('.sticky').first();
            //    if ($stickyParent.length){
            //        result.data.scrollTop = $stickyParent.offset().top;
            //    }
            //}
            if (result.data.html){
                whApp.replacePageContent(result, {
                    scrollTop: result.data.scrollTop || options.scrollTop,
                    callback: function(){
                        initAjaxContent()
                    }
                });
            }
            //var hash = href.split('#')[1];
            //if (hash) hash = '#'+hash;
            //var temp = $('.nav-tabs a[data-toggle="tab"][href="'+hash+'"]');
            //if (hash && temp.length){
            //    temp.click();
            //}
        }
    },


    get : function(href, callback, options) {
        return whApp.route(href, callback, $.extend({
            hash : false
        }, options));
    },

    // default route handler
    route : function(href, callback, options){
        options = options || {};
        var params = {
            route : true,
            session_id : whApp.options.session_id
        };
        if (options.params){
            params = $.extend(params, options.params);
        }
        options = $.extend({
            href: href
        }, options);

        if (options.sender && (options.freezeSender !== false))
            whApp.loading(options.sender);

        $.ajax({
            type: options.type || 'post',
            url: href,
            data: params,
            success: function(r, _options, _xhr){
                options.xhr = _xhr;
                if (options.sender && (options.freezeSender !== false)){
                    whApp.loading(options.sender);
                }
                whApp.handleAjaxResult(r, function(result, options){
                    if (callback){
                        if (!whApp.handleCallback(result, callback, options))
                            return false;
                    }
                    whApp.routeDefaultCallback(result, options)
                }, options)
            },
            error: function(data){
                if (options.sender){
                    options.sender.button('reset');
                    //options.sender.removeAttr('disabled').removeClass('loading');
                }
                console.error(data);
                whApp.showMessage(data, 'danger');
            }
        });
    },

    // primary ajax-result handler
    handleAjaxResult : function(r, callback, options){
        var result = isJSON(r);
        result.data = result.data || {};
        if (result){
            if (result.status){
                if (result.data && result.data.errors){
                    $.each(result.data.errors, function(k, v){
                        whApp.showMessage(v, 'danger');
                    })
                }
                if (result.data && result.data.redirect){
                    return whApp.route(result.data.redirect);
                }
                return whApp.handleCallback(result, callback, options);
            }else if(result.data && result.data.reload){
                window.location.reload(result.data.reload);
                return false;
            }
        }
        whApp.showMessage(r, 'danger');
        console.error(r);
        return false;
    },


    // default form submit (for forms2 module)
    std_form_submit : function(result, options){
        if (result){
            var obj = options.sender;
            if (result.status == 'error'){
                $('.form-group').removeClass('error')
                    .find('.form-control').removeClass('error');

                if (result.data){
                    $.each(result.data, function(k, v){
                        $('[name="'+k+'"]', obj).parents('.form-group').addClass('error')
                            .find('.form-control').addClass('error');
                    });
                }
            }else{
                $('[name]', obj).removeClass('error');
                var $obj = $(result.data.el, result.data.attr);
                obj.slideUp();

                if (result.data.autoCloseModalForm){
                    setTimeout(function(){
                        $('.fancybox-close').click();
                    }, 3000);
                }

                obj.parent()
                    //.css('height',obj.parent().height())
                    .append($obj);
                if(obj.data('metrika')){
                    eval(obj.data('metrika'));
                }
            }
        }else{
            whApp.showMessage(data, 'danger');
            whApp.log(data);
        }
    },




    // displays message on screen
    showMessage : function(message, type, options){
        if (typeof message != 'string')
            message = false;
        type = type || 'info';

        if (type == 'error')
            type = 'danger';

        options = $.extend({
            type: type || 'info',
            align: 'right',
            offset: {from: 'bottom', amount: 20}, // 'top', or 'bottom'
            width: 'auto',
            delay: 4000,
            stackup_spacing: 10,
            allow_dismiss: true
        }, options);

        switch (type){
            case 'success':
                message = message || 'Операция успешно выполнена';
                break;
            case 'danger':
            case 'error':
                message = message || 'Произошла ошибка';
                break;
            default:
                break;
        }
        $.bootstrapGrowl(message, options);
    },

    // get instance of function from everything (function, string, object, etc...)
    getCallback : function(callback, options){
        if (typeof callback == 'function')
            return callback;

        if (function_exists(callback)){
            return window[callback];
        }

        var func = null;
        if (callback &&
            (typeof callback == 'string') &&
            (callback.indexOf('.') > 0) &&
            (func = whApp.getFunctionFromString(callback))
        ){
            return func;
        }

        if (options && options.silent)
            return false;
        return console.error('callback doesnt exists!', callback);
    },

    handleCallback : function(result, callback, options){
        options = options || {};
        var $sender = options.sender;

        callback = whApp.getCallback(callback);
        if (callback){
            return callback(result, options);
        }else{
            if (options.submit){
                whApp.showMessage(null, 'success');
            }
            //console.log('default callback');
        }
        return false;
    },

    isLocalLink : function(link){
        link = link.replace(location.origin, '');
        return (link.substr(0,1) === '/');
    },


    // default form submit handler
    submitDefault : function($form, e){
        var formData = $form.data();
        var formOffsetTop = $form.offset().top;
        var $sender = $form.find('.form-control:focus');
        var $btn = $form.find('[type="submit"]');
        var $fancyboxInner = $form.parents('.fancybox-inner');
        var params = {};


        if (customRequiredFormFields){
            var errors = 0;
            $('input, textarea', $form).each(function(k,v){
                if (!$(this).val() && $(this).data('required')){
                    var $tempItem = $(this);
                    $tempItem.stop().animate({
                        backgroundColor: '#c8001a'
                    }, 1000, 'linear', function(){
                        setTimeout(function(){
                            $tempItem.stop().css({
                                backgroundColor: 'initial'
                            });
                        }, 1000);
                    });

                    var temp = $(this).focus().popover({
                        trigger:'manual',
                        template: '<div class="popover required-popover" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>'
                    });
                    setTimeout(function(){
                        temp.popover('show');
                    }, 500);
                    ++errors;
                    return false;
                }
            });
            if (errors)
                return false;
        }




        whApp.loading($btn);
        whApp.loading($form);

        cancelSelection();

        if (formData.ajaxBefore){
            params = {
                frontend : whApp.handleCallback(false, formData.ajaxBefore, {
                    sender : $form
                })
            };
        }

        var $submiter = $("[type=submit][clicked=true]", $form);

        if ($submiter.length){
            if ($submiter.attr('name') && $submiter.attr('value')){
                params[$submiter.attr('name')] = $submiter.attr('value');
            }
        }

        $form.ajaxSubmit({
            data : params,
            beforeSend: function() {
            },
            complete: function(xhr) {
            },
            uploadProgress: function(event, position, total, percentComplete) {
            },
            success : function(result){
                if (formData.callback2){
                    whApp.handleCallback(isJSON(result), formData.callback2, {sender : $form});
                }
                whApp.handleAjaxResult(result, formData.callback || function(result, options){
                    options.data = options.data || {};
                    if (!result.data.html || (result.data.html == undefined)){
                        return whApp.route(location.href);
                    }

                    if (formData.showSuccess !== false){
                        whApp.showMessage(null, 'success');
                    }
                    if (formData.hash){
                        whApp.handleRouteHash({
                            data : {}
                        }, {
                            href : $form.attr('action') + '&' + $form.serialize()
                        })
                    }
                    if (formData.closePopover !== undefined && formData.closePopover) {
                        whApp.closePopover();
                    }
                    if ($fancyboxInner.length){
                        if (formData.closePopup !== undefined && formData.closePopup){
                            $('.fancybox-close').click();
                            whApp.replacePageContent(result, {
                                scrollTop: options.data.scrollTop ? formOffsetTop : false,
                                callback: initAjaxContent
                            });
                        }else{
                            $fancyboxInner.html(result);
                            initAjaxContent($fancyboxInner);
                        }
                    }else{
                        //whApp.handleRouteHash(result, options);
                        whApp.replacePageContent(result, {
                            scrollTop: options.data.scrollTop ? formOffsetTop :
                                (options.data.scrollTop === undefined) ? true : options.data.scrollTop,
                            callback: initAjaxContent
                        });
                    }
                    $sender.focus();
                }, {
                    sender: $form,
                    submit : true
                });
                whApp.loading($btn);
                whApp.loading($form);
            },
            error: function(result){
                whApp.loading($btn);
                whApp.loading($form)
                whApp.showMessage(false, 'error');
                whApp.log(result);
            }
        });
        return false;
    },

    scrollTo : function($item, options){
        options = $.extend({
            duration : 500,
            scrollTop : $item.offset().top + ((options ? options.addOffset : 0) || 0)
        }, options);
        $('html, body').animate({
            scrollTop: options.scrollTop
        }, options.duration);
    },

};