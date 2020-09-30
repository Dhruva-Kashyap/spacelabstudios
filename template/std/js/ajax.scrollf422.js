var ajaxscroll = {

    posts 		 : [],
    target 		 : null,
    busy 		 : false,
    count 		 : 0,
    on_page 	 : 0,
    currentPage  : 1,
    wrapperClass : null,
    action		 : null,
    dataPreloaded: null,
    preload      : false,

    render : function(obj){
        return obj;
    },

    init : function(
        posts, // html объектов
        target, // цель (jquery-объект в который добавлять контент)
        wrapperClass, // оборачивать ли каждую вставку? т.е. у нас есть .container, в который подгружается очередной контент например .items, wrapperClass позволит оборачивать вставляемые .items, структура будет такая: .container > .wrapperClass > .items
        action, // url по которому будут происходить запросы типа: url?page=N
        loadingSelector // селектор объекта загрузки, который отображается во время процесса загрузки и скрывается сразу после окончания загрузки
        ){
        if (!target)
            return;

        this.target = $(target);
        this.wrapperClass = wrapperClass;
        this.action = action;
        this.loadingSelector = loadingSelector;

        this.append(posts);

        var that = this;
        var $obj = window.scroll_obj = $(window);
        var $wrap = window.scroll_wrap = $('#wrap');

        if (whApp.isMobile() || ($(window).width() < 992)){
            that.createButton();
        }else{
            $(window).scroll(function(){
                if(that.currentPage * that.on_page > that.count){
                    return;
                }
                if ($wrap.height()-$obj.height() <= $(window).scrollTop() + 400) {
                    that.get();
                }
            });
        }

        return this;
    },

    createButton : function(){
        this.preload = true;
        var btn = $('<button></button>',{
            html 	: 'Загрузить еще',
            id      : 'btnAjaxScrollMore',
            class 	: 'btn btn-primary'
        });

        var btnHolder = $('<div></div>', {
            html 	: btn,
            style   : 'display:none;',
            class 	: 'btnAjaxScrollMoreHolder postsList page'
        }).hide();

        this.target.append(btnHolder);
        var that = this;

        that.get({
            callback : function(result, options){
                that.count 		= result.data.count;
                that.on_page 	= result.data.on_page;
                that.dataPreloaded = result.data.html;
                if (!that.dataPreloaded.length)
                    btnHolder.hide();
                else{
                    btnHolder.fadeIn('slow').click(function(){
                        that.append(that.dataPreloaded);
                        btnHolder.appendTo(that.target).fadeIn();
                        that.get({
                            after : function(result, options){
                                if (!result || !result.status)
                                    btnHolder.hide();
                            },
                            callback : function(result, options){
                                that.count 		= result.data.count;
                                that.on_page 	= result.data.on_page;
                                that.dataPreloaded = result.data.html;

                                //if (options && options.after){
                                //    whApp.handleCallback(result, options.after);
                                //}
                            }
                        });
                    });
                }
            }
        });

    },

    append : function(posts) {
        if (this.wrapperClass){
            var page = $('<div></div>',{
                html 	: posts,
                class 	: this.wrapperClass
            }).hide();
            this.target.append(page);
            page.fadeIn('slow');
        }else{
            this.target.append(posts);
        }

        if (this.scrollPosition !== undefined && this.scrollPosition !== null) {
            $(window).scrollTop(this.scrollPosition);
        }
    },

    get : function(options) {

        if (!this.target || this.busy) return;

        this.setBusy(true);
        var that = this;

        $.get(this.action, {
                page: ++this.currentPage,
                ajaxscroll : true
            },
            function(data){
                var result = isJSON(data);
                if (result){
                    if (result.status) {
                        if (options && options.callback){
                            whApp.handleCallback(result, options.callback);
                        }else{
                            that.count 		= result.data.count;
                            that.on_page 	= result.data.on_page;
                            if (options && options.after){
                                whApp.handleCallback(result, options.after);
                            }
                            that.append(result.data.html);
                        }
                    }else{ // Отменяем дальнейшые попытки загрузить очередную страницу после первой неудачи
                        that.setBusy(true);
                        $(that.loadingSelector).hide();
                        if (options && options.after){
                            whApp.handleCallback(result, options.after);
                        }
                        return;
                    }
                    that.setBusy(false);
                }else{
                    $(that.loadingSelector).hide();
                    if (options && options.after){
                        whApp.handleCallback(result, options.after);
                    }
                }
            }
        ).error(function(){});
    },

    showLoading : function(bState){
        var loading = $(this.loadingSelector);
        if (!loading.length)
            return false;

        if (bState) {
            $(this.target).append(loading);
            loading.show('slow');
        } else {
            loading.hide();
        }
    },

    setBusy : function(bState){
        this.showLoading(this.busy = bState);
    },

    clear : function(){
        this.setBusy(false);
        this.currentPage = 1;
    },

    setAction : function(action){
        this.action = action;
    },

    reset : function(){
        this.currentPage = 1;
        this.action = window.location.href;
        this.count = this.on_page;
        this.setBusy(false);
    }

};