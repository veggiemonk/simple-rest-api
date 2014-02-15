
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
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.enable('verbose errors');

// disable them in production
// use $ NODE_ENV=production node app
if ('production' == app.settings.env) {
  app.disable('verbose errors');
}



// FOR FUTURE
// AUTH
//app.all('*', requireAuthentication, loadUser);

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

app.get('/', routes.index);
//List of users
app.get('/users', user.list);
//Create new user
app.get('/users/new', user.add);
//Add user to db
app.post('/users', user.new);
//Show single user
app.get('/users/:userId', user.getuser);
//Edit user info
app.get('/users/:userId/edit', user.edit);
//Update user changes to db
app.put('/users/:userId', user.update);
//Delete user
app.delete('/users/:userId', user.delete);


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
app.get('/movies', movie.list);
//Create new movie
app.get('/movies/new', movie.add);
//Add movie to db
app.post('/movies', movie.new);
//Show single movie
app.get('/movies/:movieId', movie.getmovie);
//Edit movie info
app.get('/movies/:movieId/edit', movie.edit);
//Update movie changes to db
app.put('/movies/:movieId', movie.update);
//Delete movie
app.delete('/movies/:movieId', movie.delete);


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
app.get('/rentals', rental.list);
//Hire a movie
app.get('/rentals/new', rental.add);
//Add new hire to db
app.post('/rentals', rental.new);
//Show single rental --> no need at the moment!
app.get('/rentals/:rentalId', rental.getrental);
//Edit rental info --> no need at the moment!
app.get('/rentals/:rentalId/edit', rental.edit);
//Update rental changes to db 
app.put('/rentals/:rentalId', rental.update);
//Delete rental --> No need!!
//app.delete('/rentals/:rentalId', rental.delete);

/************************************ STATISTICS ****/
//List of statistics
app.get('/stats', stats.list);
app.get('/stats/income', stats.income);
app.get('/stats/topmovie', stats.topmovie);
app.get('/stats/topuser', stats.topuser);
app.get('/stats/topcat', stats.topcat);
app.get('/stats/10plus', stats.tenplus);
app.get('/stats/hiredmovie', stats.hiredmovie);



//console.log(app.routes)

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
