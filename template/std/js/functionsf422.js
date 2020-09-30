/**
 * Created by Sergey on 23.09.2014.
 */

wh = window.wh || {options:{}}

$.fn.preload = function() {
    this.each(function(){
        $('<img/>')[0].src = this;
    });
};
//$.fn.animateCss = function (animation, callback) {
//    $(this).addClass('animated ' + animation);
//    var $that = $(this);
//    window.setTimeout(function(){
//        if (function_exists(callback))
//            callback($that);
//        $that.removeClass(animation)
//    }, 1300);
//    return $that;
//}
$.fn.serializeObject = function(){
    var paramObj = {};
    $.each($(this).serializeArray(), function(_, kv) {
        paramObj[kv.name] = kv.value;
    });
    return paramObj;
};

$.fn.listItemsPicker = function() {
    if ($(this).length > 1){
        $(this).each(function(){
            $(this).listItemsPicker()
        });
        return this;
    }

    var $popover = $(this).parents('.webui-popover');
    if ($popover.length){
        var $btn = $('.ajax-popover[data-target="'+ $popover.attr('id') +'"]');
        var $btnInput = $btn.find('input[name="'+$(this).data('id')+'"]');
        if ($btnInput.length){
            var values = $btnInput.val().split(',');
            if (values){
                var that = $(this);
                $.each(values, function(){
                    that.find('li[data-id="'+this+'"]').addClass('active')
                })
            }
        }
    }

    var multi = $(this).data('multi');

    $(this).find('li [data-param="trigger"]').click(function(){
        cancelSelection();
        var $item = $(this).parents('li:first');
        var $parent = $(this).parents('.lists-items-picker:first');
        var values = [];
        var valuesTitles = [];
        if (multi){
            $item.toggleClass('active');
            $parent.find('li.active').each(function(){
                values.push($(this).data('id'));
                valuesTitles.push({
                    id : $(this).data('id'),
                    html : $(this).find('[data-param="content"]').html()
                });
            });
        }else{
            $parent.find('li.active').not($item).removeClass('active');
            $item.addClass('active');
            values.push($item.data('id'));
            valuesTitles.push({
                id : $item.data('id'),
                html : $item.find('[data-param="content"]').html()
            });
        }
        $parent.find('input[name="'+ $parent.data('id') +'"]').val(values.join(','));

        var $popover = $parent.parents('.webui-popover');
        if ($popover.length){
            var $btn = $('.ajax-popover[data-target="'+ $popover.attr('id') +'"]');
            $btn.find('input[name="'+ $parent.data('id') +'"]').val(values.join(','));
            if (!valuesTitles.length){
                $btn.find('.items').html('');
                $btn.addClass('empty');
                return;
            }
            var html = '';
            $.each(valuesTitles, function(){
                 html += '<div class="item item-'+ this.id +'">'+ this.html +'</div>';
            });
            $btn.find('.items').html(html);
            $btn.removeClass('empty');
        }

        if (multi){

        }else{
            whApp.closePopover();
        }
    });

    return this;
};

