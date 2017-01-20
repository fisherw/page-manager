
/**
 * PageManager-单页面路由（依赖Zepto/JQuery)
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2017-01-20T11:34:38+0800
 * @param    {[type]}        $container 页面容器jquery/zepto选择器
 */
var PageManager = function($container) {
    // 页面容器dom
    this.$container = $container;
    // 页面堆栈
    this._pageStack = [];
    // 页面配置
    this._configs = [];
    // 默认页
    this.defaultPage = null;
    // 页面序号
    this._pageIndex = 1;
};

PageManager.prototype.init = function() {
    var that = this,
        url = this._getHash();

    // Todo 兼容性优化
    $(window).on('hashchange', function() {
        var url = that._getHash();

        that._dispatch(url);
    });

    if (history.state && history.state._pageIndex) {
        this._pageIndex = history.state._pageIndex;
    }

    this._pageIndex--;

    that._dispatch(url);
    
    return this;
};

PageManager.prototype._dispatch = function(url) {
    var state = history.state || {},
        params = {},
        page = this._findPage('url', url, params);

    if (!page) {
        page = this._defaultPage || this._configs[0];
        url = page.url;
    }

    if (this._pageIndex >= state._pageIndex || this._findPageInStack(url)) {
        this._back(page, params);
    } else {
        this._go(url, page, params);
    }
};

PageManager.prototype._getHash = function() {
    return location.hash.indexOf('#') === 0 ? location.hash : '#';
};

PageManager.prototype._findPage = function(key, value, params) {
    var page = null;

    for (var i = 0, len = this._configs.length; i < len; i++) {
        if (key === 'url' && urlMatch(this._configs[i][key], value, params || {})) {
            page = this._configs[i];
            break;
        } else if (this._configs[i][key] === value) {
            page = this._configs[i];
            break;
        }
    }
    return page;
};

PageManager.prototype._go = function(url, page, params) {
    this._pageIndex++;

    var stack = this._pageStack[this._pageStack.length - 1];

    if (history.replaceState) {
        history.replaceState({
            _pageIndex: this._pageIndex
        }, '', url);
    }

    var html = page.tpl || '<div></div>',
        $html = $(html)
            .addClass('page')
            .addClass('slideIn')
            .addClass(page.name)
            .on('animationend', function () {
                $('.page').not(this).css({
                    'opacity': 0,
                    'display': 'none'
                });

                $(this).off('animationend');
            })
            .on('webkitAnimationEnd', function () {
                $('.page').not(this).css({
                    'opacity': 0,
                    'display': 'none'
                });
                $(this).off('webkitAnimationEnd');
            });
    
    this.$container.append($html);

    this._pageStack.push({
        url: url,
        page: page,
        dom: $html
    });

    if (page.handler) {
        page.handler($html, params);
    }

    if (page.active) {
        page.active($html, params, true);
    }

    if (stack && stack.page && stack.page.leave) {
        stack.page.leave(stack.dom, null, true);
    }
    
    return this;
};

PageManager.prototype._back =  function(page, params) {
    this._pageIndex--;

    var stack = this._pageStack.pop();

    if (!stack) {
        return;
    }

    var url = this._getHash(),
        found = this._findPageInStack(url);

    if (!found) {
        var html = page.tpl || '<div></div>',
            $html = $(html)
                .addClass('page')
                .css({
                    'opacity': 1,
                    'display': 'block'
                })
                .addClass(page.name);
        $html.insertBefore(stack.dom);

        if (page.handler) {
            page.handler($html, params);
        }

        if (page.active) {
            page.active($html, params, false);
        }

        this._pageStack.push({
            url: url,
            page: page,
            dom: $html
        });
    } else {
        found.dom.css({
            'opacity': 1,
            'display': 'block'
        });

        if (found.page.active) {
            found.page.active(found.dom, params, false);
        }
    }

    if (stack.page.leave) {
        stack.page.leave(stack.dom, params, false);
    }

    stack.dom.addClass('slideOut').on('animationend', function () {
        stack.dom.remove();
    }).on('webkitAnimationEnd', function () {
        stack.dom.remove();
    });

    return this;
};

PageManager.prototype._findPageInStack = function (url) {
    var found = null;
    for(var i = 0, len = this._pageStack.length; i < len; i++){
        var stack = this._pageStack[i];
        if (stack.url === url) {
            found = stack;
            break;
        }
    }
    return found;
};

PageManager.prototype.setDefault = function (pageName) {
    this._defaultPage = this._findPage('name', pageName);
    return this;
};

PageManager.prototype.addPage = function (config) {
    this._configs.push({
        url: config.url,
        name: config.name,
        tpl: config.tpl,
        handler: config.handler,
        active: config.active,
        leave: config.leave
    });
    return this;
};

PageManager.prototype.go = function(url) {
    var config = this._findPage('url', url);

    if (!config) {
        console.log('ths url[' + url + ']have not registered to router.');
        return;
    }
    // this._dispatch(url);
    location.hash = url;
};

PageManager.prototype.back = function () {
    history.back();
};

var urlMatch = function (pattern, pathname, params) {
    var keys = [];
    pattern = pattern.replace(/:(\w+)/g, function (_, key) {
        keys.push(key);
        return '([^\/]+)';
    }).replace(/\*/g, '(.*)') || '';
    pattern = '^' + pattern + '$';

    var match = pathname.match(new RegExp(pattern));
    if (!match) {
        return false;
    }

    for (var i = 0, len = keys.length; i < len; i++) {
        params[keys[i]] = match[i + 1];
    }

    // _.each(keys, function (key, i) {
    //     params[key] = match[i + 1];
    // });
    return true;
};


module.exports = PageManager;
