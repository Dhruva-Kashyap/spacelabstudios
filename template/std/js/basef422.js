var map, mapsx, maps = [], geocoder, google, googleAttached = 0, inRoute = false;
var mediaplayers = [];
var mobileWidth = 700;
var customRequiredFormFields = 1;
var testMode = 0;
var niceScrollObj = {};
var loadedVideoCount = 0;
var waitAllVideo = true;
var MediaElementEnable = true;

if (wh.isDeveloper){
    // waitAllVideo = false;
    // MediaElementEnable = true;
    // testMode = true;
  console.warn('developer');
}


var
    $wrap = $('#wrap'),
    $menu = $('#menu'),
    $pageVideo = $('#pageVideo'),
    $pageImage = $('#pageImage'),
    $content = $('#content'),
    $header = $('#wrap > header'),
    $body = $('body'),
    $backtop = $("#scrollup"),
    qa = $.grep(
        document.location.pathname.split('/'),
        function(a){return a}
    )
;

var mainVideoPlayers = [];
var volumeIsEditing = false;
var globalAudioPlayer = null;
var globalAudioOn = true;

var tempAudioPlayer = null;

History.options.debug = false;
History.Adapter.bind(window, 'statechange', function(e){
    var State = History.getState();
    if (!inRoute)
        whApp.route(State.data.href || State.cleanUrl);
});


$([
    'template/std/img/menu-bg.png'
]).preload();

$(toPreload).preload();

function closeSidebar2(){
    $sidebar2.removeClass('active');
    $body.removeClass('sidebar2-open');
    $sidebar.find('#mainmenu li.active').removeClass('active');
}


$(function(){ // document ready function


    // alert(whApp.isMobile())

    //$('.sel2').select2();

    //RevSlide.initRevolutionSlider();
    //$('.flexslider').flexslider({
    //    animation: "slide",
    //    start: function(slider) {
    //        $('body').removeClass('loading');
    //    }
    //});

    //
    //$('ul.checkboxes').on('click','li', function(){
    //    var $ul = $(this).parent();
    //    $ul.find('input[type="hidden"]').val($(this).data('value'));
    //    $(this).addClass('active').siblings().removeClass('active');
    //});



    if (0){
        var ajaxloader = $('#ajax-loader');
        if (ajaxloader.length){
            $.ajaxSetup({
                beforeSend: function(){
                    //ajaxloader.css('opacity','1').show();
                    ajaxloader.show();
                },
                complete: function() {
                    ajaxloader.hide();
                    //$('#menu-holder').removeClass('active')
                    //ajaxloader.animate({opacity:0},500,'linear',function(){$('#loader').hide()});
                }
            });
        }
    }

    $(document).on('click', 'form [type=submit]', function() {
        $("input[type=submit]", $(this).parents("form")).removeAttr("clicked");
        $(this).attr("clicked", "true");
    });

    $(document).on('submit', 'form:not(.ex, .noajax, .ex-controller)', function(e){
        e.preventDefault();
        return whApp.submitDefault($(this), e);
    });




    init();

    if (!waitAllVideo || !MediaElementEnable){
        initAjaxContent($content, {
            first : true
        });
    }


    if (whApp.options.ajax){
        $body.on('click', 'a:not(.ex, a.fancybox, a.popup, .pluso-wrap a), .pseudo-a', function(e){
            var $sender = $(this);
            var href = $sender.attr('href');
            if (!href || !href.length)
                return true;

            if (href.substr(0,1) === '#'){
                var $item = $(href);
                if ($item.length){
                    $('html, body').animate({scrollTop: $item.offset().top});
                }
                return false;
            }


            if (!whApp.isLocalLink(href) || ($sender.attr('target'))){
                return true;
            }

            var $this = $(this);
            if (e.ctrlKey || e.metaKey) return;
            e.preventDefault();
            var confirmMessage = $(this).data('confirm');
            if (!confirmMessage
                && (
                !$sender.hasClass('no-leave') &&
                !$sender.hasClass('ajax-popup') &&
                !$sender.hasClass('ajax-popover')
                )
            ){
                var $formEdit = $content.find('form[data-confirm-leave="true"], form[data-leave-warning="true"]');
                if ($formEdit.length){
                    confirmMessage = 'Вы уверены что хотите покинуть страницу? Все несохраненные данные будут потеряны!'
                }
            }
            var func;
            var params = {
                frontend :
                    $this.data('ajax-before') ?
                        whApp.handleCallback(false, $this.data('ajax-before'), {
                            sender : $this
                        }) :
                    {}
            };
            // На мобилах вместо поповера отображаем попап
            if ($(this).hasClass('ajax-popup')
                //|| ($(this).hasClass('ajax-popover') && whApp.isMobile())
                ){
                func = function(){
                    whApp.route($this.attr('href'), 'whApp.showPopup', {
                        hash : false,
                        params : params,
                        closePopup : true,
                        sender : $this
                    });
                }
            }else
            if ($(this).hasClass('ajax-popover')){
                func = function(){
                    whApp.route($this.attr('href'), 'whApp.showPopover', {
                        hash : false,
                        params : params,
                        closePopup : false,
                        sender : $this
                    });
                }
            }else{

                // Если из popup'а - то вырубаем нахуй попап и норм загружаем страницу. (уже сделано в whApp.route())
                //if (!$sender.hasClass('ajax-popup') && !$sender.hasClass('ajax-popover')){
                //    if ($sender.parents('.fancybox-inner').length){
                //        whApp.closePops();
                //    }
                //}

                func = function(){
                    whApp.route($this.attr('href'), $this.data('callback'), {
                        hash : !$this.hasClass('ajax-nohash'),
                        params : params,
                        closePopup : !!$this.data('closePopup'),
                        sender : $this
                    });
                }
            }

            if (confirmMessage){
                bootbox.confirm(confirmMessage, function(result) {
                    if (result){
                        func();
                    }
                });
            }else{
                func();
            }
        });
    }

});


