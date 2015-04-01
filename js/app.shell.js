/*jslint            browser : true,    continue : true,
 devel  : true,     indent : 2,         maxerr : 50,
 newcap : true,      nomen : true,    plusplus : true,
 regexp : true,     sloppy : true,        vars : false,
 white  : true
 */
/*global $, app */
app.shell = (function () {
  var configMap = {
        anchor_schema_map : {
          chat : {
            open   : true,
            closed : true
          }
        },
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
        anchor_map        : {},
        is_chat_retracted : true
      },
      jQueryMap = {},
      copyAnchorMap, setjQueryMap, toggleChat, changeAnchorPart, onHashChange,
      onClickChat, initModule;

  copyAnchorMap = function () {
    return $.extend(
      true,
      {},
      stateMap.anchor_map
    );
  };

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

  changeAnchorPart = function (arg_map) {
    var anchor_map_revise = copyAnchorMap(),
        bool_return = true,
        key_name, key_name_dep;

    for (key_name in arg_map) {
      if (arg_map.hasOwnProperty(key_name)) {
        if (key_name.indexOf('_') === 0) {
          continue;
        }

        anchor_map_revise[key_name] = arg_map[key_name];
        key_name_dep = '_' + key_name;

        if (arg_map[key_name_dep]) {
          anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
        } else {
          delete anchor_map_revise[key_name_dep];
          delete anchor_map_revise['_s' + key_name_dep];
        }
      }
    }

    try {
      $.uriAnchor.setAnchor(anchor_map_revise);
    } catch (error) {
      $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
      bool_return = false;
    }

    return bool_return;
  };

  onHashChange = function () {
    var anchor_map_previous = copyAnchorMap(),
        anchor_map_proposed,
        _s_chat_previous, _s_chat_proposed, s_chat_proposed;

    try {
      anchor_map_proposed = $.uriAnchor.makeAnchorMap();
    } catch (error) {
      $.uriAnchor.setAnchor(anchor_map_previous, null, true);
      return false;
    }
    stateMap.anchor_map = anchor_map_proposed;

    _s_chat_previous = anchor_map_previous._s_chat;
    _s_chat_proposed = anchor_map_proposed._s_chat;

    if (!anchor_map_previous || _s_chat_previous !== _s_chat_proposed) {
      s_chat_proposed = anchor_map_proposed.chat;
      switch (s_chat_proposed) {
        case 'open' :
          toggleChat(true);
          break;
        case 'closed' :
          toggleChat(false);
          break;
        default :
          toggleChat(false);
          delete anchor_map_proposed.chat;
          $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
      }
    }
    return false;
  };

  onClickChat = function () {
    changeAnchorPart({
      chat : (stateMap.is_chat_retracted) ? 'open' : 'closed'
    });
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

    $.uriAnchor.configModule({
      schema_map : configMap.anchor_schema_map
    });

    $(window).bind('hashchange', onHashChange).trigger('hashchange');
  };

  return {
    initModule : initModule
  };
}());