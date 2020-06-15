--- load with 
--- sqlite3 database.db < schema.sql
drop table user;

Create TABLE IF NOT EXISTS user (
	userName VARCHAR(20) PRIMARY KEY,
	userEmail VARCHAR(50),
	userPass VARCHAR(100),
	numKills INTEGER DEFAULT 0,
	numDeaths INTEGER DEFAULT 0 
);