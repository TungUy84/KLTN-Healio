-- Create new user for Healio
CREATE USER healio_user WITH PASSWORD 'healio123';

-- Grant permissions
ALTER USER healio_user CREATEDB;

-- Create database if not exists
CREATE DATABASE healio_db OWNER healio_user;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE healio_db TO healio_user;
