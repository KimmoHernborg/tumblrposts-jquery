(function($) {
    $.TumblrPosts = function(element, options) {
        var defaults = {
            tumblrId: null,
            postId: null,
            start: 0,
            num: 50,
            tagged: null,
            ptype: null
        };

        var self = this;
        self.settings = {};
        self.tumblr = {};
        var $element = $(element);
        
        self.init = function() {
            self.settings = $.extend({}, defaults, options);
            if (self.settings.tumblrId) self.load();
        };
        
        /// Public methods
        self.load = function (newOptions) {
            self.settings = $.extend(self.settings, newOptions);
            $.ajax({
                type: 'GET',
                cache: true,
                url: 'http://' + self.settings.tumblrId + '.tumblr.com/api/read/json/?' + 
                    (self.settings.postId ? 'id=' + self.settings.postId : 
                        'start=' + self.settings.start + '&num=' + self.settings.num + 
                        (self.settings.tagged ? '&tagged=' + self.settings.tagged : '') + 
                        (self.settings.ptype ? '&type=' + self.settings.ptype : '')
                    ), 
                dataType: 'jsonp',
                jsonpCallback: 'jqTumblrHandlr',
                success: onLoad
            });
            clear();
        };
        
        /// Private methods
        var onLoad = function (tumblr) {
            self.tumblr = tumblr;
            console.log(tumblr);
            
            // Title
            $element.append('<h1>' + tumblr.tumblelog.title + '</h1>');
            window.document.title = tumblr.tumblelog.title + ' - Tumblr';
                
            for (var i in tumblr.posts) {
                if (tumblr.posts[i].type == 'photo') {
                    imgPost(tumblr.posts[i]);
                } else if (tumblr.posts[i].type == 'regular') {
                    regPost(tumblr.posts[i]);
                } else if (tumblr.posts[i].type == 'video') {
                    videoPost(tumblr.posts[i]);
                } else if (tumblr.posts[i].type == 'audio') {
                    audioPost(tumblr.posts[i]);
                } else {
                    console.log(tumblr.posts[i]);
                }
            }
        };
        var clear = function () {
            $element.empty();
        };
        var cleanHTML = function (htmlText) {
            //return $('<span>' + htmlText + '</span>').text();
            var allTagsExcept = /<(?!\/?(a|p|br|blockquote)(?=>|\s.*>))\/?.*?>/ig;
            var result = htmlText.replace(allTagsExcept, '');
            //console.log({before: htmlText, after: result});
            return result;
        };
        var imgPost = function (post) {
            var $post = $('<div class="post"></div>');
            var photos = (post.photos && post.photos.length > 0) ? post.photos : [post];
            var photosHTML = ['<div class="images">'];
            for (var i in photos) {
                photosHTML.push('<a class="nolink hoverZoomLink" href="' + photos[i]['photo-url-1280'] + '" target="_blank">',
                '<img src="' + photos[i]['photo-url-1280'] + '">',
                '</a>');
            }
            photosHTML.push('</div>');
            $post.append(photosHTML.join(''));
            
            if (post['photo-caption']) {
                $post.append('<div class="caption">' + cleanHTML(post['photo-caption']) + '</div>');
            }
            addSource($post, post);
            $element.append($post);
        };
        var videoPost = function (post) {
            if (post['video-player-500']) {
                var $post = $('<div class="post"></div>');
                var vidClass = post['video-player-500'].match(/<video/ig) ? 'html5-video' : 'video';
                $post.append('<div class="' + vidClass + '">' + post['video-player-500'] + '</div>');
                
                if (post['video-caption']) {
                    $post.append('<div class="caption">' + cleanHTML(post['video-caption']) + '</div>');
                }
                addSource($post, post);
                $element.append($post);
            }
        };
        var audioPost = function (post) {
            var $post = $('<div class="post"></div>');
            $post.append('<div class="audio">' + post['audio-player'] + '</div>');
            
            if (post['audio-caption']) {
                $post.append('<div class="caption">' + cleanHTML(post['audio-caption']) + '</div>');
            }
            addSource($post, post);
            $element.append($post);
        };
        var regPost = function (post) {
            var $post = $('<div class="post"></div>');
            if (post['regular-title']) {
                $post.append('<h2>' + post['regular-title'] + '</h2>');
            }
            if (post['regular-body']) {
                $post.append('<div class="images"><a class="nolink" href="' + post['url-with-slug'] + '" target="_blank">' + post['regular-body'] + '</a></div>');
            }
            addSource($post, post);
            $element.append($post);
        };
        var addSource = function ($post, post) {
            $post.append(
                '<div class="source">Source: <a href="' + post['url-with-slug'] + '" target="_blank">' + post['url-with-slug'] + '</a>' + 
                (post.hasOwnProperty('photo-link-url') ? ' Link: <a href="' + post['photo-link-url'] + '" target="_blank">' + post['photo-link-url'] + '</a>' : '') + 
                '</div>'
            );
        };

        self.init();
    };

    $.fn.TumblrPosts = function(options) {
        return this.each(function() {
            if (undefined === $(this).data('TumblrPosts')) {
                var plugin = new $.TumblrPosts(this, options);
                $(this).data('TumblrPosts', plugin);
            }
        });
    };

})(jQuery);

