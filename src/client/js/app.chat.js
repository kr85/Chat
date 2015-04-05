/*jslint        browser : true, continue : true,
 devel  : true,  indent : 2,      maxerr : 50,
 newcap : true,   nomen : true, plusplus : true,
 regexp : true,  sloppy : true,     vars : false,
 white  : true
 */
/*global $, app */
app.chat = (function () {
  'use strict';

  var configMap = {
        main_html : String()
          + '<div class="app-chat">'
            + '<div class="app-chat-header">'
              + '<div class="app-chat-header-toggle">+</div>'
              + '<div class="app-chat-header-title">'
                + 'Chat'
              + '</div>'
            + '</div>'
            + '<div class="app-chat-closer">x</div>'
            + '<div class="app-chat-sizer">'
              + '<div class="app-chat-list">'
                + '<div class="app-chat-list-box"></div>'
              + '</div>'
              + '<div class="app-chat-messages">'
                + '<div class="app-chat-messages-log"></div>'
                + '<div class="app-chat-messages-in">'
                  + '<form class="app-chat-messages-form">'
                    + '<input type="text"/>'
                    + '<input type="submit" style="display: none;"/>'
                    + '<div class="app-chat-messages-send">'
                      + 'Send'
                    + '</div>'
                  + '</form>'
                + '</div>'
              + '</div>'
            + '</div>'
          + '</div>',
        settable_map : {
          slider_open_time    : true,
          slider_close_time   : true,
          slider_opened_em    : true,
          slider_closed_em    : true,
          slider_opened_title : true,
          slider_closed_title : true,

          chat_model   : true,
          people_model : true,

          set_chat_anchor : true
        },
        slider_open_time     : 250,
        slider_close_time    : 250,
        slider_opened_em     : 18,
        slider_closed_em     : 2,
        slider_opened_min_em : 10,
        window_height_min_em : 20,
        slider_opened_title  : 'Tap to Close',
        slider_closed_title  : 'Tap to Open',

        chat_model   : null,
        people_model : null,

        set_chat_anchor : null
      },
      stateMap = {
        $append_target   : null,
        position_type    : 'closed',
        px_per_em        : 0,
        slider_hidden_px : 0,
        slider_closed_px : 0,
        slider_opened_px : 0
      },
      jQueryMap = {},
      setjQueryMap, setPxSizes, scrollChat, writeChat, writeAlert,
      clearChat, setSliderPosition, onTapToggle, onSubmitMsg, onTapList,
      onSetchatee, onUpdatechat, onListchange, onLogin, onLogout,
      configModule, initModule, removeSlider, handleResize;

  setjQueryMap = function () {
    var $append_target = stateMap.$append_target,
        $slider = $append_target.find('.app-chat');
    jQueryMap = {
      $slider   : $slider,
      $header   : $slider.find('.app-chat-header'),
      $toggle   : $slider.find('.app-chat-header-toggle'),
      $title    : $slider.find('.app-chat-header-title'),
      $sizer    : $slider.find('.app-chat-sizer'),
      $list_box : $slider.find('.app-chat-list-box'),
      $msg_log  : $slider.find('.app-chat-messages-log'),
      $msg_in   : $slider.find('.app-chat-messages-in'),
      $input    : $slider.find('.app-chat-messages-in input[type=text]'),
      $send     : $slider.find('.app-chat-messages-send'),
      $form     : $slider.find('.app-chat-messages-form'),
      $window   : $(window)
    };
  };

  setPxSizes = function () {
    var px_per_em, window_height_em, opened_height_em;
    px_per_em = app.util_browser.getEmSize(jQueryMap.$slider.get(0));
    window_height_em = Math.floor(
      (jQueryMap.$window.height() / px_per_em) + 0.5
    );
    opened_height_em =
      (window_height_em > configMap.window_height_min_em) ?
      configMap.slider_opened_em :
      configMap.slider_opened_min_em;

    stateMap.px_per_em = px_per_em;
    stateMap.slider_closed_px = configMap.slider_closed_em * px_per_em;
    stateMap.slider_opened_px = opened_height_em * px_per_em;
    jQueryMap.$sizer.css({
      height : (opened_height_em - 2) * px_per_em
    });
  };

  setSliderPosition = function (position_type, callback) {
    var height_px, animate_time, slider_title, toggle_text;

    if (position_type === 'opened' &&
        configMap.people_model.get_user().get_is_anonymous()) {
      return false;
    }

    if (stateMap.position_type === position_type) {
      if (position_type === 'opened') {
        jQueryMap.$input.focus();
      }
      return true;
    }

    switch (position_type) {
      case 'opened' :
        height_px    = stateMap.slider_opened_px;
        animate_time = configMap.slider_open_time;
        slider_title = configMap.slider_closed_title;
        toggle_text  = '=';
        jQueryMap.$input.focus();
        break;
      case 'hidden' :
        height_px    = 0;
        animate_time = configMap.slider_open_time;
        slider_title = '';
        toggle_text  = '+';
        break;
      case 'closed' :
        height_px    = stateMap.slider_closed_px;
        animate_time = configMap.slider_close_time;
        slider_title = configMap.slider_closed_title;
        toggle_text  = '+';
        break;
      default :
        return false;
    }

    stateMap.position_type = '';
    jQueryMap.$slider.animate(
      { height : height_px },
      animate_time,
      function () {
        jQueryMap.$toggle.prop('title', slider_title);
        jQueryMap.$toggle.text(toggle_text);
        stateMap.position_type = position_type;
        if (callback) {
          callback(jQueryMap.$slider);
        }
      }
    );
    return true;
  };

  scrollChat = function () {
    var $msg_log = jQueryMap.$msg_log;
    $msg_log.animate({
      scrollTop : $msg_log.prop('scrollHeight') - $msg_log.height()
    }, 150);
  };

  writeChat = function (person_name, text, is_user) {
    var msg_class = (is_user) ?
      'app-chat-messages-log-me' :
      'app-chat-messages-log-message';

    jQueryMap.$msg_log.append(
      '<div class="' + msg_class + '">'
      + app.util_browser.encodeHtml(person_name) + ': '
      + app.util_browser.encodeHtml(text) + '</div>'
    );

    scrollChat();
  };

  writeAlert = function (alert_text) {
    jQueryMap.$msg_log.append(
      '<div class="app-chat-messages-log-alert">'
        + app.util_browser.encodeHtml(alert_text)
      + '</div>'
    );

    scrollChat();
  };

  clearChat = function () {
    jQueryMap.$msg_log.empty();
  };

  onTapToggle = function () {
    var set_chat_anchor = configMap.set_chat_anchor;

    if (stateMap.position_type === 'opened') {
      set_chat_anchor('closed');
    } else if (stateMap.position_type === 'closed') {
      set_chat_anchor('opened');
    }
    return false;
  };

  onSubmitMsg = function () {
    var msg_text = jQueryMap.$input.val();

    if (msg_text.trim() === '') {
      return false;
    }

    configMap.chat_model.send_msg(msg_text);
    jQueryMap.$input.focus();
    jQueryMap.$send.addClass('app-x-select');
    setTimeout(function () {
      jQueryMap.$send.removeClass('app-x-select');
    }, 250);

    return false;
  };

  onTapList = function (event) {
    var $tapped = $(event.elem_target), chatee_id;

    if (!$tapped.hasClass('app-chat-list-name')) {
      return false;
    }

    chatee_id = $tapped.attr('data-id');

    if (!chatee_id) {
      return false;
    }

    configMap.chat_model.set_chatee(chatee_id);

    return false;
  };

  onSetchatee = function (event, arg_map) {
    var new_chatee = arg_map.new_chatee,
        old_chatee = arg_map.old_chatee;

    jQueryMap.$input.focus();

    if (!new_chatee) {
      if (old_chatee) {
        writeAlert(old_chatee.name + ' has left the chat.');
      } else {
        writeAlert('Your friend has left the chat.');
      }

      jQueryMap.$title.text('Chat');

      return false;
    }

    jQueryMap.$list_box
      .find('.app-chat-list-name')
      .removeClass('app-x-select')
      .end()
      .find('[data-id=' + arg_map.new_chatee.id + ']')
      .addClass('app-x-select');

    writeAlert('Now chatting with ' + arg_map.new_chatee.name);
    jQueryMap.$title.text('Chat with ' + arg_map.new_chatee.name);
    return true;
  };

  onListchange = function () {
    var list_html = String(),
        people_db  = configMap.people_model.get_db(),
        chatee     = configMap.chat_model.get_chatee();

    people_db().each(function (person, idx) {
      var select_class = '';

      if (person.get_is_anonymous() || person.get_is_user()) {
        return true;
      }

      if (chatee && chatee.id === person.id) {
        select_class = ' app-x-select';
      }

      list_html
        += '<div class="app-chat-list-name'
        + select_class + '" data-id="' + person.id + '">'
        + app.util_browser.encodeHtml(person.name) + '</div>';
    });

    if (!list_html) {
      list_html = String()
        + '<div class="app-chat-list-note">'
          + 'No one is online'
        + '</div>';
      clearChat();
    }

    jQueryMap.$list_box.html(list_html);
  };

  onUpdatechat = function (event, msg_map) {
    var is_user,
        sender_id = msg_map.sender_id,
        msg_text  = msg_map.msg_text,
        chatee    = configMap.chat_model.get_chatee() || {},
        sender    = configMap.people_model.get_by_cid(sender_id);

    if (!sender) {
      writeAlert(msg_text);
      return false;
    }

    is_user = sender.get_is_user();

    if (!(is_user || sender_id === chatee.id)) {
      configMap.chat_model.set_chatee(sender_id);
    }

    writeChat(sender.name, msg_text, is_user);

    if (is_user) {
      jQueryMap.$input.val('');
      jQueryMap.$input.focus();
    }
  };

  onLogin = function (event, login_user) {
    configMap.set_chat_anchor('opened');
  };

  onLogout = function (event, logout_user) {
    configMap.set_chat_anchor('closed');
    jQueryMap.$title.text('Chat');
    clearChat();
  };

  configModule = function (input_map) {
    app.util.setConfigMap({
      input_map    : input_map,
      settable_map : configMap.settable_map,
      config_map   : configMap
    });
    return true;
  };

  initModule = function ($append_target) {
    var $list_box;

    stateMap.$append_target = $append_target;
    $append_target.append(configMap.main_html);
    setjQueryMap();
    setPxSizes();

    jQueryMap.$toggle.prop('title', configMap.slider_closed_title);
    stateMap.position_type = 'closed';

    $list_box = jQueryMap.$list_box;
    $.gevent.subscribe($list_box, 'app-listchange', onListchange);
    $.gevent.subscribe($list_box, 'app-setchatee',  onSetchatee);
    $.gevent.subscribe($list_box, 'app-updatechat', onUpdatechat);
    $.gevent.subscribe($list_box, 'app-login',      onLogin);
    $.gevent.subscribe($list_box, 'app-logout',     onLogout);

    jQueryMap.$header.bind('utap', onTapToggle);
    jQueryMap.$list_box.bind('utap', onTapList);
    jQueryMap.$send.bind('utap', onSubmitMsg);
    jQueryMap.$form.bind('submit', onSubmitMsg);
  };

  removeSlider = function () {
    if (jQueryMap.$slider) {
      jQueryMap.$slider.remove();
      jQueryMap = {};
    }
    stateMap.$append_target = null;
    stateMap.position_type = 'closed';

    configMap.chat_model      = null;
    configMap.people_model    = null;
    configMap.set_chat_anchor = null;

    return true;
  };

  handleResize = function () {
    if (!jQueryMap.$slider) {
      return false;
    }

    setPxSizes();

    if (stateMap.position_type === 'opened') {
      jQueryMap.$slider.css({
        height : stateMap.slider_opened_px
      });
    }

    return true;
  };

  return {
    setSliderPosition : setSliderPosition,
    configModule      : configModule,
    initModule        : initModule,
    removeSlider      : removeSlider,
    handleResize      : handleResize
  };
}());