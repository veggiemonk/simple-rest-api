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

cnx.connect();


exports.list = function(req, res){
  //console.log(req.query);
  var q_search = req.query.search;
  var q_sql = "";
  if (q_search) q_sql = "SELECT * FROM MOVIES WHERE NAME LIKE '%"+ q_search +"%' ; " 
  else q_sql = "SELECT * FROM MOVIES;"
  var query = cnx.query(q_sql, function(err, rows) {
    //console.log(query.sql);
    if (err) res.json(err);
    res.render('movies/list', {title: "All Movies", movies: rows});
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
    if (err) res.json(err);
    // If movie does not exist in db --> redirect to /movies with status 404
    // TODO: improve with 404 page and timed redirect 5s.
    //console.log(result);
    if (result) res.render('movies/single', {title: "Movie Information", results: result});
    else res.status('404').redirect('/movies');
  });
};

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

exports.edit = function (req, res){
  var id = req.movieId;
  cnx.query('SELECT * FROM `MOVIES` where id_movie = ?', [id], 
    function(err, movies) {
      if (err) res.json(err);
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
  //console.log(movie);
  var query = cnx
    .query('UPDATE `MOVIES` SET name = ?, price = ?, category = ? WHERE id_movie = ?', movie, 
    function(err, result) {
      if (err) res.json(err);
    });
  //console.log(query.sql); 
  res.redirect('movies/'+ movie[3]); 
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

exports.search = function (req, res){
  var val = req.query.search;
  console.log(val);

  res.send("WHEEE");
}