/* Setup page stuff */
$(function() {
    //window.tumblrPosts = $('#images').TumblrPosts({tumblrId: 'fer1972'}).data('TumblrPosts');
    
    window.tumblrPosts = $('#images').TumblrPosts().data('TumblrPosts');
    $(window).resize(function () {
        var w = $(window).height() * 2 / 3; // Most images are 3/2, fit to screen height
        $('#imgwidth').text("#images,#form {max-width: " + w + "px;}");
    });
    $(window).trigger('resize');
    var prevId;
    $('#form').submit(function(e) {
        e.preventDefault();
        if ($('#tumblrId').val() !== prevId) $('#start').val(0);
        var params = {
            tumblrId: $('#tumblrId').val(),
            postId: $('#postId').val(),
            tagged: $('#tagged').val(),
            ptype: $('input[name="ptype"]:checked').val(),
            start: $('#start').val(),
            num: $('#num').val()
        };
        prevId = params.tumblrId;
        //console.log(params);
        //tumblrPosts.load(params);
        $.bbq.pushState(params);
        
        // Hide input form
        $('#showform, #navigation').show();
        $('#inputform').hide();
    });
    $('#first').click(function(e) {
        e.preventDefault();
        var pos = 0;
        $('#start').val(pos);
        $('#form').submit();
        window.scrollTo(0, 0);
    });
    $('#prev').click(function(e) {
        e.preventDefault();
        var start = parseInt($('#start').val());
        var num = parseInt($('#num').val());
        var pos = start - num;
        pos = pos >= 0 ? pos : 0;
        $('#start').val(pos);
        $('#form').submit();
        window.scrollTo(0, 0);
    });
    $('#next').click(function(e) {
        e.preventDefault();
        var start = parseInt($('#start').val());
        var num = parseInt($('#num').val());
        var end = tumblrPosts.tumblr['posts-total'] - num;
        var pos = start + num;
        pos = pos <= end ? pos : end;
        pos = pos > 0 ? pos : 0;
        $('#start').val(pos);
        $('#form').submit();
        window.scrollTo(0, 0);
    });
    $('#last').click(function(e) {
        e.preventDefault();
        var num = parseInt($('#num').val());
        var pos = tumblrPosts.tumblr['posts-total'] - num;
        pos = pos > 0 ? pos : 0;
        $('#start').val(pos);
        $('#form').submit();
        window.scrollTo(0, 0);
    });
    $('#toggleadvopts').click(function(e) {
        e.preventDefault();
        $('#advoptions').toggle();
    });
    $('#showform a').click(function(e) {
        e.preventDefault();
        $('#showform, #inputform').toggle();
    });
    $(window).bind('hashchange', function(e) {
        if (e.fragment === "") return;
        var params = e.getState();
        $('#tumblrId').val(params['tumblrId']);
        $('#postId').val(params['postId']);
        $('#tagged').val(params['tagged']);
        $('input[name="ptype"][value="' + params['ptype'] + '"]').prop('checked', true);
        $('#start').val(params['start']);
        $('#num').val(params['num']);
        //console.log(params);
        prevId = params.tumblrId;
        tumblrPosts.load(params);
        
        // Hide input form
        $('#showform, #navigation').show();
        $('#inputform').hide();
    });
    $(window).trigger('hashchange');
});