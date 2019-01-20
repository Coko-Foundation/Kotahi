CREATE TABLE journals (
    id UUID PRIMARY KEY,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
    updated TIMESTAMP WITH TIME ZONE,
    title TEXT,
    meta JSONB,
    type TEXT NOT NULL
);

INSERT INTO journals
(id, created, updated, title, meta, "type")
VALUES('659f69be-be6c-4e7b-8e09-738aed9c8966', '2019-01-15 17:43:00.000', NULL, 'xpub Collabra', NULL, 'journal');

INSERT INTO entities
(id, "data")
VALUES('632c37a9-0db2-4b9e-bc01-afd21b00387c', '{"type": "user", "email": "reviewer@reviewer.com", "teams": [], "username": "reviewer", "fragments": [], "collections": [], "passwordHash": "$2b$12$sbyDL0qJglz.bdt/k2G1oe6FZTeXEFqFB7rs4oqfw8DZKlRWuL/Eu"}');
INSERT INTO entities
(id, "data")
VALUES('f8d79eab-0ad2-488e-a8a5-9932dacedac9', '{"type": "user", "email": "senior@senior.com", "teams": [], "username": "senior", "fragments": [], "collections": [], "passwordHash": "$2b$12$nxYi3kicIyePsjBVe4ly7es2lxZeQXsAIYWdhBgtiSBPd2n3uw4cS"}');
INSERT INTO entities
(id, "data")
VALUES('4ca9e849-20f3-4121-86ef-15261be4992c', '{"type": "user", "email": "handling@handling.com", "teams": [], "username": "handling", "fragments": [], "collections": [], "passwordHash": "$2b$12$KBHBDu0GktqnchDnVn8.DOAv6dBocQTYtUePT1AGWEXAjaG5bxooG"}');
INSERT INTO entities
(id, "data")
VALUES('d7009f6c-61aa-49c4-a44e-8a71072d7341', '{"type": "user", "email": "author@author.com", "teams": [], "username": "author", "fragments": [], "collections": [], "passwordHash": "$2b$12$6FuyR6E5CIrU5dNCm52KKOERZW2XGeryuOeNNFwCPxhwxQ2JKLSOm"}');
INSERT INTO entities
(id, "data")
VALUES('454f40b9-bf5d-4007-8879-766a8c9bedf3', '{"type": "user", "email": "admin@admin.com", "teams": [], "username": "admin", " admin": true,  "fragments": [], "collections": [], "passwordHash": "$2b$12$HRzkMwUeUY.jdaO..bjK9OhHBm4JOTvq8fjzmpjAPyaYySCnIOyCO"}');
