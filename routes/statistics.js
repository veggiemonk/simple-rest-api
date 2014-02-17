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


exports.list = function(req, res){
  res.render('statistics/stats', { title: 'Statistics' });
};

exports.income = function(req, res){
  var q_sql = "";
  switch(req.timing){
    case "y" : q_sql += "SELECT date_format(DATE,'%Y') AS YEAR,"; break;
    case "m" : q_sql += "SELECT date_format(DATE,'%Y') AS YEAR, \
                                date_format(DATE,'%m') AS MONTH,"; break;
    case "d" : q_sql += "SELECT date_format(DATE,'%Y') AS YEAR, \
                                date_format(DATE,'%m') AS MONTH, \
                                date_format(DATE,'%d') AS DAY,"; break;
    default: res.status('404').send("URL does not exist!")
  }  
  q_sql +="sum(r.cost) AS TOTAL FROM rentals r ";
  switch(req.timing){
    case "d" : q_sql += "GROUP BY YEAR, MONTH, DAY ORDER BY total DESC ;"; break;
    case "m" : q_sql += "GROUP BY YEAR, MONTH ORDER BY total DESC ;"; break;
    case "y" : q_sql += "GROUP BY YEAR ORDER BY total DESC ;"; break;
    default: res.status('404').send("URL does not exist!")
  }            
  //console.log(q_sql);
  cnx.query(q_sql, function(err, result) {
    if (err) res.status('404').json(err);
    if (req.path.indexOf("api") !== -1 ) res.json(result);
    else res.render('statistics/income', {title: "Income", incomes: result});
  });
}


exports.topmovie = function(req, res){
  var q_sql = "SELECT m.id_movie AS ID, m.name AS NAME, sum(r.cost) AS TOTAL \
               FROM `MOVIES` m, rentals r \
               WHERE m.id_movie = r.`id_movie` \
               GROUP BY m.name \
               ORDER BY total DESC \
               LIMIT 50;";
  cnx.query(q_sql, function(err, result) {
    if (err) res.status('404').json(err);
    if (req.path.indexOf("api") !== -1 ) res.json(result);
    else res.render('statistics/topmovie', {title: "Top Movies", movies: result});
  });
}

exports.topuser = function(req, res){
  var q_sql =  "SELECT u.name AS NAME, u.id_user as ID, sum(r.cost) AS TOTAL \
                FROM users u, rentals r \
                WHERE u.id_user = r.id_user \
                GROUP BY u.`name`\
                ORDER BY total DESC \
                LIMIT 10;";
  cnx.query(q_sql, function(err, result) {
    if (err) res.status('404').json(err);
    if (req.path.indexOf("api") !== -1 ) res.json(result);
    else res.render('statistics/topuser', {title: "Top Users", users: result});
  });
}

exports.topcat = function(req, res){
  var q_sql =  "SELECT m.`category` AS CAT, sum(r.cost) AS TOTAL \
                FROM movies m, rentals r \
                WHERE m.id_movie = r.id_movie \
                GROUP BY category \
                ORDER BY total DESC \
                LIMIT 3;"; 
  cnx.query(q_sql, function(err, result) {
    if (err) res.status('404').json(err);
    if (req.path.indexOf("api") !== -1 ) res.json(result);
    else res.render('statistics/topcat', {title: "Top Categories", cats: result});
  });
}

exports.tenplus = function(req, res){
  var q_sql =  "SELECT m.name as NAME, m.id_movie AS ID, count(*) AS HIRED \
                FROM movies m, rentals r \
                WHERE m.id_movie = r.id_movie \
                GROUP BY r.`id_movie` \
                HAVING count(*) >= 10;"; 
  //console.log(q_sql);
  cnx.query(q_sql, function(err, result) {
    if (err) res.status('404').json(err);
    if (req.path.indexOf("api") !== -1 ) res.json(result);
    else res.render('statistics/tenplus', {title: "Movie hired >10 times", tenplus: result});
  });
}

exports.hiredmovie = function(req, res){
  var q_sql =  "SELECT m.name as NAME, m.id_movie AS ID, count(*) AS HIRED \
                FROM movies m, rentals r \
                WHERE m.id_movie = r.id_movie \
                GROUP BY r.id_movie \
                ORDER BY HIRED DESC"; 
  //console.log(q_sql);
  cnx.query(q_sql, function(err, result) {
    if (err) res.status('404').json(err);
    if (req.path.indexOf("api") !== -1 ) res.json(result);
    else res.render('statistics/hiredmovie', {title: "Movie hired", hired: result});
  });
}
