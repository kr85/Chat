/*jslint           node : true, continue : true,
 devel  : true,  indent : 2,      maxerr : 50,
 newcap : true,   nomen : true, plusplus : true,
 regexp : true,  sloppy : true,     vars : false,
 white  : true
 */
/*global $, app */

// Third-party modules and globals
global.jQuery = require('jquery');
global.TAFFY  = require('./client/js/lib/taffy.js').taffy;
global.$      = global.jQuery;
require('./client/js/lib/jquery.event.gevent.js');

// App modules and globals
global.app = null;
require('./client/js/app.js');
require('./client/js/app.util.js');
require('./client/js/app.fake.js');
require('./client/js/app.data.js');
require('./client/js/app.model.js');

    // Utility and handlers
var makePeopleStr, onLogin, onListchange,
    onSetchatee, onUpdatechat, onLogout,

    // Test functions
    testInitialState, loginAsClark, testUserAndPeople,
    testLanaMsg, sendLexMsg, testMsgToLex, testLexResponse,
    updateLexAvatar, testLexAvatar, logoutAsClark, testLogoutState,

    // Event handlers
    loginEvent, changeEvent, chateeEvent, msgEvent, logoutEvent,
    loginData, changeData, msgData, chateeData, logoutData,

    // Indexes
    changeIdx = 0, chateeIdx = 0, msgIdx = 0,

    // Deferred objects
    $deferLogin      = $.Deferred(),
    $deferChangeList = [$.Deferred()],
    $deferChateeList = [$.Deferred()],
    $deferMsgList    = [$.Deferred()],
    $deferLogout     = $.Deferred();

// Utility to make a string of online person names
makePeopleStr = function (people_db) {
  var people_list = [];

  people_db().each(function (person, idx) {
    people_list.push(person.name);
  });
  return people_list.sort().join(',');
};

// Event handler for 'app-login'
onLogin = function (event, arg) {
  loginEvent = event;
  loginData  = arg;
  $deferLogin.resolve();
};

// Event handler for 'app-listchange'
onListchange = function (event, arg) {
  changeEvent = event;
  changeData  = arg;
  $deferChangeList[changeIdx].resolve();
  changeIdx++;
  $deferChangeList[changeIdx] = $.Deferred();
};

// Event handler for 'app-updatechat'
onUpdatechat = function (event, arg) {
  msgEvent = event;
  msgData  = arg;
  $deferMsgList[msgIdx].resolve();
  msgIdx++;
  $deferMsgList[msgIdx] = $.Deferred();
};

// Event handler for 'app-setchatee'
onSetchatee = function (event, arg) {
  chateeEvent = event;
  chateeData  = arg;
  console.log(chateeData);
  $deferChateeList[chateeIdx].resolve();
  chateeIdx++;
  $deferChateeList[chateeIdx] = $.Deferred();
};

// Event handler for 'app-logout'
onLogout = function (event, arg) {
  logoutEvent = event;
  logoutData  = arg;
  $deferLogout.resolve();
};

// Test cases
testInitialState = function (test) {
  var $t, user, people_db, people_str, test_str;
  test.expect(2);

  // Initialize the chat app
  app.initModule(null);
  app.model.setDataMode('fake');

  // Create a jQuery object
  $t = $('<div/>');

  // Subscribe functions to global custom events
  $.gevent.subscribe($t, 'app-login',      onLogin);
  $.gevent.subscribe($t, 'app-listchange', onListchange);
  $.gevent.subscribe($t, 'app-setchatee',  onSetchatee);
  $.gevent.subscribe($t, 'app-updatechat', onUpdatechat);
  $.gevent.subscribe($t, 'app-logout',     onLogout);

  // Test the user in the initial state
  user     = app.model.people.get_user();
  test_str = 'User is anonymous.';
  test.ok(user.get_is_anonymous(), test_str);

  // Test the list of online people
  test_str   = 'Expected user only contains anonymous.';
  people_db  = app.model.people.get_db();
  people_str = makePeopleStr(people_db);
  test.ok(people_str === 'Anonymous', test_str);

  // Proceed to next test without blocking
  test.done();
};

loginAsClark = function (test) {
  var user, people_db, people_str, test_str;
  test.expect(6);

  // Login as 'Clark'
  app.model.people.login('Clark');
  test_str = 'Log in as Clark';
  test.ok(true, test_str);

  // Test user attributes before login completes
  user     = app.model.people.get_user();
  test_str = 'User is no longer anonymous.';
  test.ok(!user.get_is_anonymous(), test_str);

  test_str = 'User name is "Clark"';
  test.ok(user.name === 'Clark', test_str);

  test_str = 'User id is undefined as login is incomplete.';
  test.ok(!user.id, test_str);

  test_str = 'User cid is c0';
  test.ok(user.cid === 'c0', test_str);

  test_str   = 'User list is as expected.';
  people_db  = app.model.people.get_db();
  people_str = makePeopleStr(people_db);
  test.ok(people_str === 'Anonymous,Clark', test_str);

  $.when($deferLogin, $deferChangeList[0])
    .then(test.done);
};

