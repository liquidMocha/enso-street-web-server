To start local PostgreSql:
```sudo docker run --name enso-street-db -p 5432 -e POSTGRES_PASSWORD=password -e POSTGRES_USER=enso-street -d postgres```

Database migration:
run ```db-migrate up```

Postgresql:

connect to Postgres: 
```psql -h localhost -U enso-street -p 32771```

list all databases: \l
switch database: \c ${database-name}
