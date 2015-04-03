/*jslint        browser : true, continue : true,
 devel  : true,  indent : 2,      maxerr : 50,
 newcap : true,   nomen : true, plusplus : true,
 regexp : true,  sloppy : true,     vars : false,
 white  : true
 */
/*global TAFFY, $, app */
app.model = (function () {
  'use strict';

  var configMap = {
        anonymous_id : 'a0'
      },
      stateMap = {
        anonymous_user : null,
        cid_serial     : 0,
        people_cid_map : {},
        people_db      : TAFFY(),
        user           : null
      },
      isFakeData = true,
      personProto, makeCid, clearPeopleDb, completeLogin,
      makePerson, removePerson, people, initModule;

  personProto = {
    get_is_user : function () {
      return (this.cid === stateMap.user.cid);
    },
    get_is_anonymous : function () {
      return (this.cid === stateMap.anonymous_user.cid);
    }
  };

  makeCid = function () {
    return 'c' + String(stateMap.cid_serial++);
  };

  clearPeopleDb = function () {
    var user                = stateMap.user;
    stateMap.people_db      = TAFFY();
    stateMap.people_cid_map = {};

    if (user) {
      stateMap.people_db.insert(user);
      stateMap.people_cid_map[user.cid] = user;
    }
  };

  completeLogin = function (user_list) {
    var user_map                          = user_list[0];
    delete stateMap.people_cid_map[user_map.cid];
    stateMap.user.cid                     = user_map._id;
    stateMap.user.id                      = user_map._id;
    stateMap.user.css_map                 = user_map.css_map;
    stateMap.people_cid_map[user_map._id] = stateMap.user;

    $.gevent.publish('app-login', [stateMap.user]);
  };

  makePerson = function (person_map) {
    var person,
        cid     = person_map.cid,
        css_map = person_map.css_map,
        id      = person_map.id,
        name    = person_map.name;

    if (cid === undefined || !name) {
      throw  'Client ID and name are required.';
    }

    person         = Object.create(personProto);
    person.cid     = cid;
    person.name    = name;
    person.css_map = css_map;

    if (id) {
      person.id = id;
    }

    stateMap.people_cid_map[cid] = person;

    stateMap.people_db.insert(person);
    return person;
  };

  removePerson = function (person) {
    if (!person) {
      return false;
    }

    if (person.id === configMap.anonymous_id) {
      return false;
    }

    stateMap.people_db({ cid : person.cid }).remove();

    if (person.cid) {
      delete  stateMap.people_cid_map[person.cid];
    }

    return true;
  };

  people = (function () {
    var get_by_cid, get_db, get_user, login, logout;

    get_by_cid = function (cid) {
      return stateMap.people_cid_map[cid];
    };

    get_db = function () {
      return stateMap.people_db;
    };

    get_user = function () {
      return stateMap.user;
    };

    login = function (name) {
      var socketIo = (isFakeData) ? app.fake.mockSocketIo : app.data.getSocketIo();

      stateMap.user = makePerson({
        cid     : makeCid(),
        css_map : { top : 25, left : 25, 'background-color' : '#8f8' },
        name    : name
      });

      socketIo.on('userupdate', completeLogin);

      socketIo.emit('adduser', {
        cid     : stateMap.user.cid,
        css_map : stateMap.user.css_map,
        name    : stateMap.user.name
      });
    };

    logout = function () {
      var is_removed,
          user = stateMap.user;

      is_removed    = removePerson(user);
      stateMap.user = stateMap.anonymous_user;

      $.gevent.publish('app-logout', [user]);
      return is_removed;
    };

    return {
      get_by_cid : get_by_cid,
      get_db     : get_db,
      get_user   : get_user,
      login      : login,
      logout     : logout
    };
  }());

  initModule = function () {
    var i, people_list, person_map;

    stateMap.anonymous_user = makePerson({
      cid  : configMap.anonymous_id,
      id   : configMap.anonymous_id,
      name : 'Anonymous'
    });

    stateMap.user = stateMap.anonymous_user;

    if (isFakeData) {
      people_list = app.fake.getPeopleList();
      for (i = 0; i < people_list.length; i++) {
        person_map = people_list[i];
        makePerson({
          cid     : person_map._id,
          css_map : person_map.css_map,
          id      : person_map._id,
          name    : person_map.name
        });
      }
    }
  };

  return {
    initModule : initModule,
    people     : people
  };
}());