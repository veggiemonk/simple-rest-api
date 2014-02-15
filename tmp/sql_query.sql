ALTER TABLE `MOVIES` AUTO_INCREMENT =1;


SELECT * FROM users WHERE id_user = 990;

INSERT INTO RENTALS (id_user, id_movie, cost) VALUES ('1','2','20');

UPDATE RENTALS SET DATE = CURRENT_TIME WHERE id_movie LIKE '%';

ALTER TABLE `RENTALS` ADD CONSTRAINT RENTALS UNIQUE(`id_user`, `id_movie`);
  
SELECT date_format(DATE,'%Y') AS YEAR, 
                       date_format(DATE,'%m') AS MONTH, 
                       date_format(DATE,'%d') AS DAY, 
                       sum(r.cost) AS TOTAL 
                FROM rentals r 
                GROUP BY DAY 
                ORDER BY total DESC;
                

SELECT * FROM users WHERE NAME LIKE "%test%";

SELECT * FROM RENTALS;
                
SELECT m.name AS MOVIE, u.name AS USER, r.cost, r.date
FROM RENTALS r, USERS u, MOVIES m
WHERE r.id_user = u.id_user
AND r.id_movie = m.id_movie
ORDER BY r.date DESC;

-- movie ordered by a user
SELECT r.id_movie, m.name AS MOVIE, m.`category` AS CAT, u.name, u.credit
FROM users u, rentals r, movies m
WHERE r.id_movie = m.id_movie
AND r.id_user = u.id_user
AND u.id_user = 1
GROUP BY r.id_movie;



SELECT DISTINCT(m.name), m.category
FROM MOVIES m, RENTALS r
WHERE m.id_movie = r.id_movie
AND m.category IN (SELECT DISTINCT (m.`category`) AS CAT
FROM rentals r, movies m
WHERE r.id_movie = m.id_movie
AND r.id_user = 4);



SELECT * FROM MOVIES WHERE id_movie= 100;

SELECT u.name AS USER, u.id_user, m.id_movie, m.name, m.price
FROM movies m, rentals r, users u
WHERE u.id_user = r.id_user
AND r.id_movie = m.id_movie
AND m.id_movie = 100
GROUP BY u.id_user;
