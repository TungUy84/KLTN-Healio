-- Create database user for Healio project
CREATE USER healio_user WITH PASSWORD 'healio_password_123';

-- Grant permission to create databases
ALTER USER healio_user CREATEDB;

-- Create database if not exists
CREATE DATABASE healio_db OWNER healio_user;

-- Grant all privileges on database
GRANT ALL PRIVILEGES ON DATABASE healio_db TO healio_user;