$.fn.whYandexMapCluster = function(){
    if (!$(this).length)
        return false;

    var mapOptions = $.extend({
        div : $(this),
        defaultCenterCoords: [45.2560592, 39.0539488],
        defaultZoom: 11
    }, $(this).data());

    if (mapOptions.defaultCenterCoords && (typeof(mapOptions.defaultCenterCoords) == 'string'))
        mapOptions.defaultCenterCoords = mapOptions.defaultCenterCoords.split(',').map(function(v){return $.trim(v)});

    attach_yandex_map(function(){
        var myMap = new ymaps.Map(mapOptions.div[0], {center: mapOptions.defaultCenterCoords, zoom: mapOptions.defaultZoom});

        myMap.controls.add("zoomControl")
            .add("typeSelector")
            .add("mapTools");

        myGeoObjects = [];

        whApp.get(mapOptions.uri, function(result, options){
            if (!result.data){
                whApp.log('Нет объектов!');
                return;
            }
            var item = null;
            $.each(result.data, function(){
                item = this;
                if (!item.location)
                    return true;
                myPlacemark = new ymaps.Placemark([item.location.lat, item.location.lng], {
                    balloonContentHeader: item.name,
                    //balloonContentBody: '<strong>Адрес:</strong> '+item.address
                    balloonContentBody: item.balloon
                }, {
                    iconLayout: 'default#image',
                    iconImageHref  : '/template/std/img/icons/map-marker.png',
                    iconImageSize: [56, 93]
                    //iconImageOffset: [-3, -42]
                });
                myGeoObjects.push(myPlacemark);
            });

            var clusterIcons=[{
                    href:'http://gmaps-utility-library.googlecode.com/svn/trunk/markerclusterer/images/m1.png',
                    size:[53,52],
                    offset:[0,0]
                }],
                clusterNumbers=[100],
                clusterer = new ymaps.Clusterer({
                    margin:[20],
                    clusterIcons:clusterIcons,
                    clusterDisableClickZoom: true,
                    clusterNumbers:clusterNumbers
                });

            clusterer.add(myGeoObjects);
            myMap.geoObjects.add(clusterer);
            myMap.setBounds(clusterer.getBounds())
        });
    })




};


String.prototype.toInt = function(){
    return this
        .replace(' ','')
        .match(/\d+/)
}

BrowserDetect =
{
    init: function ()
    {
        this.browser = this.searchString(this.dataBrowser) || "Other";
        this.version = this.searchVersion(navigator.userAgent) ||       this.searchVersion(navigator.appVersion) || "Unknown";
    },

    searchString: function (data)
    {
        for (var i=0 ; i < data.length ; i++)
        {
            var dataString = data[i].string;
            this.versionSearchString = data[i].subString;

            if (dataString.indexOf(data[i].subString) != -1)
            {
                return data[i].identity;
            }
        }
    },

    searchVersion: function (dataString)
    {
        var index = dataString.indexOf(this.versionSearchString);
        if (index == -1) return;
        return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
    },

    dataBrowser:
        [
            { string: navigator.userAgent, subString: "Chrome",  identity: "Chrome" },
            { string: navigator.userAgent, subString: "MSIE",    identity: "Explorer" },
            { string: navigator.userAgent, subString: "Firefox", identity: "Firefox" },
            { string: navigator.userAgent, subString: "Safari",  identity: "Safari" },
            { string: navigator.userAgent, subString: "Opera",   identity: "Opera" }
        ]

};


function number_format(number, decimals, dec_point, thousands_sep) {
    number = (number + '')
        .replace(/[^0-9+\-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function(n, prec) {
            var k = Math.pow(10, prec);
            return '' + (Math.round(n * k) / k)
                .toFixed(prec);
        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
        .split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '')
            .length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1)
            .join('0');
    }
    return s.join(dec);
}


String.prototype.toPrice = function(){
    var number = this;
    if (wh.options.valute)
        number = number / wh.options.valute.course;
    number = String(number).replace(' ','').match(/\d+/);
    return number ? number_format(number, 0, '', ' ') : 0;
}

function isJSON(str) {
    var result = '';
    try {
        result = JSON.parse(str);
    } catch (e) {
        return false;
    }
    return result;
}

function toggle(el){
    $(el).slideToggle(100);
}

function get_info($this) {
    var $parent = $this.parent();
    var $info = $parent.find('.help-inline');
    if ($info.size() == 0) {
        $parent.append('<span class="help-inline"></span>');
        $info = $parent.find('.info');
    }
    return $info;
}

