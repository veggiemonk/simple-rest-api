var mysql = require('mysql');
var config = require("../config");
var db = config.mysqldb;
//connect to mysql database
var cnx = mysql.createConnection({
  host : db.host,
  user : db.user,
  password : db.password,
  database : db.database
});

try{
  cnx.connect();
}catch(e){
  console.log(e);
}

/**
* HTTP GET /api/movies
* Returns: 
*     - The list of movies in JSON format if accessed from "/api/movies/" URL
*     - The list of movies in HTML format if accessed from the /movies/
*/
exports.list = function(req, res){
  //console.log(req.query);
  var q_search = req.query.search;
  var q_sql = "";
  if (q_search) q_sql = "SELECT * FROM MOVIES WHERE NAME LIKE '%"+ q_search +"%' ; " 
  else q_sql = "SELECT * FROM MOVIES;"
  var query = cnx.query(q_sql, function(err, result) {
    if (err) res.status('404').json(err);
    else {
      if(result){
        if (req.path.indexOf("api") !== -1 ) res.json(result);
        else res.render('movies/list', {title: "All Movies", movies: result});
      }
    }
  });
};

/**
* HTTP POST /api/search/movies
* Body Parameter: :name = (partial) name of the movies
* Returns: The list of movies containing the parameter in JSON
*/
exports.search = function(req, res){
  //var data = [];
  var q_sql = "SELECT * FROM MOVIES WHERE NAME LIKE '%"+ req.body.name +"%' ; ";
  var query = cnx.query(q_sql, function(err, result) {
    if (err) res.status('404').json(err);
    else res.json(result);
    });
}

exports.add = function (req, res){
  res.render('movies/new');
};

exports.new = function (req, res){
  var name = req.body.name; // TODO: security "Careful SQL injection!!!"
  cnx.query('INSERT INTO `MOVIES` (name) VALUES (?);', [name], function(err, result) {
    // TODO: improve with 404 page and timed redirect 5s.
    if (err) {
      res.json(err);
    }else{
      if (result) res.redirect('/movies/'+ result.insertId + '/edit');
      else res.status('404').redirect('/movies');
    }
  });
};

/**
* HTTP POST /api/movies/
* Body Parameters: "name", "category" and "price" of the movie to be created
* Returns: 200 HTTP code: "Created movie :name with id = :id, 
*                         the category = :category and price = :price"
* Error: 500 HTTP code with result from query
*/
exports.apinew = function (req, res){
  var data = [req.body.name, req.body.category, req.body.price]; // TODO: security "Careful SQL injection!!!"
  //console.log(data);
  var q_sql = 'INSERT INTO MOVIES (name, category, price) VALUES (?,?,?);';
  var query = cnx.query(q_sql, data, function(err, result) {
    //console.log(query.sql);
    if (err) res.status('404').json(err);
    else{
      if (result) res.json('Created movie '+data[0]+' with id = '+ result.insertId +', the category = '+ data[1] +' and price ='+ data[2]);
      else res.status('500').send("Error: DB returned = " + result);
    }
  });
};


exports.getmovie = function (req, res){
  var id = req.movieId;
  var q_sql = "SELECT * FROM MOVIES WHERE id_movie = ?;";
  /*  var q_sql = " SELECT u.name AS USER, u.id_user, m.id_movie, m.name, m.price, m.category \
                FROM movies m, rentals r, users u \
                WHERE u.id_user = r.id_user \
                AND r.id_movie = m.id_movie \
                AND m.id_movie = ? \
                GROUP BY u.id_user;";*/

  var query = cnx.query(q_sql, [id], function(err, result) {
    //console.log(query.sql);
    if (err) res.status('404').json(err);
    else {
      if (result) res.render('movies/single', {title: "Movie Information", results: result});
      else res.status('404').redirect('/movies');
    }
  });
};

/**
* HTTP GET /api/movie/:id_movie
* Parameter: :id_movie is the unique identifier of the movie to retrieve
* Returns: the movie information with the specified :id_movie in a JSON format
* Error: - Error from the database in JSON format
*        - 404 HTTP code if movie not exist
*/
exports.apigetmovie = function (req, res){
  var id = req.movieId;
  var q_sql = "SELECT * FROM MOVIES WHERE id_movie = ?;";
  var query = cnx.query(q_sql, [id], function(err, result) {
    //console.log(query.sql);
    if (err) res.status('404').json(err); 
    else{
      if (result.length != 0) res.json(result);
      else res.status('404').send("Not Found");
    }
  });
};


exports.edit = function (req, res){
  var id = req.movieId;
  cnx.query('SELECT * FROM `MOVIES` where id_movie = ?', [id], 
    function(err, movies) {
      if (err) res.status('404').json(err);
      else {
        if (movies) res.render('movies/edit', { movie: movies[0]});
        else res.status('404').redirect('/movies');
      }
    }
  ); 
};

exports.update = function (req, res){
  var movie = [ 
    req.body.name, 
    req.body.price,
    req.body.category,
    req.params.movieId // movie[3] for redirect
  ];
  var query = cnx
    .query('UPDATE `MOVIES` SET name = ?, price = ?, category = ? WHERE id_movie = ?', movie, 
    function(err, result) {
      if (err) res.res.status('404').json(err);
    });
  //console.log(query.sql); 
  res.redirect('movies/'+ movie[3]); 
};

/**
* HTTP PUT /api/movies/:movieId
* Parameters: id of the movie
* Body Parameter: the JSON movie (name, category, price) to update
* Returns: 200 HTTP code: Movie Updated
* Error: 404 HTTP code 
*/
exports.apiupdate = function (req, res){
  var movie = [ 
    req.body.name, 
    req.body.category,
    req.body.price,
    req.movieId
  ];
  //console.log(usr);
  var query = cnx.query('UPDATE `MOVIES` SET name = ?, category = ?, price = ? WHERE id_movie = ?', movie, 
    function(err, result) {
      if (err) res.status('404').json(err); 
      else res.status('200').send("Movie Updated");
    }); 
};

exports.delete = function (req, res){
  var id = req.params.movieId; 
  var query = cnx.query('DELETE FROM `MOVIES` WHERE `id_movie` = ?', id,
    function(err, result) {
      if (err) res.json(err);
      else {
        if (result) res.redirect('movies/');
        else res.status('404').redirect('/movies');
      }
    });
  //console.log(query.sql); 
};

/**
* HTTP DELETE /api/movies/:movieId
* Parameters: movie ID to delete
* Returns: 200 HTTP code: Movie Deleted
* Error: 404 HTTP code
*/
exports.apidelete = function (req, res){
  var id = req.params.movieId;
  if (id){
    var query = cnx.query('DELETE FROM `MOVIES` WHERE id_movie = ?', id,
      function(err, result) {
        if (err) res.status('404').json(err);
        else res.status('200').send("Movie Deleted");
      });
  }else res.status('404').send("Wrong parameters!");
};
