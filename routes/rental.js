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
  var q_search = req.query.search; // TODO : security ! sql injection
  var q_sql = "SELECT m.name AS MOVIE, u.name AS USER, r.cost, r.date, \
                        r.id_user, r.id_movie, r.id \
                FROM RENTALS r, USERS u, MOVIES m \
                WHERE r.id_user = u.id_user \
                AND r.id_movie = m.id_movie ";                
  if (q_search) q_sql += " AND m.name LIKE '%"+ q_search +"%' ; " ;  
  q_sql += " ORDER BY r.date DESC;";
  //TODO Clean up sql query
  cnx.query(q_sql, function(err, result) {
    if (err) res.status('404').json(err);
    else {
      if(result){
        if (req.path.indexOf("api") !== -1 ) res.json(result);
        else res.render('rentals/list', {title: "All rentals", rentals: result});
      }
    }
  });
};

exports.getrental = function (req, res){
  var id = req.rentalId;
  var q_sql = " SELECT m.name AS MOVIE, u.name AS USER, r.cost, r.date, \
                        r.id_user, r.id_movie, r.id \
                FROM RENTALS r, USERS u, MOVIES m \
                WHERE r.id_user = u.id_user \
                AND r.id_movie = m.id_movie \
                AND r.id = ? \
                ORDER BY r.date DESC;";
/*  var q_sql = " SELECT r.id_movie, m.name AS MOVIE, m.category, u.id_user, u.name, u.credit \
                FROM users u, rentals r, movies m \
                WHERE r.id_movie = m.id_movie \
                AND r.id_user = u.id_user \
                AND u.id_user = ? \
                GROUP BY r.id_movie;";*/

  var query = cnx.query(q_sql, [id], function(err, result) {
    //console.log(query.sql);
    if (err) res.json(err); 
    // If rental does not exist in db --> redirect to /rentals with status 404
    // TODO: improve with 404 page and timed redirect 5s.
    if (result) res.render('rentals/single', {title: "Rental Information", results: result});
    else res.status('404').redirect('/rentals');
  });
};

exports.add = function (req, res){
  // TODO: get the credentials from logged user!
  res.render('rentals/new');
};

exports.new = function (req, res){
  // TODO: security "Careful SQL injection!!!"
  var data = [req.body.movie,req.body.user,req.body.price];
  //console.log(data)
  var q_sql = "INSERT INTO `video_rental`.`RENTALS` \
                      (`id_movie`, `id_user`, `cost`, `date`) \
               VALUES ( ?, ?, ?, CURRENT_TIMESTAMP);"
  var query = cnx.query(q_sql, data, function(err, result) {
    //console.log(query.sql);
    if (err) res.json(err);
    else {
      // TODO: improve with 404 page and timed redirect 5s.
      if (result) res.redirect('/rentals');
      else res.status('404').redirect('/rentals');
    }
  });
};



exports.edit = function (req, res){
  var id = req.rentalId;
  var q_sql = " SELECT m.name AS MOVIE, u.name AS USER, r.cost, r.date, \
                        r.id_user, r.id_movie, r.id \
                FROM RENTALS r, USERS u, MOVIES m \
                WHERE r.id_user = u.id_user \
                AND r.id_movie = m.id_movie \
                AND r.id= ? ";
  var query = cnx.query(q_sql, [id], function(err, rentals, fields) {
    console.log(query.sql);
    if (err) res.json(err);
    else{
      if (rentals) res.render('rentals/edit', { rental: rentals[0]});
      else res.redirect('/rentals');
    }
  }); 
};

exports.update = function (req, res){
  var cost = [ 
    req.body.cost, 
    req.params.rentalId // cost[1] for redirect
  ];
  console.log(cost);
  var query = cnx.query('UPDATE RENTALS SET cost = ? WHERE id = ?', cost, 
    function(err, result) {
      if (err) res.json(err); 
    });
  //console.log(query.sql); 
  res.redirect('rentals/' + cost[1] ); 
};
