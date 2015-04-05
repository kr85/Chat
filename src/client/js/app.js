/*jslint        browser : true, continue : true,
 devel  : true,  indent : 2,      maxerr : 50,
 newcap : true,   nomen : true, plusplus : true,
 regexp : true,  sloppy : true,     vars : false,
 white  : true
 */
/*global $, app:true */
app = (function () {
  'use strict';

  var initModule = function ($container) {
    app.data.initModule();
    app.model.initModule();
    if (app.shell && $container) {
      app.shell.initModule($container);
    }
  };

  return {
    initModule : initModule
  };
}());