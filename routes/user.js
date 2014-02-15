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
  var q_search = req.query.search; // TODO : security ! sql injection
  var q_sql = "";
  if (q_search) q_sql = "SELECT * FROM USERS WHERE NAME LIKE '%"+ q_search +"%' ; " 
  else q_sql = "SELECT * FROM USERS;"
  var query = cnx.query(q_sql, function(err, rows) {
    //console.log(query.sql);
    if (err) res.json(err);
    res.render('users/list', {title: "All Users", users: rows});
  });
};

exports.getuser = function (req, res){
  var id = req.userId;
  var q_sql = "SELECT * FROM USERS WHERE id_user = ?;";
/*  var q_sql = " SELECT r.id_movie, m.name AS MOVIE, m.category, u.id_user, u.name, u.credit \
                FROM users u, rentals r, movies m \
                WHERE r.id_movie = m.id_movie \
                AND r.id_user = u.id_user \
                AND u.id_user = ? \
                GROUP BY r.id_movie;";*/

  var query = cnx.query(q_sql, [id], function(err, result) {
    //console.log(query.sql);
    if (err) res.json(err); 
    // If user does not exist in db --> redirect to /users with status 404
    // TODO: improve with 404 page and timed redirect 5s.
    if (result) res.render('users/single', {title: "User Profile", results: result});
    else res.status('404').redirect('/users');
  });
};

exports.add = function (req, res){
  res.render('users/new');
};

exports.new = function (req, res){
  var name = req.body.name; // TODO: security "Careful SQL injection!!!"
  cnx.query('INSERT INTO `USERS` (name) VALUES (?);', [name], function(err, result) {
     // TODO: improve with 404 page and timed redirect 5s.
    if (err) {
      res.json(err);
    }else{
      if (result) res.redirect('/users/'+ result.insertId + '/edit');
      else res.status('500').redirect('/users');
    }
  });
};
//var url = require('url');
exports.edit = function (req, res){
  var id = req.userId;
  cnx.query('SELECT * FROM `USERS` where id_user = ?', [id], 
    function(err, users, fields) {
      // console.log(url.parse('/users/#{user.name}'));
      if (err) res.json(err);
      else{
        if (users) res.render('users/edit', { user: users[0]});
        else res.redirect('/users');
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
      if (err) res.json(err); 
    });
  //console.log(query.sql); 
  res.redirect('users/'+ usr[2]); 
};

exports.delete = function (req, res){
  var id = req.params.userId;
  var query = cnx.query('DELETE FROM `USERS` WHERE `users`.`id_user` = ?', id,
    function(err, result) {
      if (err){ res.json(err); new Error(err);}
      //console.log(query.sql);
    });
  res.redirect('users/');
};

exports.search = function (req, res){
  console.log(req.params);
  res.send("hello");
}

// exports.list = function(req, res){
//   cnx.query('SELECT * FROM USERS', function(err, rows) {
//     if (err) res.json(err);
//     res.render('users/list', {title: "All Users", users: rows});
//   });
// };







