/*jslint            browser : true,    continue : true,
 devel  : true,     indent : 2,         maxerr : 50,
 newcap : true,      nomen : true,    plusplus : true,
 regexp : true,     sloppy : true,        vars : false,
 white  : true
 */
/*global $, app */
app.shell = (function () {
  var configMap = {
        main_html : String()
          + '<div class="app-shell-header">'
            + '<div class="app-shell-header-logo"></div>'
            + '<div class="app-shell-header-account"></div>'
            + '<div class="app-shell-header-search"></div>'
          + '</div>'
          + '<div class="app-shell-main">'
            + '<div class="app-shell-main-nav"></div>'
            + '<div class="app-shell-main-content"></div>'
          + '</div>'
          + '<div class="app-shell-footer"></div>'
          + '<div class="app-shell-chat"></div>'
          + '<div class="app-shell-modal"></div>',
        chat_extend_time     : 750,
        chat_retract_time    : 300,
        chat_extend_height   : 450,
        chat_retract_height  : 15,
        chat_extended_title  : 'Click to retract',
        chat_retracted_title : 'Click to extend'
      },
      stateMap = {
        $container        : null,
        is_chat_retracted : true
      },
      jQueryMap = {},
      setjQueryMap, toggleChat, onClickChat, initModule;

  setjQueryMap = function () {
    var $container = stateMap.$container;
    jQueryMap = {
      $container : $container,
      $chat : $container.find('.app-shell-chat')
    };
  };

  toggleChat = function (do_extend, callback) {
    var chat_height_px = jQueryMap.$chat.height(),
        is_open        = (chat_height_px === configMap.chat_extend_height),
        is_closed      = (chat_height_px === configMap.chat_retract_height),
        is_sliding     = (!is_open) && (!is_closed);

    if (is_sliding) {
      return false;
    }

    if (do_extend) {
      jQueryMap.$chat.animate(
        { height : configMap.chat_extend_height },
        configMap.chat_extend_time,
        function() {
          jQueryMap.$chat.attr('title', configMap.chat_extended_title);
          stateMap.is_chat_retracted = false;
          if (callback) {
            callback(jQueryMap.$chat);
          }
      });
      return true;
    }

    jQueryMap.$chat.animate(
      { height : configMap.chat_retract_height },
      configMap.chat_retract_time,
      function () {
        jQueryMap.$chat.attr('title', configMap.chat_retracted_title);
        stateMap.is_chat_retracted = true;
        if (callback) {
          callback(jQueryMap.$chat);
        }
      }
    );
    return true;
  };

  onClickChat = function () {
    toggleChat(stateMap.is_chat_retracted);
    return false;
  };

  initModule = function ($container) {
    stateMap.$container = $container;
    $container.html(configMap.main_html);
    setjQueryMap();

    stateMap.is_chat_retracted = true;
    jQueryMap.$chat
      .attr('title', configMap.chat_retracted_title)
      .click(onClickChat);
  };

  return {
    initModule : initModule
  };
}());