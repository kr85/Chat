/*jslint           node : true, continue : true,
 devel  : true,  indent : 2,      maxerr : 50,
 newcap : true,   nomen : true, plusplus : true,
 regexp : true,  sloppy : true,     vars : false,
 white  : true
 */
/*global $, app */

global.jQuery = require('jquery');
global.TAFFY  = require('./js/lib/taffy.js').taffy;
global.$      = global.jQuery;
require('./js/lib/jquery.event.gevent.js');

global.app = null;
require('./js/app.js');
require('./js/app.util.js');
require('./js/app.fake.js');
require('./js/app.data.js');
require('./js/app.model.js');

app.initModule();
app.model.setDataMode('fake');

var testAccount = function (test) {
  var $t, test_str, user, on_login, $defer = $.Deferred();

  test.expect(1);

  on_login = function () {
    $defer.resolve();
  };

  app.initModule(null);
  app.model.setDataMode('fake');

  $t = $('<div/>');
  $.gevent.subscribe($t, 'app-login', on_login);

  app.model.people.login('Clark');

  user     = app.model.people.get_user();
  test_str = 'User is no longer anonymous.';
  test.ok(!user.get_is_anonymous(), test_str);

  $defer.done(test.done);
};

module.exports = { testAccount : testAccount };