function initVideo(items, initOptions){
    console.log('initVideo');
  if (!MediaElementEnable)
    return false;
  try{
      initOptions = $.extend({
        slow : false
      }, initOptions || {});

    console.log('$(items).length=' + $(items).length);

    $(items).each(function(){
        if (initOptions.slow){
          $(this).parent().hide();
        }
        var options = {
          loop : true,
          enableAutosize : true,
          pauseOtherPlayers : false,
          features : []
        };
        options = $.extend(options, $(this).data());

        if (initOptions.enableAutosize || options.enableAutosize)
        {
          options = $.extend(options, {
            videoWidth: '100%',
            videoHeight: '100%'
          });
        }
        if ($(this).attr('controls')){
          options = $.extend(options, {
            features: [
              'playpause',
              'progress',
              //'current',
              //'duration',
              //'tracks',
              //'volume',
              'fullscreen'
            ]
          })
        }

        if (initOptions['player']){
          options = $.extend(options, initOptions.player)
        }

        //if (initOptions['callback']){
        //    options.success = initOptions['callback']
        //    //whApp.handleCallback(false, initOptions['callback']);
        //}

        // mainvideo
        //var player = $(this).mediaelementplayer(options);
        var player = new MediaElementPlayer($(this), options);
        if (options.startVolume == 0){
          player.setVolume(0)
        }else if (options.startVolume){
          player.setVolume(options.startVolume)
        }else if (options.volume){
          player.setVolume(options.volume)
        }
        var $playerObj = player.$media;
        $playerObj.data('instance', player);



        $playerObj.on('canplay', function(e){
          if (initOptions['callback']){
            //options.success = initOptions['callback']
            whApp.handleCallback(false, initOptions['callback']);
          }

          if (initOptions.firstMainInit){
            ++loadedVideoCount;
            console.warn('loadedVideoCount=' + loadedVideoCount);
            console.warn('$(\'#mainvideo video\').length=' + $('#mainvideo video').length);
            if (loadedVideoCount === $('#mainvideo video').length){
                initAjaxContent($content, {
                first : true
              });
            }
          }else{
            if (initOptions.slow){
              $(this).show();
            }
          }
        })
      });
    }catch(e){
        MediaElementEnable = false
    }
}



function initSubVideo(videoId, html) {
    console.log('initSubVideo')
    if (!MediaElementEnable)
        return false;
    var $videoHolder = $pageVideo.find('.inner:first');
    if (html && html.length){
        $pageImage.fadeOut();
        $pageVideo.hide().find('.inner:first').html(html);
        $video = $videoHolder.find('video');
        initVideo($video, {
            enableAutosize : true,
            callback : function(){
                $pageVideo.fadeIn(1000);
            }
        });
        $('#wrap > .bg').show();
    }else{
        if (videoId){
            var $actualVideo = $('#mainvideo .items > .item[data-id="'+ videoId +'"] .video-holder').clone();
            $videoHolder.html($actualVideo);
            //initVideo($pageVideo.find('.inner:first'));
            $('#wrap > .bg').show();
        }
    }
}
function hideSubVideo(){
  console.warn('hideSubVideo');
    $('#wrap > .bg').hide();
    $pageVideo.find('.inner:first').html('');
}

