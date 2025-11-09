CREATE DATABASE IF NOT EXISTS football_bets
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE football_bets;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  home_team VARCHAR(80) NOT NULL,
  away_team VARCHAR(80) NOT NULL,
  kickoff_at DATETIME NOT NULL,
  status ENUM('scheduled','inplay','finished','canceled')
    NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS odds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  match_id INT NOT NULL,
  market VARCHAR(30) NOT NULL,
  selection ENUM('Home','Draw','Away') NOT NULL,
  price DECIMAL(5,2) NOT NULL,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  match_id INT NOT NULL,
  selection ENUM('Home','Draw','Away') NOT NULL,
  stake DECIMAL(12,2) NOT NULL,
  price DECIMAL(5,2) NOT NULL,
  status ENUM('open','win','lose','void') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('deposit','win_payout','bet_stake','refund') NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