function ajax_validate(form, fields) {
    var $this = $(this);
    fields = fields || [ this.name ];
    form = $this.parents('form');

    // Получить все параметры
    var params = {};
    params['form-name'] = 'register';
    for(var i in fields) {
        var name = fields[i];
        var $value = $(form).find(':input[name=' + name + ']');
        if ($value.size() != 0) {
            params[name] = $value.get(0).value;
        }
        $value.parents('.control-group').first().removeClass('error').removeClass('success');
        get_info($value).text('').removeClass('error');
    }

    $.post('/account/register', params, function(data) {
        var result = isJSON(data);
        if (result){
            for(var i in fields) {
                var name = fields[i];
                var $value = $(form).find(':input[name=' + name + ']');
                if (result != true && result[name] && result[name] !== true) {
                    $value.parents('.control-group').first().addClass('error');
                    if ($value.length) {
                        get_info($value).text(result[name]).addClass('error');
                    }
                } else if ($this.get(0).value != '') {
                    $value.parents('.control-group').first().addClass('success');
                }
            }
        }else{
            console.error(data);
        }
    })
}

function function_exists( function_name ) {
    if (typeof function_name == 'string'){
        return (typeof window[function_name] == 'function');
    } else{
        return (function_name instanceof Function);
    }
}

function attach_google_map(items) {
    callback = 'attach_google_map_callback';
    if(!googleAttached) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://maps.googleapis.com/maps/api/js?key=?key=AIzaSyBU08M0uq5h-Rtyy4p4SXwyFshg3Ys4SrY" + (callback ? "&callback=" + callback : "");
        document.body.appendChild(script);
        googleAttached = 1;
    }else{
        attach_google_map_callback(items);
    }
}
function attach_google_map_callback(items) {

    var styles =[
        {
            "featureType": "landscape",
            "stylers": [
                {
                    "saturation": -100
                },
                {
                    "lightness": 40
                },
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "poi",
            "stylers": [
                {
                    "saturation": -100
                },
                {
                    "lightness": 45
                },
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "stylers": [
                {
                    "saturation": -100
                },
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "stylers": [
                {
                    "saturation": -100
                },
                {
                    "lightness": 30
                },
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "road.local",
            "stylers": [
                {
                    "saturation": -100
                },
                {
                    "lightness": 0
                },
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "transit",
            "stylers": [
                {
                    "saturation": -100
                },
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "administrative.province",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "lightness": -25
                },
                {
                    "saturation": -100
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
                {
                    "hue": "#ffff00"
                },
                {
                    "lightness": -5
                },
                {
                    "saturation": -97
                }
            ]
        }
    ];


    var styledMap = new google.maps.StyledMapType(styles,
        {name: "Styled Map"});


        var mapOptions = {
            zoom: 17,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
//disableDefaultUI: true,
            center: new google.maps.LatLng(56.8379, 60.5983),
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.BOTTOM_CENTER
            },
            //panControlOptions: {
            //    position: google.maps.ControlPosition.RIGHT_CENTER
            //},
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.LARGE,
                position: google.maps.ControlPosition.RIGHT_CENTER
            },
            scrollwheel: false,
            scaleControl: true,
            streetViewControl: false
            //streetViewControlOptions: {
            //    position: google.maps.ControlPosition.RIGHT_BOTTOM
            //}
        };

        geocoder = new google.maps.Geocoder();
        items = items || $('.wh-map-generator[data-type="google"]');
        $.each(items, function(i){
            var $this = $(this);
            var coords = $this.data('coords');
            if (coords){
                temp = coords.split(';');
                coords = {
                    lat : temp[0],
                    lng : temp[1]
                }
            }
            var geoAddress = $this.data('address');
            var marker;

            mapsx = new google.maps.Map(this, mapOptions);
            mapsx.mapTypes.set('map_style', styledMap);
            mapsx.setMapTypeId('map_style');

            if(coords && coords.lat && coords.lng) {
                var point = new google.maps.LatLng(coords.lat, coords.lng);
                marker = new google.maps.Marker({
                    map: mapsx,
                    //icon : '/template/std/img/icons/map-marker.png',
                    position: point
                });
                mapsx.setCenter(point);
            }
            else if(geoAddress) {
                geocoder.geocode( {
                    'address': geoAddress
                }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        mapsx.setCenter(results[0].geometry.location);
                        marker = new google.maps.Marker({
                            map: mapsx,
                            icon : '/template/std/img/icons/map-marker.png',
                            position: results[0].geometry.location
                        });
                    }
                })
            }
        });

}



function attach_yandex_map(callback) {
    callback = whApp.getCallback(callback, {silent : true}) || attach_yandex_map_callback;

    if(typeof ymaps!='undefined'){
        ymaps.ready(callback);
    }else{
        $.getScript("http://api-maps.yandex.ru/2.0/?load=package.full&mode=debug&lang=ru-RU",function(){
            ymaps.ready(function(){
                callback();
            });
        });
    }
}

function attach_yandex_map_callback(items) {

    items = items || $('.wh-map-generator[data-type="yandex"]');

    if (typeof ymaps == undefined) {
        console.log('ymaps is undefined')
        return;
    }

    $.each(items, function(){
        var geoResult;
        var $this = $(this);
        var geoAddress = $this.data('address');
        var zoom = $this.data('zoom') ? $this.data('zoom') : 15;
        var toolbar = $this.data('toolbars') == 'min' ? false : true;

        var coords = $this.data('coords');
        if (coords){
            temp = coords.split(';');
            coords = {
                lat : temp[0],
                lng : temp[1]
            }
        }

        myPlacemark = null;
        var obj = this;
        if(coords && coords.lat && coords.lng) {
            myPlacemark = new ymaps.Placemark(
                coords = [coords.lat, coords.lng], {
                }, {
                    draggable: false,
                    hideIconOnBalloonOpen: false,
                    iconLayout: 'default#image',
                    iconImageHref  : '/template/std/img/icons/map-marker.png',
                    iconImageSize: [56, 93]
                }, {
                    //conLayout: 'default#image',
                    //iconImageHref  : '/template/std/img/icons/map-marker.png',
                    //iconImageSize: [17, 25]
                    //iconImageOffset: [-3, -42]
                }
            );
            var myMap = new ymaps.Map(obj, {
                center: coords,
                zoom: zoom,
                type: "yandex#map"
            });
            if (toolbar){
                myMap.controls.add("mapTools")
                    .add("zoomControl")
                    .add("typeSelector");
            }
            myMap.geoObjects.add(myPlacemark);
        }
        else if(geoAddress) {
            var myGeocoder = ymaps.geocode(geoAddress);
            myGeocoder.then(
                function (res) {
                    var point = res.geoObjects.get(0);
                    coords = point.geometry.getCoordinates();
                    var myMap = new ymaps.Map(obj, {
                        center: coords,
                        zoom: zoom,
                        type: "yandex#map"
                    });
                    if (toolbar){
                        myMap.controls.add("mapTools")
                            .add("zoomControl")
                            .add("typeSelector");
                    }
                    myPlacemark = new ymaps.Placemark(myMap.getCenter(), {
                        //hint: 'Собственный значок метки'
                    }, {
                        iconLayout: 'default#image',
                        iconImageHref  : '/template/std/img/icons/map-marker.png',
                        iconImageSize: [23, 36]
                        //iconImageOffset: [-3, -42]
                    });

                    myMap.geoObjects.add(myPlacemark);
                }
            );
        }
    });
}


function attach_2gis_map(items){


    if (!$('head').find('[data-id="dgLoader"]').length){
        $('head').append('<script src="http://maps.api.2gis.ru/2.0/loader.js?pkg=full" data-id="dgLoader"></script>');
        setTimeout(function(){
            __2gisInit();
        }, 2000);
    }else{
        __2gisInit();
    }

    function __2gisInit(){
        DG.then(function () {
            $.each(items, function(){
                var $item = $(this);
                var address = $item.data('address');
                var coords = $item.data('coords');
                var key = $item.data('2giskey');
                if (coords){
                    coords = coords.split(';');
                    var myMap = new DG.map($item[0], {
                        zoom : 15,
                        "center": coords
                    });
                    DG.marker(coords).addTo(myMap).bindPopup(address);
                }else{
                    DG.ajax('http://catalog.api.2gis.ru/2.0/search', {
                        data: {
                            key: key,
                            type: 'geo',
                            what: address
                        },
                        success: function(geocoderObjects) {
                            // Обходим циклом все полученные геообъекты
                            for(var i = 0, len = geocoderObjects.length; i < len; i++) {
                                var geocoderObject = geocoderObjects[i];

                                myMap.setCenter(new DG.GeoPoint(geocoderObject._centroid.lon, geocoderObject._centroid.lat), 15);
                                // Получаем маркер из геообъекта с помощью метода getMarker.
                                // Первый параметр - иконка маркера, второй параметр - функция, которая сработает при клике на маркер
                                var markerIcon = null; // иконка по умолчанию
                                var marker = geocoderObject.getMarker(
                                    markerIcon
                                );

                                myMap.markers.add(marker);
                            }
                        },
                        error: function(error) {
                            console.log(error);
                        }
                    });

                }
            })
        });
    }
}


function str_replace(search, replace, subject) {
    return subject.split(search).join(replace);
}


function poll_submited(data, obj){
    $('#poll-widget > .inner').html(data);
}


function cancelSelection(){
    if (window.getSelection)
        window.getSelection().removeAllRanges();
    else if (document.selection)
        document.selection.empty();
}




function __(){
    console.log.apply(console, arguments);
}



function check_login() {
    $(this).find(':text, :password').each(function() {
        var $this = $(this).addClass('ajax-validate');
        var callback;
        if (this.name != 'password' && this.name != 'password_confirm') {
            callback = ajax_validate;
        } else {
            callback = function() {
                ajax_validate.call(this, $(this).parents('form'), ['password', 'password_confirm']);
            };
        }
        $this.change(callback).blur(callback);
    })
};






function uniqId() {
    return Math.round(new Date().getTime() + (Math.random() * 100));
}

function urlencode(str) {
    //       discuss at: http://phpjs.org/functions/urlencode/
    //      original by: Philip Peterson
    //      improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    //      improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    //      improved by: Brett Zamir (http://brett-zamir.me)
    //      improved by: Lars Fischer
    //         input by: AJ
    //         input by: travc
    //         input by: Brett Zamir (http://brett-zamir.me)
    //         input by: Ratheous
    //      bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    //      bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    //      bugfixed by: Joris
    // reimplemented by: Brett Zamir (http://brett-zamir.me)
    // reimplemented by: Brett Zamir (http://brett-zamir.me)
    //             note: This reflects PHP 5.3/6.0+ behavior
    //             note: Please be aware that this function expects to encode into UTF-8 encoded strings, as found on
    //             note: pages served as UTF-8
    //        example 1: urlencode('Kevin van Zonneveld!');
    //        returns 1: 'Kevin+van+Zonneveld%21'
    //        example 2: urlencode('http://kevin.vanzonneveld.net/');
    //        returns 2: 'http%3A%2F%2Fkevin.vanzonneveld.net%2F'
    //        example 3: urlencode('http://www.google.nl/search?q=php.js&ie=utf-8&oe=utf-8&aq=t&rls=com.ubuntu:en-US:unofficial&client=firefox-a');
    //        returns 3: 'http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3Dphp.js%26ie%3Dutf-8%26oe%3Dutf-8%26aq%3Dt%26rls%3Dcom.ubuntu%3Aen-US%3Aunofficial%26client%3Dfirefox-a'

    str = (str + '')
        .toString();

    // Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
    // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
    return encodeURIComponent(str)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .
        replace(/\)/g, '%29')
        .replace(/\*/g, '%2A')
        .replace(/%20/g, '+');
}

