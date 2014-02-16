
/**
 * Module dependencies.
 */

var express = require('express'),
     routes = require('./routes'),
       user = require('./routes/user'),
      movie = require('./routes/movie'),
     rental = require('./routes/rental'),
      stats = require('./routes/statistics'),
      mysql = require('mysql'),
       http = require('http'),
       path = require('path');
      

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('dev' == app.get('env')) {
  app.use(express.errorHandler());
}

app.enable('verbose errors');

// disable them in production
// use $ NODE_ENV=production node app
if ('production' == app.settings.env) {
  app.disable('verbose errors');
}


// Basic protection!
var auth = express.basicAuth(function(user, pass) {     
     return (user == "root" && pass == "root") ? true : false;
});



/***************/
// var allowCrossDomain = function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, X-XSRF-TOKEN');
//   next();
// }
// app.use(allowCrossDomain);
/***************/

/************/
/** ROUTES **/
/************/

/***** ROOT *****/
app.get('/', auth, routes.index);


/************************************ USER ****/

// precondition function:
// Parsing the user Id in the url parameters
app.param('userId', function(req, res, next){
  var Id = parseInt(req.params.userId, 10);
  if (Id) {
    req.userId = Id;
    next();
  } else {
    next(new Error('failed to load user'));
  }
});


//List of users
app.get('/users',auth, user.list);
app.get('/api/users', auth, user.list); //json
//Create new user
app.get('/users/new',auth, user.add);
//Add user to db
app.post('/users',auth, user.new);
app.post('/api/users/',auth, user.apinew);//json
//Show single user
app.get('/users/:userId',auth, user.getuser);
app.get('/api/users/:userId',auth, user.apigetuser);//json
//Edit user info
app.get('/users/:userId/edit',auth, user.edit);
//Update user changes to db
app.put('/users/:userId',auth, user.update);
app.put('/api/users/:userId',auth, user.apiupdate);//json
//Delete user
app.delete('/users/:userId',auth, user.delete);
app.delete('/api/users/:userId',auth, user.apidelete);//json
//Search User for JSON API
app.get('/api/users/', auth, user.search);


/************************************ MOVIE ****/
// precondition function:
// Parsing the movie Id in the url parameters
app.param('movieId', function(req, res, next){
  var Id = parseInt(req.params.movieId, 10);
  if (Id) {
    req.movieId = Id;
    next();
  } else {
    next(new Error('failed to load movie'));
  }
});

//List of movies
app.get('/movies',auth, movie.list);
//Create new movie
app.get('/movies/new',auth, movie.add);
//Add movie to db
app.post('/movies', auth,movie.new);
//Show single movie
app.get('/movies/:movieId', auth,movie.getmovie);
//Edit movie info
app.get('/movies/:movieId/edit',auth, movie.edit);
//Update movie changes to db
app.put('/movies/:movieId',auth, movie.update);
//Delete movie
app.delete('/movies/:movieId',auth, movie.delete);


/************************************ RENTAL ****/
// precondition function:
// Parsing the movie Id in the url parameters
app.param('rentalId', function(req, res, next){
  var Id = parseInt(req.params.rentalId, 10);
  if (Id) {
    req.rentalId = Id;
    next();
  } else {
    next(new Error('failed to load rental'));
  }
});
//List of rentals
app.get('/rentals',auth, rental.list);
//Hire a movie
app.get('/rentals/new',auth, rental.add);
//Add new hire to db
app.post('/rentals',auth, rental.new);
//Show single rental --> no need at the moment!
app.get('/rentals/:rentalId',auth, rental.getrental);
//Edit rental info --> no need at the moment!
app.get('/rentals/:rentalId/edit',auth, rental.edit);
//Update rental changes to db 
app.put('/rentals/:rentalId',auth, rental.update);
//Delete rental --> No need!!
//app.delete('/rentals/:rentalId', rental.delete);

/************************************ STATISTICS ****/
//List of statistics
app.get('/stats',auth, stats.list);
app.get('/stats/income',auth, stats.income);
app.get('/stats/topmovie',auth, stats.topmovie);
app.get('/stats/topuser',auth, stats.topuser);
app.get('/stats/topcat',auth, stats.topcat);
app.get('/stats/10plus',auth, stats.tenplus);
app.get('/stats/hiredmovie',auth, stats.hiredmovie);



//console.log(app.routes)

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
