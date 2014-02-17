simple-rest-api
===============

This is a simple REST API built with Node.js, MySQL and Express.

Any comments would be appreciated.

Basic Authentification with login/pass = root/root

# Quick Start
```
git clone https://github.com/veggiemonk/simple-rest-api.git
cd simple-rest-api
npm install
npm start
```


# Testing with cURL

## USERS

 Get list of all users

    $ curl -H "Content-Type: application/json" --user root:root http://localhost:3000/api/users/

 Search users by name

    $ curl -H "Content-Type: application/json" --user root:root http://localhost:3000/api/search/users/ -d '{"name":"vincent"}'

 To get a single user with id = 1
  
    $ curl -H "Content-Type: application/json" --user root:root http://localhost:3000/api/users/1

 To create new users with name = USERNAME 1 and credit = 20

    $ curl -i -X POST -d '{"name":"USERNAME 1", "credit":"20"}' -H "Content-Type: application/json" --user root:root http://localhost:3000/api/users/

 To update user with id = 1

    $ curl -i -X PUT --data '{"name":"vincent","credit":"20"}' -H "Content-Type: application/json" --user root:root http://localhost:3000/api/users/1

 To delete a user with id = 1009

    $ curl -i -X DELETE -H "Content-Type: application/json" --user root:root http://localhost:3000/api/users/1009


## MOVIES

 Get list of all movies :

    $ curl -H "Content-Type: application/json" --user root:root http://localhost:3000/api/movies/

 Search movies by name :

    $ curl -i -X POST -H "Content-Type: application/json" --user root:root http://localhost:3000/api/search/movies/ -d '{"name":"movie"}'

 To get a single movie with id = 1 :
  
    $ curl -H "Content-Type: application/json" --user root:root http://localhost:3000/api/movies/1

 To create new movie with name = "MOVIE 1", category = "5" and price = "20" :

    $ curl -i -H "Content-Type: application/json" --user root:root http://localhost:3000/api/movies/ --data '{"name":"Movie 1", "category":"5", "price":"20"}'

 To update movie with id = 1 :

    $ curl -i -X PUT --data '{"name":"BRAKUS2", "category":"4", "price":"20"}' -H "Content-Type: application/json" --user root:root http://localhost:3000/api/movies/1

 To delete a movie with id = 1009 :

    $ curl -i -X DELETE -H "Content-Type: application/json" --user root:root http://localhost:3000/api/movies/1009


## RENTALS

 Get list of all rentals :

    $ curl -H "Content-Type: application/json" --user root:root http://localhost:3000/api/rentals

 Rent a movie by a user :

    $ curl -i -H "Content-Type: application/json" --user root:root http://localhost:3000/api/rentals/ --data '{"id_movie":"1", "id_user":"5", "cost":"25"}'

 Edit a rental (id=30) and set cost = 50 :

    $ curl -i -X PUT --data '{"cost":"50"}' -H "Content-Type: application/json" --user root:root http://localhost:3000/api/rentals/30

 Retrieve a rental by id = 30
    
    $ curl -H "Content-Type: application/json" --user root:root http://localhost:3000/api/rentals/30


## STATISTICS

 Income of the Day :

    $ curl -H "Content-Type: application/json" --user root:root http://localhost:3000/api/stats/income/d

 Income of the Month :

    $ curl -H "Content-Type: application/json" --user root:root http://localhost:3000/api/stats/income/m

 Income of the Year :

    $ curl -H "Content-Type: application/json" --user root:root http://localhost:3000/api/stats/income/y

 Top 50 movies :

    $ curl -H "Content-Type: application/json" --user root:root http://localhost:3000/api/stats/topmovie

 Top 10 users :

    $ curl -H "Content-Type: application/json" --user root:root http://localhost:3000/api/stats/topuser

 Top 3 categories :

    $ curl -H "Content-Type: application/json" --user root:root http://localhost:3000/api/stats/topcat

 Movies Hired more than 10 times :

    $ curl -H "Content-Type: application/json" --user root:root http://localhost:3000/api/stats/10plus

 All Hired Movies :

    $ curl -H "Content-Type: application/json" --user root:root http://localhost:3000/api/stats/hiredmovie

## Known bug :

Sometimes MySQL cannot read the autoincrement number after a restart! It send this error :
```
{
code: "ER_AUTOINC_READ_FAILED",
errno: 1467,
sqlState: "HY000",
index: 0
}
```

To solve this, the autoincrement number has to be reset by :
```sql
ALTER TABLE `tablename` AUTO_INCREMENT=1000;
```

# SQL query

## For Users

 All users:
```sql
SELECT * FROM USERS;
```

 Search users by name:
```sql
SELECT * FROM USERS WHERE NAME LIKE '%?%' ;
```

 New user:
```sql
INSERT INTO USERS (name, credit) VALUES (?,?);
```

 Get a single user:
```sql
SELECT * FROM USERS WHERE id_user = ?;
```

 Update a user:
```sql
UPDATE USERS SET name = ?, credit = ? WHERE id_user = ?
```

 Delete a user:
```sql
DELETE FROM USERS WHERE id_user = ?;
```
 
## For Statistics

 Income of the day:
```sql
SELECT date_format(DATE,'%Y') AS YEAR, 
       date_format(DATE,'%m') AS MONTH, 
       date_format(DATE,'%d') AS DAY,
       sum(r.cost) AS TOTAL 
FROM rentals r
GROUP BY YEAR, MONTH, DAY 
ORDER BY total DESC;
```
 
 Top 50 Movies:
```sql
SELECT m.id_movie AS ID, m.name AS NAME, sum(r.cost) AS TOTAL 
FROM MOVIES m, rentals r 
WHERE m.id_movie = r.id_movie
GROUP BY m.name 
ORDER BY total DESC 
LIMIT 50;
```

 Top 10 Users:
```sql
SELECT u.name AS NAME, u.id_user as ID, sum(r.cost) AS TOTAL 
FROM users u, rentals r 
WHERE u.id_user = r.id_user 
GROUP BY u.name
ORDER BY total DESC
LIMIT 10;
```

 Top 3 categories:
```sql
SELECT m.category AS CAT, sum(r.cost) AS TOTAL 
FROM movies m, rentals r 
WHERE m.id_movie = r.id_movie 
GROUP BY category 
ORDER BY total DESC 
LIMIT 3;
```
 
 Movies hired more than 10 times:
```sql
SELECT m.name as NAME, m.id_movie AS ID, count(*) AS HIRED 
FROM movies m, rentals r 
WHERE m.id_movie = r.id_movie 
GROUP BY r.id_movie
HAVING count(*) >= 10;
```

 All hired movies:
```sql
SELECT m.name as NAME, m.id_movie AS ID, count(*) AS HIRED 
FROM movies m, rentals r 
WHERE m.id_movie = r.id_movie 
GROUP BY r.id_movie 
ORDER BY HIRED DESC
```
