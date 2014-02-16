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
* HTTP GET /api/users
* Returns: 
*     - The list of users in JSON format if accessed from "/api/users/" URL
*     - The list of users in HTML format if accessed from the /users/
*/
exports.list = function(req, res){
  var q_search = req.query.search; // TODO : security ! sql injection
  var q_sql = "";
  if (q_search) q_sql = "SELECT * FROM USERS WHERE NAME LIKE '%"+ q_search +"%' ; " 
  else q_sql = "SELECT * FROM USERS;"
  var query = cnx.query(q_sql, function(err, result) {
    if (err) res.status('404').json(err);
    else {
      if(result){
        if (req.path.indexOf("api") !== -1 ) res.json(result);
        else res.render('users/list', {title: "All Users", users: result});
      }
    }
  });
};

/**
* HTTP POST /api/search/users
* Body Parameter: :name = (partial) name of the users
* Returns: The list of users containing the parameter in JSON
*/
exports.search = function(req, res){
  //var data = [];
  var q_sql = "SELECT * FROM USERS WHERE NAME LIKE '%"+ req.body.name +"%' ; ";
  var query = cnx.query(q_sql, function(err, result) {
    if (err) res.status('404').json(err);
    else res.json(result);
    });
}

exports.add = function (req, res){
  res.render('users/new');
};

exports.new = function (req, res){
  var name = req.body.name; // TODO: security "Careful SQL injection!!!"
  cnx.query('INSERT INTO `USERS` (name) VALUES (?);', [name], function(err, result) {
    if (err) res.status('404').json(err);
    else{
      if (result) res.redirect('/users/'+ result.insertId + '/edit');
      else res.status('500').redirect('/users');
    }
  });
};

/**
* HTTP POST /api/users/
* Body Parameters: "name" and "credit" of the user to be created
* Returns: 200 HTTP code: "Created user :name with id = :id and credit = :credit"
* Error: 500 HTTP code with result from query
*/
exports.apinew = function (req, res){
  var data = [req.body.name, req.body.credit]; // TODO: security "Careful SQL injection!!!"
  //console.log(data);
  var query = cnx.query('INSERT INTO `USERS` (name, credit) VALUES (?,?);', data, function(err, result) {
    console.log(query.sql);
    if (err) res.status('404').json(err);
    else{
      if (result) res.json('Created user '+data[0]+' \
                            with id = '+ result.insertId +' \
                            and credit = '+ data[1]);
      else res.status('500').send("Error: DB returned = " + result);
    }
  });
};

exports.getuser = function (req, res){
  var id = req.userId;
  var q_sql = "SELECT * FROM USERS WHERE id_user = ?;";
  // list of movies rented by the users
  // TODO put it in a partials !
  /*  var q_sql = " SELECT r.id_movie, m.name AS MOVIE, \
                   m.category, u.id_user, u.name, u.credit \
                FROM users u, rentals r, movies m \
                WHERE r.id_movie = m.id_movie \
                AND r.id_user = u.id_user \
                AND u.id_user = ? \
                GROUP BY r.id_movie;";*/

  var query = cnx.query(q_sql, [id], function(err, result) {
    //console.log(query.sql);
    if (err) res.status('404').json(err); 
    else{
      if (result)res.render('users/single', {title: "User Profile", results: result});
      else res.status('404').redirect('/users');
    }
  });
};

/**
* HTTP GET /api/users/:id_user
* Parameter: :id_user is the unique identifier of the user to retrieve
* Returns: the user information with the specified :id_user in a JSON format
* Error: - Error from the database in JSON format
*        - 404 HTTP code if user not exist
*/
exports.apigetuser = function (req, res){
  var id = req.userId;
  var q_sql = "SELECT * FROM USERS WHERE id_user = ?;";
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
  var id = req.userId;
  cnx.query('SELECT * FROM `USERS` where id_user = ?', [id], 
    function(err, users, fields) {
      if (err) res.json(err);
      else{
        if (users) res.render('users/edit', { user: users[0]});
        else res.status('404').redirect('/users');
      }
    }
  ); 
};

exports.update = function (req, res){
  var usr = [ 
    req.body.name, 
    req.body.credit,
    req.params.userId // usr[2] for redirect
  ];
  //console.log(usr);
  var query = cnx.query('UPDATE `USERS` SET name = ?, credit = ? WHERE id_user = ?', usr, 
    function(err, result) {
      if (err) res.status('404').json(err); 
    });
  //console.log(query.sql); 
  res.redirect('users/'+ usr[2]); 
};

/**
* HTTP PUT /api/users/:userId
* Parameter: id of the user
* Body Parameter: the JSON user (name, credit, id) to update
* Returns: 200 HTTP code: User Updated
* Error: 404 HTTP code 
*/
exports.apiupdate = function (req, res){
  var usr = [ 
    req.body.name, 
    req.body.credit,
    req.userId
  ];
  //console.log(usr);
  var query = cnx.query('UPDATE `USERS` SET name = ?, credit = ? WHERE id_user = ?', usr, 
    function(err, result) {
      if (err) res.status('404').json(err); 
      else res.status('200').send("User Updated");
    }); 
};

exports.delete = function (req, res){
  var id = req.params.userId;
  var query = cnx.query('DELETE FROM `USERS` WHERE `users`.`id_user` = ?', id,
    function(err, result) {
      if (err){ res.status('404').json(err); new Error(err);}
    });
  res.redirect('users/');
};

/**
* HTTP DELETE /api/users/:userId
* Parameters: user ID to delete
* Returns: 200 HTTP code: User Deleted
* Error: 404 HTTP code
*/
exports.apidelete = function (req, res){
  var id = req.params.userId;
  if (id){
    var query = cnx.query('DELETE FROM `USERS` WHERE `users`.`id_user` = ?', id,
      function(err, result) {
        if (err) res.status('404').json(err);
        else res.status('200').send("User Deleted");
      });
  }else res.status('404').send("Wrong parameters!");
};