function http_build_query(formdata, numeric_prefix, arg_separator) {
    //  discuss at: http://phpjs.org/functions/http_build_query/
    // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Legaev Andrey
    // improved by: Michael White (http://getsprink.com)
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Brett Zamir (http://brett-zamir.me)
    //  revised by: stag019
    //    input by: Dreamer
    // bugfixed by: Brett Zamir (http://brett-zamir.me)
    // bugfixed by: MIO_KODUKI (http://mio-koduki.blogspot.com/)
    //        note: If the value is null, key and value are skipped in the http_build_query of PHP while in phpjs they are not.
    //  depends on: urlencode
    //   example 1: http_build_query({foo: 'bar', php: 'hypertext processor', baz: 'boom', cow: 'milk'}, '', '&amp;');
    //   returns 1: 'foo=bar&amp;php=hypertext+processor&amp;baz=boom&amp;cow=milk'
    //   example 2: http_build_query({'php': 'hypertext processor', 0: 'foo', 1: 'bar', 2: 'baz', 3: 'boom', 'cow': 'milk'}, 'myvar_');
    //   returns 2: 'myvar_0=foo&myvar_1=bar&myvar_2=baz&myvar_3=boom&php=hypertext+processor&cow=milk'

    var value, key, tmp = [],
        that = this;

    var _http_build_query_helper = function(key, val, arg_separator) {
        var k, tmp = [];
        if (val === true) {
            val = '1';
        } else if (val === false) {
            val = '0';
        }
        if (val != null) {
            if (typeof val === 'object') {
                for (k in val) {
                    if (val[k] != null) {
                        tmp.push(_http_build_query_helper(key + '[' + k + ']', val[k], arg_separator));
                    }
                }
                return tmp.join(arg_separator);
            } else if (typeof val !== 'function') {
                return urlencode(key) + '=' + urlencode(val);
            } else {
                throw new Error('There was an error processing for http_build_query().');
            }
        } else {
            return '';
        }
    };

    if (!arg_separator) {
        arg_separator = '&';
    }
    for (key in formdata) {
        value = formdata[key];
        if (numeric_prefix && !isNaN(key)) {
            key = String(numeric_prefix) + key;
        }
        var query = _http_build_query_helper(key, value, arg_separator);
        if (query !== '') {
            tmp.push(query);
        }
    }

    return tmp.join(arg_separator);
}


$.fn.parseLinks = function(){
    if (this.length){
        //var regexp = /((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)(?:(?=[<]|[ ]*))/gi;
        //var regexp = /((((https?)|(ftp)):\/\/)?(([a-zа-я0-9\-_])+\.)+(ru|com|net|рф|su|sk|tv)(\/[a-z0-9а-я_\.\-]*)*\/?(\?[^ <\n]*)?[^,. \)<\n])/ig;
        var regexp = /(((https?|ftp):\/\/)?(([a-zа-я0-9\-_])+\.)+(ru|com|net|рф|it|su|sk|tv|me|be)(\/[a-z0-9а-я_\.\-]*[a-z0-9а-я_\-])*\/?(\?[^ <\n]*[^,. \)<\n])?(#[^ <\n]*[^,. \)<\n])?)/ig;
        var imgreg = /(\<img.*src=")\<a.*href="(.*)".*\>(".*\>)/ig;
        this.each(function(k,v){
            if (!$(this).find('a').length){
                $(this).html(
                    $(this).html().replace(regexp, function(p1, p2, p3){
                        if (p3 == undefined)
                            return '<a target="_blank" href="http://'+p1+'">'+p1+'</a>';
                        else
                            return '<a target="_blank" href="'+p1+'">'+p1+'</a>';
                    }).replace(imgreg,'$1$2$3')
                );
            }
        });
    }
};

$.fn.getBgImage = function() {
    return $(this)
        .css('background-image')
        .match("url\\((.*)\\)")
        [1];

};


$.fn.gifAnimateOnHover = function(){
    $(this).data('static_url', $(this).find('img.target').attr('src'));
    $(this).on('mouseenter', function(){
        var $this = $(this);
        $this.data('hover', true);

        if ($this.data('hover') === true){
            // Remove the loading image if there is one
            $this.find('.gif-loading').remove();

            // Swap out the static src for the actually gif.
            $this.find('img.target').attr('src', $this.find('img.gif').attr('src'));
        }
    }).on('mouseleave', function(){
        var $this = $(this);
        // Make sure the load function knows we are no longer in a hover state.
        $this.data('hover', false);
        // Remove the spiner if it's there.
        $this.find('.gif-loading').remove();
        // Set the src to the static url.
        $this.find('img.target').attr('src', $this.data('static_url'));
    });
};

function resizeContactsMap(){
    if ($(window).height() < 1000){
        $('#contacts .wh-map-holder').height(430);
        return false;
    }

    if ($body.hasClass('body-contacts')){
        var headerHeight = 447;
        //var footerHeight = 115;
        var footerHeight = 48;
        $('#contacts .wh-map-holder').height($(window).height() - headerHeight - footerHeight);
    }
}



$.fn.teamVideo = function(options){

    $.extend({
        interval : 5000
    }, options || {});

    var $teamBlock = $(this);
    var $items = $teamBlock.find('.items > .item');
    var intervalHWD = null;
    var count = $items.length;
    var linesCount = Math.ceil(count/4);
    var countInLastLine = (linesCount * 4 - count) || 4;
    var $item1, $item2;

    initVideo($items.find('video'), {
        player : {
            startVolume : 0
        }
    });

    function iterate($justThisItem){
        if ($justThisItem){
            $item1 = null;
            $item2 = null;
            play($justThisItem);
        }else{
            var line1Num = random(0, linesCount-1);
            var line2Num = random(0, linesCount-1, [line1Num]);
            if (line1Num > line2Num){
                var temp = line1Num;
                line1Num = line2Num;
                line2Num = temp;
            }

            // Паузим предыдущие
            var item1Num = 0;
            var item2Num = 0;

            // Сколько элементов во второй строке?
            // Если вторая строка - последняя
            if (linesCount == (line2Num+1)){
                item2Num = random(0, countInLastLine-1);
                item1Num = random(0, 3, [item2Num])
            }else{
                item2Num = random(0, 3);
                item1Num = random(0, 3, [item2Num])
            }

            // Получаем требуемые номера
            item1Num = (line1Num)*4 + item1Num;
            item2Num = (line2Num)*4 + item2Num;


            // Получаем требуемые элементы по номерам
            var newItem1 = $items.get(item1Num);
            var newItem2 = $items.get(item2Num);

            $items.each(function(){pause(this);});


            if (!$(newItem1).is($item1)){
                pause($item1);
                $item1 = $(newItem1);
            }
            play($item1);

            if (!$(newItem2).is($item2)){
                pause($item2);
                $item2 = $(newItem2);
            }
            play($item2);
        }
        intervalHWD = setTimeout(iterate, options.interval);
    }

    iterate();

    function play($item){
        var video = $($item).find('video');
        if (!video.length) return false;
        var player = $($item).find('video').data('instance');
        if (!player) return false;
        player.setVolume(0);
        player.setCurrentTime(0);
        player.play();
    }

    function pause($item){
        var video = $($item).find('video');
        if (!video.length) return false;
        var player = $($item).find('video').data('instance');
        if (!player) return false;
        player.pause();
    }

    $items.mouseover(function(){
        clearTimeout(intervalHWD);
        $(this).siblings().each(function(){pause(this);});
        iterate($(this));
    }).mouseout(function(){
        //pause(this);
        //iterate();
    });


};

function random(min, max, except) {
    var num = Math.floor(Math.random() * (max - min + 1)) + min;

    if (except) {
        if ($.inArray(num, except) !== -1)
            return random(min, max, except);
    }

    return num;
}

function switchOffVideo(){
  MediaElementEnable = false;
  $('#mainvideo').remove();
}