CREATE DATABASE IF NOT EXISTS deepcare_db CHARACTER SET utf8 COLLATE utf8_general_ci;
USE deepcare_db;

CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    first_name  VARCHAR(100)  NOT NULL,
    last_name   VARCHAR(100)  NOT NULL,
    username    VARCHAR(50)   NOT NULL UNIQUE,
    email       VARCHAR(191)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,
    phone       VARCHAR(20)   DEFAULT NULL,
    created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE IF NOT EXISTS assessments (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT           NOT NULL UNIQUE,
    age        VARCHAR(10)   DEFAULT NULL,
    gender     VARCHAR(50)   DEFAULT NULL,
    skin_type  VARCHAR(255)  DEFAULT NULL,
    skin_feel  VARCHAR(255)  DEFAULT NULL,
    concerns   VARCHAR(255)  DEFAULT NULL,
    allergies  VARCHAR(255)  DEFAULT NULL,
    updated_at DATETIME      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
