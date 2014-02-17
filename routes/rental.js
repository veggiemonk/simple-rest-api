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
* HTTP GET /api/rentals
* Returns: 
*     - The list of rentals in JSON format if accessed from "/api/rentals/" URL
*     - The list of rentals in HTML format if accessed from the /rentals/
*/
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
    if (err) res.status('404').json(err);
    else {
      // TODO: improve with 404 page and timed redirect 5s.
      if (result) res.redirect('/rentals');
      else res.status('404').redirect('/rentals');
    }
  });
};

/**
* HTTP POST /api/rentals/
* Body Parameters: "id_user", "id_movie" and "cost" of the rental to be created
* Returns: 200 HTTP code: "Rent a movie :id_movie by user = :id_user, 
*                         with a price = :cost"
* Error: 500 HTTP code with result from query
*/
exports.apinew = function (req, res){
  var data = [req.body.id_movie, req.body.id_user, req.body.cost]; // TODO: security "Careful SQL injection!!!"
  console.log(data);
    var q_sql = "INSERT INTO `video_rental`.`RENTALS` \
                      (`id_movie`, `id_user`, `cost`, `date`) \
               VALUES ( ?, ?, ?, CURRENT_TIMESTAMP);"
  var query = cnx.query(q_sql, data, function(err, result) {
    //console.log(query.sql);
    if (err) res.status('404').json(err);
    else{
      if (result) res.json('Created rental ['+result.insertId+'] with movie = '+data[0]+' by user = '+ data[1] +', at the price = '+ data[2]);
      else res.status('500').send("Error: DB returned = " + result);
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
                AND r.id = ? ;";

  var query = cnx.query(q_sql, [id], function(err, result) {
    //console.log(query.sql);
    if (err) res.status('404').json(err); 
    // If rental does not exist in db --> redirect to /rentals with status 404
    // TODO: improve with 404 page and timed redirect 5s.
    if (result) res.render('rentals/single', {title: "Rental Information", results: result});
    else res.status('404').redirect('/rentals');
  });
};

/**
* HTTP GET /api/rental/:id
* Parameter: :id is the unique identifier of the rental to retrieve
* Returns: the rental information with the specified :id in a JSON format
* Error: - Error from the database in JSON format
*        - 404 HTTP code if rental not exist
*/
exports.apigetrental = function (req, res){
  var id = req.rentalId;
  var q_sql = " SELECT m.name AS MOVIE, u.name AS USER, r.cost, r.date, \
                        r.id_user, r.id_movie, r.id \
                FROM RENTALS r, USERS u, MOVIES m \
                WHERE r.id_user = u.id_user \
                AND r.id_movie = m.id_movie \
                AND r.id = ? ;";

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
  var id = req.rentalId;
  var q_sql = " SELECT m.name AS MOVIE, u.name AS USER, r.cost, r.date, \
                        r.id_user, r.id_movie, r.id \
                FROM RENTALS r, USERS u, MOVIES m \
                WHERE r.id_user = u.id_user \
                AND r.id_movie = m.id_movie \
                AND r.id= ? ";
  var query = cnx.query(q_sql, [id], function(err, rentals, fields) {
    //console.log(query.sql);
    if (err) res.status('404').json(err);
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
  //console.log(cost);
  var query = cnx.query('UPDATE RENTALS SET cost = ? WHERE id = ?', cost, 
    function(err, result) {
      if (err) res.status('404').json(err); 
    });
  //console.log(query.sql); 
  res.redirect('rentals/' + cost[1] ); 
};

/**
* HTTP PUT /api/rentals/:rentalId
* Parameters: id of the rental
* Body Parameter: the JSON rental (id_movie, id_user, cost) to update
* Returns: 200 HTTP code: Rental Updated
* Error: 404 HTTP code 
*/
exports.apiupdate = function (req, res){
  var cost = [ 
    req.body.cost,
    req.params.rentalId
  ];
  //console.log(cost);
  var query = cnx.query('UPDATE `RENTALS` SET cost = ? WHERE id = ?', cost, 
    function(err, result) {
      if (err) res.status('404').json(err); 
      else res.status('200').send("Rental Updated");
    }); 
};
