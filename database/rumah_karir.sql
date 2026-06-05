CREATE DATABASE rumah_karir;
USE rumah_karir;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(200),
    username VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    birth_date DATE,
    role VARCHAR(20),
    photo_path VARCHAR(255),
    otp_code VARCHAR(10),
    is_verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255),
    industry VARCHAR(150),
    website VARCHAR(255),
    province VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    description TEXT,
    logo_path VARCHAR(255)
);

CREATE TABLE experiences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(200),
    title VARCHAR(255),
    body TEXT,
    rating INT,
    photo_path VARCHAR(255)
);

CREATE TABLE partners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    image_path VARCHAR(255),
    link VARCHAR(255)
);