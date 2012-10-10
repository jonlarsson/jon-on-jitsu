/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  http = require('http'),
  path = require('path'),
  url = require('url'),
  auth = require('connect-auth'),
  mongoose = require('mongoose'),
  MongoStore = require('connect-mongo')(express),
  db;

var app = express();

var example_auth_middleware = function () {
  return function (req, res, next) {
    var urlp = url.parse(req.originalUrl, true)
    if (urlp.query.login_with && !req.isAuthenticated()) {
      req.authenticate([urlp.query.login_with], function (error, authenticated) {
        if (error) {
          // Something has gone awry, behave as you wish.
          console.log(error);
          res.end();
        }
        else {
          if (authenticated === undefined) {
            // The authentication strategy requires some more browser interaction, suggest you do nothing here!
          }
          else {
            // We've either failed to authenticate, or succeeded (req.isAuthenticated() will confirm, as will the value of the received argument)
            next();
          }
        }
      });
    }
    else {
      next();
    }
  }
};

app.configure(function () {
  app.set('connstring', 'mongodb://alex.mongohq.com:10081/jitsusessions');
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session({
    secret:'topsecret',
    store:new MongoStore({ url:app.set('connstring'), password:'jitsu', username:'jitsu' })
  }));
  app.use(auth({
    strategies:[
      auth.Facebook({
        appId:'358907717530380',
        appSecret:'431fe6d58273c4439d1f9b828d122791',
        scope:"email",
        callback:'https://jonlarsson.nodejitsu.com/auth/facebook_callback'
      })
    ],
    trace:true,
    logoutHandler:require("connect-auth/lib/events").redirectOnLogout("/")}));
  app.use(example_auth_middleware());
  app.use('/logout', function (req, res, params) {
    req.logout(); // Using the 'event' model to do a redirect on logout.
  });

  app.use('/api/user', function(req, res) {
     if (req.isAuthenticated()) {
       res.send(req.getAuthDetails().user);
     } else {
       res.send({user : "unauthenticated"});
     }
  });
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

http.createServer(app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});
