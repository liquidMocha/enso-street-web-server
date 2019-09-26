To start local PostgreSql:
```sudo docker run --name enso-street-db -p 5432:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_USER=enso-street -d postgres```

Create test database:
```create database "enso-street-test";```

Database migration:
create a new migration ```db-migrate create <migration-title>```
run ```db-migrate up```
migration for test ```db-migrate up -e test```

Postgresql:

connect to Postgres: 
```psql -h localhost -U enso-street -p 5432```

list all databases: \l
list all tables: \dt
switch database: \c ${database-name}

Start docker Redis:
```sudo docker run --name enso-redis -p 6379:6379 -d redis```

set custom git hook location
```git config core.hooksPath <path>```