function playSound(key, options){
    if (!MediaElementEnable){
        console.warn('not enabled');
        return false;
    }

    if (globalAudioPlayer.media.volume === 0){
        console.warn('volume=0');
        return false;
    }

    try{
      volumeIsEditing = true;
      tempAudioPlayer.pause();
      tempAudioPlayer.setSrc(globalSounds[key].sound);
      var itemVolume = globalSounds[key].volume || 1;
      var playerVolume = globalAudioPlayer.media.volume || 0.7;
      var resultVolume = playerVolume * itemVolume;
      if (resultVolume < 0.1) resultVolume = 0.1;
      // console.log('volume=' + resultVolume);
      tempAudioPlayer.setVolume(resultVolume);

      if (options && options.loop){
        tempAudioPlayer.options.loop = true;
      }else{
        tempAudioPlayer.options.loop = false;
      }
      tempAudioPlayer.play();
      volumeIsEditing = false;
    }catch(e){
      MediaElementEnable = false;
    }
}

function init(){
    if (MediaElementEnable){
        globalAudioPlayer = new MediaElementPlayer($('#globalAudioPlayer'), {
            pauseOtherPlayers : false,
            features: ['volume'],
            loop: false,
            success: function (mediaElement, domObject) {
                mediaElement.addEventListener("volumechange", function (e) {
                    if (volumeIsEditing)
                        return false;
                    $('video', $body).each(function(){
                        var initVolume = +($(this).data('volume') || 0);
                        if ($(this).data('instance')){
                            $(this).data('instance').setVolume(initVolume * mediaElement.volume);
                        }else{
                            console.log($(this), 'no instance!');
                        }
                    });
                });
            }
        });
      console.warn('globalPlayer inited');

        globalAudioPlayer.setVolume(0.7);

        tempAudioPlayer = new MediaElementPlayer($('#tempAudioPlayer'), {
            pauseOtherPlayers : false,
            loop: false,
            success: function (mediaElement, domObject) {
                $(domObject).data('instance', tempAudioPlayer)
            }
        });




      console.warn('tempPlayer inited');
        playSound('preloader', {loop : true});

        setTimeout(function(){
            initVideo($('#mainvideo video'), {
                firstMainInit : true
            });

            if ($body.hasClass('body-sub')){
                initSubVideo(null, $('#pageVideo video'));
            }
        }, wh.loadDelay);
    }




    $menu.css({
        top: -$menu.height(),
        right: -$menu.width()
    });

    $('#aBrand').mouseover(function(){
        playSound('logoHover');
    }).mouseleave(function(){
        tempAudioPlayer.pause();
    });

    if (wh.menuAnimation){
        $('#menu > .angle-hover-close').hover(function(){
            $menu.parent().removeClass('active');
            $menu.stop().animate({
                top: -$menu.height(),
                right: -$menu.width()
            }, 750, function(){
                $menu.hide();
            });
        });
        $('#menu-btn-toggle').hover(function(){
            if (!$menu.parent().hasClass('active')){
                playSound('menuShow');
            }
            $menu.show();
            $menu.parent().addClass('active');
            $menu.stop().animate({
                top: 0,
                right: 0
            }, 750, function(){
            });
        });
    }else{
        $('#menu > .angle-hover-close').hover(function(){
            $menu.parent().removeClass('active');
            $menu.hide();
        });
        $('#menu-btn-toggle').hover(function(){
            $menu.show();
            $menu.parent().addClass('active');
        });
    }


    $('#mainmenu .item, #menu #search-btn-toggle, #menu .showreel > a').hover(function(){
        playSound('menuItemHover');
    });



    if (1){
        function resizeHeaderMain(){
            if (!qa.length){
                if ($(window).height() > 500)
                    $header.height(500);
            }
        }

        function resizeMenu(){
            // 1.43669724771
            $menu.width(width = $(window).width() / 2 + 400);
            $menu.height(width / 1.43669724771);
        }

        function resize(){
            resizeHeaderMain();
            resizeMenu();
        }

        $(window).resize(function(){
            resize();
        });

        resize();
    }

    function resizeWrap(){
        $wrap.css('min-height', ($(window).height()-40) + 'px');
    }

    $(window).resize(function(){
        resizeGallerySlider();
        resizeRelativeBlocks();
        resizeContactsMap();
        resizeWrap();
    });

    resizeWrap();


    $('#brand').gifAnimateOnHover();



    $body.on('keydown', 'textarea.submit-on-ctrl-enter', function(event) {
        if (window.event) event = window.event;
        $form = $(this).parents('form:first');
        var keyCode = event.keyCode ? event.keyCode : event.which ? event.which : null;
        if (event.ctrlKey){
            if (keyCode == 13){
                //if (!$(this).val())
                //    return false;
                $form.submit();
            }
        }else if(keyCode == 27){
            window.lastClicked = $('body');
            $(this).blur();
        }
    });

    $body.on('click', '.files-picker .active > .item i.remover', function() {
        var $parent = $(this).parents('.files-picker:first');
        var $item = $(this).parents('.item:first');
        var $textarea = $parent.find('textarea');
        var val = $textarea.val();
        var active = val.split(';');
        var result = [];
        $.each(active, function(key, value){
            if (value != $item.data('file')){
                result.push(value);
            }
        });
        $textarea.val(result.join(';'));
        $item.fadeOut(function(){
            $(this).remove();
        })
    });

    $body.on('click', 'label.label_check, label.label_radio', function(){
        var $input;
        if ($(this).data('parent-relative')){
            $input = $(this).parent().find('input[type="hidden"]').first();
        }else{
            $input = $('[name="' + $(this).attr('for') + '"]').first();
        }

        $(this).toggleClass('active');

        if($(this).hasClass('label_radio')){
            $('input[name="' + $(this).attr('for') + '"]').val($(this).data('val'));
            var $siblings = $('label[data-name="'+$(this).data('name')+'"]').not($(this));
            if ($siblings.length){
                $siblings.removeClass('active');
                $siblings.each(function(){
                    $(this).parent().find('input[type="hidden"]').val(0)
                })
            }
        }
        if(!$(this).hasClass('label_radio') || $(this).data('checkbox')) {
            $input.val($(this).hasClass('active') ? 1:0).trigger('change');
        }
    });

    if (customRequiredFormFields){
        $body.on('blur', 'form textarea, form input', function(){
            $(this).popover('hide')
        });
    }

    $body.on('click', '.toggle', function(e) {
        e.preventDefault();
        var el = $(this).data('el') || $(this).attr('href');
        if (!el)
            return;
        var $that = $(this);
        var callback = $(this).data('callback');
        var parent_level    = $(this).data('parent-level');
        var parent_selector = $(this).data('parent');
        var parent          = '';
        if (parent_selector){
            if (parent_level){
                parent = $(this).parents().eq(parent_level);
            }else{
                parent = $(this).parents(parent_selector).eq(0);
            }
            if (!parent.length)
                parent = $(parent_selector).eq(0);


            if ($(this).data('siblings') && parent.length){
                parent.siblings('.open')
                    .removeClass('open')
                    .find($(this).data('siblings'))
                    .slideUp(300);
            }
        }else{
            if ($(this).data('siblings')){
                if ($(this).data('siblings') === true) {
                    $(el).siblings().slideUp().removeClass('open');
                }else{
                    $($(this).data('siblings')).not($(el)).slideUp();
                }
            }
        }
        var $el;
        if (parent_selector && parent.length){
            $el = $(el, parent).eq(0);
        }else{
            $el = $(el);
        }

        var callbackStd = function(el){
            if ($(this).is(':visible')){
                $(this).addClass('open');
                if ($that.data('hideText')){
                    $that.html($that.data('hideText'));
                }
                $(parent).addClass('open');
                $that.addClass('open').siblings().removeClass('open');
            }else{
                $(this).removeClass('open');
                if ($that.data('showText')){
                    $that.html($that.data('showText'));
                }
                $(parent).removeClass('open');
                $that.removeClass('open');
            }
        };

        switch ($(this).data('type')){
            case 'opacity' :
                if ($(this).data('show-only')){
                    $el.animate({opacity : 1}, 300, callbackStd);
                }else{
                    $el.animate({opacity : $el.is(':visible') ? 0 : 1}, 300, callbackStd);
                }
                break;
            case 'slide' :
                $el
                    //.toggleClass('open')
                    .slideToggle(300, callbackStd);
                break;
            default:
                if ($(this).data('show-only')){
                    $el
                        //.addClass('open')
                        .fadeIn(300, callbackStd);
                }else{
                    $el
                        //.toggleClass('open')
                        .fadeToggle(300, callbackStd);
                }
                break;
        }

        if (function_exists(callback)){
            setTimeout(function(){
                window[callback]();
            }, 500);
        }
    });

    $(document).keyup(function(e){
        switch (e.keyCode){
            case 8 : {
                if($.inArray(e.target.tagName, ['INPUT', 'TEXTAREA']) === -1){
                    e.preventDefault();
                    return false;
                }
            }
        }
        return true;
    });

    $($wrap).on('keyup', '[data-keyup-callback]', function(){
        if ($(this).data('value') == $(this).val())
            return;
        whApp.handleCallback($(this).val(), $(this).data('keyup-callback'), {
            sender : $(this)
        })
    });

    $body.on('change', '[data-change-callback]', function(){
        whApp.handleCallback($(this).val(), $(this).data('change-callback'), {
            sender : $(this)
        })
    });

    $body.on('keyup', '[data-change-timeout-callback]', function(){
        if ($(this).data('timeout-handler'))
            clearTimeout($(this).data('timeout-handler'));
        var $item = $(this);
        var timeout = setTimeout(function(){
            $item.data('timeout-handler', false);
            whApp.handleCallback($item.val(), $item.data('change-timeout-callback'), {
                sender : $item
            })
        }, $(this).data('change-timeout') || 1000);

        $(this).data('timeout-handler', timeout);
    });

    $($wrap).on('click', '.fade-out-on-click', function(){
        $(this).animate({'opacity' : 0});
    });

    //$wrap.find('.widget.widget-account > .inner > .top').click(function(e){
    //    if ($(e.target)[0].tagName == 'A') return;
    //    if ($(e.target).parent()[0].tagName == 'A') return;
    //    $item = $(this).parent();
    //    $item
    //        .toggleClass('active')
    //        .find('i.icon-caret')
    //            .toggleClass('fa-angle-down')
    //            .toggleClass('fa-angle-up')
    //    ;
    //    if ($item.hasClass('active')){
    //        $item.find('.menu-holder').slideDown();
    //    }else{
    //        $item.find('.menu-holder').slideUp();
    //    }
    //});

    $wrap.find('#mainmenu .item[data-system-key="search"]').click(function(e){
        e.preventDefault();
        $('html, body').animate({scrollTop: $header.height()+10});
    });


    $body
        .on('click', '.switcher', function(){
            if ($(this).data('class')){
                $(this).toggleClass($(this).data('class'))
            }
        })
        .on('click', '.just-callback, .jcb, .just-cb', function(){
            if ($(this).data('once')){
                if ($(this).data('once-done'))
                    return false;
                $(this).data('once-done', true);
            }
            return whApp.handleCallback(null, $(this).data('callback'), {
                sender : $(this)
            })
        })


        .on('keydown', 'input[data-filter="number"]', function (e) {
            // Allow: backspace, delete, tab, escape, enter and .
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                    // Allow: Ctrl+A
                (e.keyCode == 65 && e.ctrlKey === true) ||
                    // Allow: home, end, left, right
                (e.keyCode >= 35 && e.keyCode <= 39)) {
                // let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        })
    ;


    $(document).on('focus', '.popover-focus', function(){
        var popoverId = whApp.initPopover(false, {
            sender : $(this),
            class : 'styled-dark',
            trigger : 'manual',
            showNow : true,
            content : '<div class="'+ ($(this).data('class') || 'popover-focus') +'">'+ $(this).data('text') +'</div>'
        });

        $(this).blur(function(){
            whApp.closePopover($(this));
        });

        return;
        $('.popover:visible').popover('destroy');
        $(this)
            .popover({
                trigger       : 'manual',
                placement     : 'right',
                html          : true,
                content       : '<div class="'+ ($(this).data('class') || 'popover-focus') +'">'+ $(this).data('text') +'</div>',
                //'content'       : $(this).data('text')
            }).popover('toggle')
            .blur(function(){
                $(this).popover('hide')
            });
    });

    if (testMode){
        window.onerror = function(e) {
            whApp.showMessage(e, 'error')
        };
    }

    setTimeout(function(){
      initAjaxContent($content, {
        first : true
      });
    }, 3000)

}

var resizeGallerySlider = function(){};
function resizeRelativeBlocks(){
    $('.relative-height').each(function(){
        if (! +$(this).data('ratio')){
            return true;
        }
        var temp = $(this).width() / (+$(this).data('ratio'));
        var minHeight = $(this).data('min-height');
        if (minHeight && (minHeight > temp)){
            temp = minHeight;
        }
        $(this).height(temp);
    });


    $('.fill-parent').each(function(){
        if ($(this).data('parent')){
            var parentSelector = $(this).data('parent');
            $(this).height($(this).parents(parentSelector).height());
            $(this).width($(this).parents(parentSelector).width());
        }else{
            $(this).height($(this).parent().height());
            $(this).width($(this).parent().width());
        }
    })
}


var wow = new WOW(
    {
        boxClass:     'wow',      // animated element css class (default is wow)
        mobile:       false        // trigger animations on mobile devices (true is default)
    }
);


function initAjaxContent(wrap, options) {
    wrap = wrap || $content;

    options = $.extend({
        first : false
    }, options || {});


    if ((options.first === true)){
        $('#ajax-loader').fadeOut();
        if (MediaElementEnable)
            tempAudioPlayer.pause();
        $wrap.show();
        wow.init();
    }

    //$('#soundSwitcher').click(function(){
    //    $(this).toggleClass('active');
    //    globalAudioOn = $(this).hasClass('active');
    //});


    // Главная страница портфолио
    if ($body.hasClass('body-portfolio') && !$body.hasClass('body-portfolio-')){

    }


    if ($body.hasClass('body-main')){
      if (MediaElementEnable){
        console.warn('$(\'#mainvideo video\').each => play()');
        $('#mainvideo video').each(function(){
            if ($(this).data('instance')){
              $(this).data('instance').play();
            }
        })
      }
    }else{
      if (MediaElementEnable){
        $('#mainvideo video').each(function(){
          $(this).data('instance').pause();
        })
      }
    }


    $('.button', wrap).mouseover(function(){
      if (MediaElementEnable) {
        playSound('btnHover');
      }
    });

    // для showreel
    if ($body.hasClass('body-sub')){
        initVideo($('video', wrap), {
            slow : false
        });
    }

    if ($body.hasClass('body-about')){
        $('#team').teamVideo({
            interval : 5000,
            countPlaying : 2
        });
    }


    if ($body.hasClass('body-showreel')){
        if (0){
            $('body.body-showreel #wrap .wrap-after').hide();
            setTimeout(function(){
                $('.mejs-fullscreen-button', $content).click();
            }, 500);
        }else{
            $('body.body-showreel #wrap .wrap-after').show();
        }

    }
    $('body.body-showreel #wrap .wrap-after > .item-showreel').each(function(){
        $(this).click(function(){
            $(this).parents('.wrap-after:first').fadeOut(function(){

            });
            $('.mejs-fullscreen-button', $content).click();
            $('.mejs-overlay-play', $content).click();
        })
    });

    resizeGallerySlider();
    resizeRelativeBlocks();
    resizeContactsMap();

    $('.parallax', wrap).each(function(){
        $(this).parallax(
            $(this).data('xpos') || 0,
            $(this).data('factor') || 0.1,
            $(this).data('outer') || true,
            $(this).data('offset') || 0,
            $(this).data('height')
        );
    });


    //$('.animate-to-right').each(function(){
    //    $(this)
    //});


    wow.sync();



    if (MediaElementEnable){
        var $overlay = $('#header-overlay');
        var $item = $('#mainvideo').find('.items-holder .items > .item');
        var $child = $item.find('.inner');
        var aloneMode = !!$('#mainvideo.alone').length;

      console.warn('mainVideo animation init');
        $("#mainvideo .items, #mainvideo.alone .items-holder").each(function(){
            var mainVideoItemWidth = $("#mainvideo .item").width();
            var overlayWidth = $overlay.width();
            var imgWidth = $child.width();

            if (aloneMode){
              mainVideoIterate = function(e){
                mainVideoItemWidth = $overlay.width();
                $child.stop();
                var mouseoffLeftPage = $overlay.width()/2;
                diffSpace = imgWidth - mainVideoItemWidth;
                // console.warn('diffSpace: ' + diffSpace);
                if (e){
                  mouseoffLeftPage = e.pageX;
                }
                if (1){
                  // Приведение от размера overlay к требуемым размерам
                  mouseoffLeftPage /= ($overlay.width() / mainVideoItemWidth);
                }
                // console.warn('mouseoffLeftPage: ' + mouseoffLeftPage)
                // 0 сдвигаем в центр
                var verticalOffset = mouseoffLeftPage - (mainVideoItemWidth/2);
                // Максимально возможное смещение
                var maxVerticalOffset = (imgWidth - mainVideoItemWidth) / 2;

                // Пересчитываем координату относительно максимума
                verticalOffset /= (mainVideoItemWidth / maxVerticalOffset);

                var value = (-verticalOffset);
                $item.find('.video-holder').css({
                  marginLeft : value+"px",
                });
              }
            }else{
              mainVideoIterate = function(e){
                $child.stop();
                var mouseoffLeftPage = $overlay.width()/2;

                if (e){
                  mouseoffLeftPage = e.pageX;
                }
                if (1){
                  // Приведение от размера overlay к требуемым размерам
                  mouseoffLeftPage /= ($overlay.width() / mainVideoItemWidth);
                }
                // 0 сдвигаем в центр
                var verticalOffset = mouseoffLeftPage - (mainVideoItemWidth/2);
                // Максимально возможное смещение
                var maxVerticalOffset = (imgWidth - mainVideoItemWidth) / 2;
                // Пересчитываем координату относительно максимума
                verticalOffset /= mainVideoItemWidth / maxVerticalOffset;
                var value = (-verticalOffset/2);
                $item.find('.video-holder').css({
                  marginLeft : value+"px",
                });
              }
            }

            $overlay.mousemove(function(e){
                mainVideoIterate(e)
            });

            mainVideoIterate();
        });
    }


    //setTimeout(function(){
    //    $('#mainvideo > .overlay').fadeOut(500);
    //}, 750);






    var $mainMenuScroller = $('#mainMenuScroller');
    if ($mainMenuScroller.length){
        $body.scrollspy({
            target: '#mainMenuScroller',
            offset: 100
        })
    }

    $('#portfolio > .items', wrap).fadeIn();

    $('form').each(function(){
        var obj = $('.btn-file', this);
        obj.upload({
            name: 'dynamic-files[]',
            parent: $(this).parents('.form-holder:first').find('>.after-form'),
            class: 'ex noajax',
            action: $(this).attr('action'),
            enctype: 'multipart/form-data',
            params: {},
            autoSubmit: true,
            onSubmit: function(e) {
                //var $al = $(this.obj[0]).find('.ajax-loader');
                //if ($al.length){
                //    $al.show();
                //}
            },
            onComplete: function(response){
                //var $al = $(this.obj[0]).find('.ajax-loader');
                //if ($al.length){
                //    $al.hide();
                //}
                var files = isJSON(response);
                console.log(files);
                if (files){
                    console.log(files);
                    $.each(files, function(){
                        var link = '<div class="item" data-file="'+ this.filename +'"><i class="remover icon icon-close-mini"></i><a target="_blank" href="'+this.href+'">'+this.nameOld+'</a></div>';
                        $(obj).parents('.files-picker:first').find('textarea').append(this.filename+';');
                        $(obj).parents('.files-picker:first').find('.active').append(link).parent().show('slow');
                    })
                }else{
                    console.error(response);
                }
            },
            onSelect: function() {}
        });
    });


    var $gallery = $('.sslider .slider-holder', wrap);
    if ($gallery.length) {
        $gallery.each(function(){
            var $currentGallery = $(this);
            if (!$currentGallery.hasClass('count-1') && !$currentGallery.hasClass('count-2')){
                $currentGallery.slider();

                //$.slider(
                //    $currentGallery.find('.items'),
                //    $currentGallery.find('.slider .left_shadow'),
                //    $currentGallery.find('.slider .right_shadow'),
                //    1);

                resizeGallerySlider = function(){
                    var slideWidth = parseInt($('.sslider .slider > .items li').css('width') || 980);
                    var galleryMargin = parseInt(($(window).width()-slideWidth)/2);
                    $currentGallery.find('.slider').css('margin-left', -(slideWidth - galleryMargin));
                    $currentGallery.find('.left_shadow').css('width', galleryMargin);
                    $currentGallery.find('.left_shadow').css('left', slideWidth-galleryMargin);
                    $currentGallery.find('.right_shadow').css('width', galleryMargin);
                };
                resizeGallerySlider();
            }
            setTimeout(function(){
                $currentGallery.parent().find('.fader').fadeOut('slow');
            }, 1000);

        });
    }


    if (customRequiredFormFields && 1){
        var $items = $('form input[required], form textarea[required]');
        if ($items.length){
            $items.removeAttr('required').data({
                'required': true,
                'content' : 'Заполните это поле',
                'placement' : 'bottom'
                //class : 'popover-required'
            });
        }
    }

    $('[data-parselink], [data-parselinks]', wrap).parseLinks();

    temp = $(".datepicker:not(.dropdown-menu)", wrap);
    if (temp.length)
        temp.datepicker({
            format: 'dd.mm.yyyy',
            monthNames: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
            firstDay:1,
            dayNamesMin: ['вс','пн', 'вт', 'ср', 'чт', 'пт', 'суб']
        });

    wrap.find('.popover-hover').each(function(){
        whApp.initPopover(false, {
            sender : $(this),
            trigger : 'hover'
        });
        //$(this).webuiPopover($.extend({
        //
        //}, $(this).data()));
    });

    wrap.find('.lists-items-picker').each(function(){
        var block = $(this);
        setTimeout(function(){
            block.listItemsPicker();
        }, 100);
    });

    var $selects = $('select.form-control:not(.default), select.bootstrap-select:not(.default)', wrap);
    if ($selects.length){
        $selects.each(function(){
            $(this).selectpicker();
        })
    }

    // ADD SLIDEDOWN ANIMATION TO DROPDOWN //
    $('.bootstrap-select', wrap).on('show.bs.dropdown', function (e) {
        $(this).find('.dropdown-menu').first().stop(true, true).fadeIn();
    });

    // ADD SLIDEUP ANIMATION TO DROPDOWN //
    $('.bootstrap-select', wrap).on('hide.bs.dropdown', function (e) {
        $(this).find('.dropdown-menu').first().stop(true, true).fadeOut();
    });

    //wrap.find('.yandex-map-cluster').whYandexMapCluster();

    if (!whApp.isMobile()){
        wrap.find('[data-find-autofocus="true"]').find('.form-control:first').focus();
    }


    var $maps = $('.wh-map-generator', wrap);
    if ($maps.length){
        var byTypes = {
            google : [],
            yandex : [],
            '2gis'    : []
        };
        $maps.each(function(){
            byTypes[$(this).data('type') || 'google'].push(this);
        });

        $.each(byTypes, function(type, items){
            if (!items.length)
                return true;
            if (function_exists(type = 'attach_' + type + '_map')){
                window[type](items);
            }
        })
    }


    $('a.fancybox, a.popup', wrap).fancybox({
        helpers : {
            title : true
        },
        afterShow : function(){
            initAjaxContent($('.fancybox-inner'));
        },
        afterClose : function(){
            setTimeout(function(){
                $(window).trigger('resize')
            }, 250)
        }
    });


    if (ajaxscroll){
        temp = wrap.find('.items-dynamic');
        if (temp.length){
            ajaxscroll.reset();
            ajaxscroll.init(null, temp, null, window.location.href);
        }else{
            if (wrap.length){
                if (wrap[0].tagName == 'BODY')
                    ajaxscroll.setBusy(true);
            }
        }
    }



    $('.autoToggleShow', wrap).show();
    $('.autoToggleHide', wrap).hide();



    $('input[name="phone"], input.phoneMask, .phone-format', wrap).mask("+7 (000) 000-00-00", {placeholder: "+7 (000) 000-00-00"});
    $('input.timeSinglePartMask', wrap).mask("00", {
        //placeholder: "00"
    });

    $('.scrolltop-to-max', wrap).each(function(){
        $(this).scrollTop($(this)[0].scrollHeight)
    })

    var $galleryFilter = $('#gallery', wrap);
    if ($galleryFilter.length){
        $galleryFilter.isotope({
            itemSelector: '.item',
            animationOptions: {
                duration: 750,
                easing: 'linear',
                queue: false
            }
        });

        $('.gallery-container > #filters a').click(function() {
            $(this).parent().addClass('active').siblings().removeClass('active');
            var selector = $(this).attr('data-filter');
            $galleryFilter.isotope({filter: selector});
            return false;
        });
    }

    //niceScrollObj = $("html").niceScroll({styler:"fb",cursorcolor:"rgb(142, 142, 142)", cursorwidth: '10', cursorborderradius: '10px', background: '#404040', spacebarenabled:true,  cursorborder: '', zindex: '1000',
    //    scrollspeed: 30,
    //    mousescrollstep: 100,
    //    boxzoom: false
    //});

    //$(".nicescroll", wrap).each(function(){
    //    $(this).niceScroll({
    //        styler:"fb",
    //        cursorcolor:"#448ccb",
    //        cursorwidth: '8',
    //        cursorborderradius: '10px',
    //        background: 'url(/template/std/img/nicescroll-bg.png) repeat-x left center',
    //        autohidemode: false,
    //        spacebarenabled:false,
    //        cursorborder: '',
    //        railvalign : 'bottom',
    //        horizrailenabled: true
    //    });
    //});


    $('.show_on_load', wrap).animate({'opacity':1},1000);

    if (function_exists('check_login') && (temp = $('form#register', wrap)).length){
        temp.each(check_login);
    }

    var $flashItems = $('.flash', wrap);
    if ($flashItems.length){
        if (!$.fn.flash){
            $.getScript('/admin/template/js/jquery.swfobject.1-1-1.min.js', function(){
                $flashItems.each(function() {
                    $(this).flash({
                        swf: $(this).attr('src'),
                        width: $(this).data('width'),
                        height: $(this).data('height')
                    });
                });
            })
        }else{
            $flashItems.each(function() {
                $(this).flash({
                    swf: $(this).attr('src'),
                    width: $(this).data('width'),
                    height: $(this).data('height')
                });
            });
        }
    }

    if (typeof pluso !== 'undefined') {
        pluso.start();
    }

    $('.custom-video-player.autoplay', wrap).each(function(){
        that = this;
        setTimeout(function(){
            var $btn = $(that).find('.mejs-overlay-button');
            $btn.click();
        }, 1500);
    });



} // end of init ajax content
