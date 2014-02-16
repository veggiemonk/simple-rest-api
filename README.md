simple-rest-api
===============

This is a simple REST API built with Node.js, MySQL and Express.

Any comments would be appreciated.

Basic Authentification with login/pass = root/root

### To install it

git clone https://github.com/veggiemonk/simple-rest-api.git
cd simple-rest-api
npm install
npm start

### To test with curl

curl -H "Content-Type: application/json" --user root:root http://localhost:3000/api/users/

# To get a single user with id = 1
curl -H "Content-Type: application/json" --user root:root http://localhost:3000/api/users/1

# To create new users with name = USERNAME 1 and credit = 20

curl -X POST -d '{"name":"USERNAME 1", "credit":"20"}' -H "Content-Type: application/json" --user root:root http://localhost:3000/api/users/

# To update user with id = 1

curl -i -X PUT --data '{"name":"vincent","credit":"20"}' -H "Content-Type: application/json" --user root:root http://localhost:3000/api/users/1

# To delete a user with id = 1009

curl -i -X DELETE -H "Content-Type: application/json" --user root:root http://localhost:3000/api/users/1009
