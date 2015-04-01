/*jslint        browser : true, continue : true,
 devel  : true,  indent : 2,      maxerr : 50,
 newcap : true,   nomen : true, plusplus : true,
 regexp : true,  sloppy : true,     vars : false,
 white  : true
 */
/*global $, app, getComputedStyle */
app.chat = (function () {
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
              + '<div class="app-chat-messages"></div>'
              + '<div class="app-chat-box">'
                + '<input type="text"/>'
                + '<div>Send</div>'
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
        slider_opened_title  : 'Click to close',
        slider_closed_title  : 'Click to open',

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
      setjQueryMap, getEmSize, setPxSizes, setSliderPosition,
      onClickToggle, configModule, initModule, removeSlider, handleResize;

  setjQueryMap = function () {
    var $append_target = stateMap.$append_target,
        $slider = $append_target.find('.app-chat');
    jQueryMap = {
      $slider   : $slider,
      $header   : $slider.find('.app-chat-header'),
      $toggle   : $slider.find('.app-chat-header-toggle'),
      $title    : $slider.find('.app-chat-header-title'),
      $sizer    : $slider.find('.app-chat-sizer'),
      $messages : $slider.find('.app-chat-messages'),
      $box      : $slider.find('.app-chat-box'),
      $input    : $slider.find('.app-chat-box input[type=text]')
    };
  };

  getEmSize = function (element) {
    return Number(
      getComputedStyle(element, '').fontSize.match(/\d*\.?\d*/)[0]
    );
  };

  setPxSizes = function () {
    var px_per_em, window_height_em, opened_height_em;
    px_per_em = getEmSize(jQueryMap.$slider.get(0));
    window_height_em = Math.floor(
      ($(window).height() / px_per_em) + 0.5
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

    if (stateMap.position_type === position_type) {
      return true;
    }

    switch (position_type) {
      case 'opened' :
        height_px    = stateMap.slider_opened_px;
        animate_time = configMap.slider_open_time;
        slider_title = configMap.slider_closed_title;
        toggle_text  = '=';
        break;
      case 'hidden' :
        height_px    = 0;
        animate_time = configMap.slider_open_time;
        slider_title = '';
        toggle_text  = '+'
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

  onClickToggle = function () {
    var set_chat_anchor = configMap.set_chat_anchor;

    if (stateMap.position_type === 'opened') {
      set_chat_anchor('closed');
    } else if (stateMap.position_type === 'closed') {
      set_chat_anchor('opened');
    }
    return false;
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
    $append_target.append(configMap.main_html);
    stateMap.$append_target = $append_target;
    setjQueryMap();
    setPxSizes();

    jQueryMap.$toggle.prop('title', configMap.slider_closed_title);
    jQueryMap.$header.click(onClickToggle);
    stateMap.position_type = 'closed';

    return true;
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