testUserAndPeople = function (test) {
  var user, cloned_user, people_db, people_str, user_str, test_str;
  test.expect(4);

  // Test user attributes
  test_str = 'Login as Clark complete';
  test.ok(true, test_str);

  user = app.model.people.get_user();
  test_str = 'Clark has expected attributes';
  cloned_user = $.extend(true, {}, user);

  delete cloned_user.___id;
  delete cloned_user.___s;
  delete cloned_user.get_is_anonymous;
  delete cloned_user.get_is_user;

  test.deepEqual(
    cloned_user,
    {
      cid     : 'id_5',
      css_map : { top: 25, left: 25, 'background-color': '#8f8' },
      id      : 'id_5',
      name    : 'Clark'
    },
    test_str
  );

  // Test the list of online people
  test_str = 'Receipt of listchange complete.';
  test.ok(true, test_str);

  people_db  = app.model.people.get_db();
  people_str = makePeopleStr(people_db);
  user_str   = 'Chloe,Clark,Lana,Lex,Lois';
  test_str   = 'User list provided is expected - ' + user_str;

  test.ok(people_str === user_str, test_str);

  $.when($deferMsgList[0], $deferChateeList[0])
    .then(test.done());
};

testLanaMsg = function (test) {
  var test_str;
  test.expect(4);

  // Test message received from 'Lana'
  test_str = 'Message is as expected.';
  test.deepEqual(
    msgData,
    {
      dest_id   : 'id_5',
      dest_name : 'Clark',
      sender_id : 'id_4',
      msg_text  : 'Hi there Clark! Lana here.'
    },
    test_str
  );

  // Test chatee attributes
  test.ok(chateeData.new_chatee.cid  === 'id_4');
  test.ok(chateeData.new_chatee.id   === 'id_4');
  test.ok(chateeData.new_chatee.name === 'Lana');

  // Proceed to next test without blocking
  test.done();
};

sendLexMsg = function (test) {
  var test_str, chatee;
  test.expect(1);

  // Set chatee to 'Lex'
  app.model.chat.set_chatee('id_2');

  // Send message to 'Lex'
  app.model.chat.send_msg('Hows it going?');

  // Test get_chatee() results
  chatee   = app.model.chat.get_chatee();
  test_str = 'Chatee is as expected.';
  test.ok(chatee.name === 'Lex', test_str);

  $.when($deferMsgList[1], $deferChateeList[1])
    .then(test.done());
};

testMsgToLex = function (test) {
  var test_str;
  test.expect(2);

  // Test the chatee attributes
  test_str = 'Lex is the chatee name.';
  test.ok(chateeData.new_chatee.name === 'Lex', test_str);

  // Test sending message
  test_str = 'Message change is as expected.';
  test.ok(msgData.msg_text === 'Hows it going?', test_str);

  $deferMsgList[2].done(test.done());
};

testLexResponse = function (test) {
  var test_str;
  test.expect(1);

  // Test the message received from 'Lex'
  test_str = 'Message is as expected.';
  test.deepEqual(
    msgData,
    {
      dest_id   : 'id_5',
      dest_name : 'Clark',
      sender_id : 'id_2',
      msg_text  : 'Been good, Clark.'
    },
    test_str
  );

  // Proceed to next text without blocking
  test.done();
};

updateLexAvatar = function (test) {
  test.expect(0);

  // Call update_avatar method
  app.model.chat.update_avatar({
    person_id : 'id_2',
    css_map : {
      'top'              : 10,
      'left'             : 100,
      'background-color' : '#ff0'
    }
  });

  $deferChangeList[1].done(test.done());
};

testLexAvatar = function (test) {
  var chatee, test_str;
  test.expect(1);

  // Get 'Lex' person object using get_chatee method
  chatee = app.model.chat.get_chatee();

  // Test avatar details for 'Lex'
  test_str = 'Avatar details updated.';
  test.deepEqual(
    chatee.css_map,
    {
      top                : 10,
      left               : 100,
      'background-color' : '#ff0'
    },
    test_str
  );

  // Proceed to next text without blocking
  test.done();
};

logoutAsClark = function (test) {
  test.expect(0);

  // Logout as 'Clark'
  app.model.people.logout(true);

  // Proceed to next test after logout is done
  $deferLogout.done(test.done());
};

testLogoutState = function (test) {
  var user, people_db, people_str, user_str, test_str;
  test.expect(4);

  test_str = 'Logout as Clark complete';
  test.ok(true, test_str);

  // Test the list of online people
  people_db = app.model.people.get_db();
  people_str = makePeopleStr(people_db);
  user_str = 'Anonymous';
  test_str = 'User list provided is expected - ' + user_str;

  test.ok(people_str === 'Anonymous', test_str);

  // Test user attributes
  user = app.model.people.get_user();
  test_str = 'Current user is anonymous after logout.';
  test.ok(user.get_is_anonymous(), test_str);
  test.ok(true, 'Test complete');

  // Proceed without blocking
  test.done();
};

module.exports = {
  testInitialState  : testInitialState,
  loginAsClark      : loginAsClark,
  testUserAndPeople : testUserAndPeople,
  //testLanaMsg       : testLanaMsg,
  //sendLexMsg        : sendLexMsg,
  //testMsgToLex      : testMsgToLex,
  //testLexResponse   : testLexResponse,
  updateLexAvatar   : updateLexAvatar,
  //testLexAvatar     : testLexAvatar,
  logoutAsClark     : logoutAsClark,
  testLogoutState   : testLogoutState
};