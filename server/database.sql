CREATE DATABASE chatappv1;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE account (
    user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    user_image BYTEA NULL,
    displayed_name VARCHAR(255) NULL,
    description TEXT NULL
); 

CREATE TABLE pending_friendship (
    receiver_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    FOREIGN KEY (receiver_id) REFERENCES account(user_id),
    FOREIGN KEY (sender_id) REFERENCES account(user_id)
);

CREATE TABLE friendship (
    user1_id uuid NOT NULL,
    user2_id uuid NOT NULL,
    FOREIGN KEY (user1_id) REFERENCES account(user_id),
    FOREIGN KEY (user2_id) REFERENCES account(user_id)
);

CREATE TABLE conversation (
    conversation_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_name VARCHAR(255) NOT NULL,
    chat_icon BYTEA NULL,
    description TEXT NULL
);

CREATE TABLE group_member (
    user_id UUID NOT NULL ,
    conversation_id uuid NOT NULL ,
    joined_datetime TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    is_admin BOOLEAN NOT NULL DEFAULT false,
    FOREIGN KEY (user_id) REFERENCES account(user_id),
    FOREIGN KEY (conversation_id) REFERENCES conversation(conversation_id)
  
);

CREATE TABLE message (
    message_id SERIAL PRIMARY KEY,
    from_user_id UUID NOT NULL,
    message_text TEXT NOT NULL,
    sent_datetime TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    conversation_id uuid NOT NULL,
    message_type VARCHAR(255) NOT NULL DEFAULT 'normal',
    FOREIGN KEY (conversation_id) REFERENCES conversation(conversation_id)
);
