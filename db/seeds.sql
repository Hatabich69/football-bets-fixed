USE football_bets;

INSERT INTO users (username,email,password_hash,role,balance)
VALUES
('admin','admin@example.com',
'$2b$10$F.7gD4jWk8xW3R1guEwZqO4q5Jtq4y9qg1mI6W2q7bZ9B0sQqD8aK',
'admin', 0.00);

INSERT INTO matches (home_team, away_team, kickoff_at, status) VALUES
('Dynamo Kyiv', 'Shakhtar Donetsk', DATE_ADD(NOW(), INTERVAL 2 DAY), 'scheduled'),
('Barcelona', 'Real Madrid', DATE_ADD(NOW(), INTERVAL 5 DAY), 'scheduled');

INSERT INTO odds (match_id, market, selection, price) VALUES
(1, '1x2', 'Home', 2.10),
(1, '1x2', 'Draw', 3.30),
(1, '1x2', 'Away', 3.10),
(2, '1x2', 'Home', 2.40),
(2, '1x2', 'Draw', 3.50),
(2, '1x2', 'Away', 2.80);
