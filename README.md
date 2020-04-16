# Database
To start local PostgreSql:
```sudo docker run --name enso-street-db -p 5432:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_USER=enso-street -d postgres```

Create test database:
```create database "enso-street-test";```

Database migration:
create a new migration ```db-migrate create --config ./src/database.json <migration-title>```
run ```db-migrate up```
migration for test ```db-migrate up -e test```

Postgresql:

connect to Postgres: 
```psql -h localhost -U enso-street -p 5432```

list all databases: \l
list all tables: \dt
switch database: \c ${database-name}

To log queries from pg-promise:
```
const initOptions = {
     query(e) {
       console.log(e.query);
     }
   };
   const pgp = require('pg-promise')(initOptions);
```

# Redis cache
Start docker Redis:
```sudo docker run --name enso-redis -p 6379:6379 -d redis```
List all keys: (using redis-cli) 
```KEYS *```

# Git
set custom git hook location
```git config core.hooksPath <path>```

# Heroku
Heroku deployment:
```heroku login```
to create new app:
```heroku create```
push to heroku:
```git push heroku master```

# Performance test
Performance test:
note the 
```
tls:
  rejectUnauthorized: false
```
for self signed certificate in local environments

To run a particular performance test:
```artillery run performance_tests/get-categories.yml```
