(function ($) {
  "use strict";
    // COLOR MODE
    $('.color-mode').click(function(){
        $('.color-mode-icon').toggleClass('active')
        $('body').toggleClass('dark-mode')
        if (document.querySelector('body > section:nth-child(3) > div.chart-div > div > div > div > div > iframe').src === "https://s.tradingview.com/widgetembed/?frameElementId=tradingview_cddab&symbol=FX_IDC%3AXAGUSD&interval=D&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=Dark&style=1&timezone=Etc%2FUTC&withdateranges=1&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=127.0.0.1&utm_medium=widget_new&utm_campaign=chart&utm_term=FX_IDC%3AXAGUSD") {
          document.querySelector('body > section:nth-child(3) > div.chart-div > div > div > div > div > iframe').src = "https://s.tradingview.com/widgetembed/?frameElementId=tradingview_beaf3&symbol=FX_IDC%3AXAGUSD&interval=D&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=Light&style=1&timezone=Etc%2FUTC&withdateranges=1&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=127.0.0.1&utm_medium=widget_new&utm_campaign=chart&utm_term=FX_IDC%3AXAGUSD"
        } else {
          document.querySelector('body > section:nth-child(3) > div.chart-div > div > div > div > div > iframe').src = "https://s.tradingview.com/widgetembed/?frameElementId=tradingview_cddab&symbol=FX_IDC%3AXAGUSD&interval=D&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=Dark&style=1&timezone=Etc%2FUTC&withdateranges=1&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=127.0.0.1&utm_medium=widget_new&utm_campaign=chart&utm_term=FX_IDC%3AXAGUSD"
        }
    })
})(jQuery);
