CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    time TIMESTAMP WITH TIME ZONE,
    message TEXT
);

CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    comment TEXT NOT NULL,
    commenter TEXT NOT NULL,
    message_id INT NOT NULL,
    CONSTRAINT fk_message FOREIGN KEY(message_id) REFERENCES messages(id)
);
