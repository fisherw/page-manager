
require('./lib/zepto');

var PageManager = require('./page-manager');

/**
 * [register description]
 *
 * @require ./demo.css
 */
var reservePay = {
    init: function() {

        this.pageManager = new PageManager($('#main'));

        // 初始化首页并显示
        this.homePage();

        // 初始化其它页面
        this.initPages();
    },

    initPages: function() {
        var that = this;

        this.pageManager
            .addPage({
                url: '#a/b',
                name: 'a/b',
                // tpl: '<div class="area"></div>',
                handler: function($el, params)  {
                    // that.bindEvent($el, {
                    //     'click  .area': that.onTicketListTicketClick
                    // });

                },
                active: function($el, params, forward) {
                    document.title = '使用代金券';
                },
                leave: function($el, params, forward) {

                }
            })
            .addPage({
                url: '#/test/:id',
                name: 'test/:id',
                tpl: '<div>这是测试页面</div>',
                handler: function($el, params)  {
                    console.log(params);

                },
                active: function($el, params, forward) {
                    document.title = '测试页';
                },
                leave: function($el, params, forward) {

                }
            });
    },

    ticketListPage: function($el, params) {
        // view.renderTicketList($el, window.TICKETS);
    },

    homePage: function($el) {
        var that = this;

        this.pageManager
        .addPage({
            url: '#',
            name: 'home',
            tpl: '<div class="home">测试测试</div>',
            handler: function($el) {
                // that.bindEvent($el, {
                //     'click .home .demo': that.onDemoClick
                // });
            },
            active: function($el, params) {
                document.title = 'demo demo';
            }
        })
        .setDefault('home')
        .init();
    },
    

    onDemoClick: function(e) {

        this.pageManager.go('#a/b');
    }
};

module.exports = reservePay;
