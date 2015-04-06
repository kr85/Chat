/*jslint        browser : true, continue : true,
 devel  : true,  indent : 2,      maxerr : 50,
 newcap : true,   nomen : true, plusplus : true,
 regexp : true,  sloppy : true,     vars : false,
 white  : true
 */
/*global $, io, app */

app.data = (function () {
  'use strict';

  var stateMap = { sio : null },
      makeSocketIo, getSocketIo, initModule;

  makeSocketIo = function () {
    var socket = io.connect('/chat');

    return {
      emit : function (event_name, data) {
        socket.emit(event_name, data);
      },
      on : function (event_name, callback) {
        socket.on(event_name, function () {
          callback(arguments);
        });
      }
    };
  };

  getSocketIo = function () {
    if (!stateMap.sio) {
      stateMap.sio = makeSocketIo();
    }
    return stateMap.sio;
  };

  initModule = function () {};

  return {
    getSocketIo : getSocketIo,
    initModule  : initModule
  };
}());