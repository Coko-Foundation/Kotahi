--
-- PostgreSQL database dump
--

-- Dumped from database version 10.5
-- Dumped by pg_dump version 10.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgboss; Type: SCHEMA; Schema: -; Owner: test
--

CREATE SCHEMA pgboss;


ALTER SCHEMA pgboss OWNER TO test;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: aliases; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public.aliases (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    name character varying(255),
    email character varying(255),
    aff character varying(255)
);


ALTER TABLE public.aliases OWNER TO test;

--
-- Name: entities; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public.entities (
    id uuid NOT NULL,
    data jsonb
);


ALTER TABLE public.entities OWNER TO test;

--
-- Name: files; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public.files (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    object text,
    object_id uuid,
    label text,
    file_type text,
    filename text,
    url text,
    mime_type text,
    size integer,
    type text NOT NULL
);


ALTER TABLE public.files OWNER TO test;

--
-- Name: journals; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public.journals (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    title text,
    meta jsonb,
    type text NOT NULL
);


ALTER TABLE public.journals OWNER TO test;

--
-- Name: manuscripts; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public.manuscripts (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    parent_id uuid,
    status text,
    decision text,
    authors jsonb,
    suggestions jsonb,
    meta jsonb,
    type text NOT NULL
);


ALTER TABLE public.manuscripts OWNER TO test;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public.migrations (
    id text NOT NULL,
    run_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.migrations OWNER TO test;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public.reviews (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    recommendation text,
    is_decision boolean DEFAULT false,
    comments jsonb,
    user_id uuid,
    manuscript_id uuid,
    type text NOT NULL
);


ALTER TABLE public.reviews OWNER TO test;

--
-- Name: team_members; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public.team_members (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(255),
    team_id uuid,
    user_id uuid,
    alias_id uuid
);


ALTER TABLE public.team_members OWNER TO test;

--
-- Name: teams; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public.teams (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    name text,
    role text NOT NULL,
    owners jsonb,
    global boolean,
    type text NOT NULL,
    object_id uuid,
    object_type character varying(255)
);


ALTER TABLE public.teams OWNER TO test;

--
-- Name: users; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    admin boolean,
    email text,
    username text,
    password_hash text,
    fragments jsonb,
    collections jsonb,
    teams jsonb,
    password_reset_token text,
    password_reset_timestamp timestamp with time zone,
    type text NOT NULL
);


ALTER TABLE public.users OWNER TO test;

--
-- Data for Name: aliases; Type: TABLE DATA; Schema: public; Owner: test
--



--
-- Data for Name: entities; Type: TABLE DATA; Schema: public; Owner: test
--



--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.files (id, created, updated, object, object_id, label, file_type, filename, url, mime_type, size, type) VALUES ('60972cc9-b5b9-42b4-a80f-67616cfa6ac7', '2020-02-28 19:39:59.454+01', '2020-02-28 19:39:59.454+01', 'Manuscript', 'bd429b57-6fc9-4454-a42c-c1f63cfa263c', NULL, 'manuscript', 'test-pdf.pdf', '/0b5e0a112164206f396e61beb28a913b.pdf', 'application/pdf', 106798, 'file');


--
-- Data for Name: journals; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.journals (id, created, updated, title, meta, type) VALUES ('4fe21415-b60c-442e-8748-872f35c2266f', '2020-02-28 19:39:55.414+01', '2020-02-28 19:39:55.414+01', 'My Journal', NULL, 'journal');


--
-- Data for Name: manuscripts; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.manuscripts (id, created, updated, parent_id, status, decision, authors, suggestions, meta, type) VALUES ('bd429b57-6fc9-4454-a42c-c1f63cfa263c', '2020-02-28 19:39:59.308+01', '2020-02-28 19:40:15.15+01', NULL, 'submitted', NULL, NULL, '{"editors": {"opposed": "Gina Ode", "suggested": "John Ode"}, "reviewers": {"opposed": "James Doe", "suggested": "Jane Do"}}', '{"notes": [{"content": "This work was supported by the Trust [grant numbers 393,295]; the Natural Environment Research Council [grant number 49493].", "notesType": "fundingAcknowledgement"}, {"content": "", "notesType": "specialInstructions", "__typename": "Note"}], "title": "A Manuscript For The Ages", "keywords": "quantum, machines, nature", "articleType": "original-research", "declarations": {"openData": "yes", "preregistered": "yes", "researchNexus": "no", "openPeerReview": "yes", "streamlinedReview": "no", "previouslySubmitted": "no"}, "articleSections": ["cognitive-psychology"]}', 'Manuscript');


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.migrations (id, run_at) VALUES ('1524494862-entities.sql', '2020-02-28 19:39:52.52103+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1537450834-files.sql', '2020-02-28 19:39:52.533068+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1537450834-journals.sql', '2020-02-28 19:39:52.582771+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1537450834-manuscript.sql', '2020-02-28 19:39:52.628646+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1537450834-review.sql', '2020-02-28 19:39:52.682145+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1542276313-initial-user-migration.sql', '2020-02-28 19:39:52.700352+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1542801241-initial-team-migration.sql', '2020-02-28 19:39:52.713315+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1547596236-initial-team-member-migration.js', '2020-02-28 19:39:52.732321+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1548205275-move-members.js', '2020-02-28 19:39:52.743401+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1548205276-simplify-object.js', '2020-02-28 19:39:52.765508+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1548328420-add-alias-migration.js', '2020-02-28 19:39:52.783812+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1560771823-add-unique-constraints-to-users.sql', '2020-02-28 19:39:52.794199+01');


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.reviews (id, created, updated, recommendation, is_decision, comments, user_id, manuscript_id, type) VALUES ('622e74ac-f08b-420f-b311-076e69b03c00', '2020-02-28 19:40:33.481+01', '2020-02-28 19:40:40.542+01', 'accepted', false, '[{"type": "note", "content": "Great research into CC bases in the ky289 variant are mutated to TC which results in the truncation of the SAD-1."}, {"type": "confidential", "content": "Not too bad."}]', 'e910b3d3-273d-4492-b68b-b33a5e4cb58d', 'bd429b57-6fc9-4454-a42c-c1f63cfa263c', 'Review');
INSERT INTO public.reviews (id, created, updated, recommendation, is_decision, comments, user_id, manuscript_id, type) VALUES ('5c8b933e-6410-46f4-8949-85ad3b1fc061', '2020-02-28 19:40:44.503+01', '2020-02-28 19:40:50.2+01', 'revise', false, '[{"type": "note", "content": "Mediocre analysis of Iron-Sulfur ClUster assembly enzyme homolog."}, {"type": "confidential", "content": "It is so so."}]', '1e28bd99-497d-4496-8e1a-169693995b18', 'bd429b57-6fc9-4454-a42c-c1f63cfa263c', 'Review');
INSERT INTO public.reviews (id, created, updated, recommendation, is_decision, comments, user_id, manuscript_id, type) VALUES ('88d41d50-b647-4654-a8e0-ab5bb6934124', '2020-02-28 19:40:54.824+01', '2020-02-28 19:41:01.495+01', 'rejected', false, '[{"type": "note", "content": "mTOR-Is positively influence the occurrence and course of certain tumors after solid organ transplantation."}, {"type": "confidential", "content": "It is not good."}]', '60adcc92-64a0-4d87-97ef-a31ccf30517a', 'bd429b57-6fc9-4454-a42c-c1f63cfa263c', 'Review');


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('a5ff0f55-6363-4c0f-a033-27be3b55ff37', '2020-02-28 19:39:59.499+01', '2020-02-28 19:39:59.499+01', NULL, 'ebb4cc52-04ed-4390-ad70-be8f438e6012', 'bbe263a7-3cc5-4b3a-a6ce-d2cc70425406', NULL);
INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('2ef219dd-66b4-45b4-b525-89a6b64e9eeb', '2020-02-28 19:40:21.509+01', '2020-02-28 19:40:21.509+01', NULL, '5848e7e9-112e-41cc-8f93-460560a740aa', '1c162384-ef4c-47fc-a89e-d7a03c13cec8', NULL);
INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('9a362034-2f53-4162-a5e4-d3fa6896ff5e', '2020-02-28 19:40:21.949+01', '2020-02-28 19:40:21.949+01', NULL, '84ef271d-a10c-4d3c-9c44-0568f126e161', '53c1ddca-2770-417d-991d-f386d2d06e57', NULL);
INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('84235add-df75-48cf-8a39-ef18faea1536', '2020-02-28 19:41:01.778+01', '2020-02-28 19:41:01.778+01', 'completed', '9c00c3e3-9d53-48d8-805d-8ffa77f12d82', '1e28bd99-497d-4496-8e1a-169693995b18', NULL);
INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('51b06270-cafd-46d9-af06-9ee5a703c41d', '2020-02-28 19:41:01.778+01', '2020-02-28 19:41:01.778+01', 'completed', '9c00c3e3-9d53-48d8-805d-8ffa77f12d82', '60adcc92-64a0-4d87-97ef-a31ccf30517a', NULL);
INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('6da43ddf-b03c-4c1e-b304-517d563aa3f9', '2020-02-28 19:41:01.778+01', '2020-02-28 19:41:01.778+01', 'completed', '9c00c3e3-9d53-48d8-805d-8ffa77f12d82', 'e910b3d3-273d-4492-b68b-b33a5e4cb58d', NULL);


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.teams (id, created, updated, name, role, owners, global, type, object_id, object_type) VALUES ('ebb4cc52-04ed-4390-ad70-be8f438e6012', '2020-02-28 19:39:59.452+01', '2020-02-28 19:39:59.452+01', 'Author', 'author', NULL, NULL, 'team', 'bd429b57-6fc9-4454-a42c-c1f63cfa263c', 'Manuscript');
INSERT INTO public.teams (id, created, updated, name, role, owners, global, type, object_id, object_type) VALUES ('5848e7e9-112e-41cc-8f93-460560a740aa', '2020-02-28 19:40:21.505+01', '2020-02-28 19:40:21.505+01', 'Senior Editor', 'seniorEditor', '["2d88ee35-1fa1-4d49-8f87-0b32bb786c9e"]', NULL, 'team', 'bd429b57-6fc9-4454-a42c-c1f63cfa263c', 'Manuscript');
INSERT INTO public.teams (id, created, updated, name, role, owners, global, type, object_id, object_type) VALUES ('84ef271d-a10c-4d3c-9c44-0568f126e161', '2020-02-28 19:40:21.947+01', '2020-02-28 19:40:21.947+01', 'Handling Editor', 'handlingEditor', '["2d88ee35-1fa1-4d49-8f87-0b32bb786c9e"]', NULL, 'team', 'bd429b57-6fc9-4454-a42c-c1f63cfa263c', 'Manuscript');
INSERT INTO public.teams (id, created, updated, name, role, owners, global, type, object_id, object_type) VALUES ('9c00c3e3-9d53-48d8-805d-8ffa77f12d82', '2020-02-28 19:40:27.284+01', '2020-02-28 19:40:54.755+01', 'Reviewer Editor', 'reviewerEditor', '["53c1ddca-2770-417d-991d-f386d2d06e57"]', NULL, 'team', 'bd429b57-6fc9-4454-a42c-c1f63cfa263c', 'Manuscript');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, fragments, collections, teams, password_reset_token, password_reset_timestamp, type) VALUES ('2d88ee35-1fa1-4d49-8f87-0b32bb786c9e', '2020-02-28 19:39:53.113+01', '2020-02-28 19:39:53.113+01', true, 'admin@example.com', 'admin', '$2b$12$1qAk620zjS3m0H64vepNc.YZLMHtFyFfoIFLH721MltGTovng9U/m', '[]', '[]', NULL, NULL, NULL, 'user');
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, fragments, collections, teams, password_reset_token, password_reset_timestamp, type) VALUES ('1c162384-ef4c-47fc-a89e-d7a03c13cec8', '2020-02-28 19:39:53.855+01', '2020-02-28 19:39:53.855+01', NULL, 'simone@example.com', 'seditor', '$2b$12$jeVSGVlpc3W0PkcS5HneBezNtqdFMUuJSiOGXXYfr0Xtjm2laKM8y', '[]', '[]', NULL, NULL, NULL, 'user');
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, fragments, collections, teams, password_reset_token, password_reset_timestamp, type) VALUES ('53c1ddca-2770-417d-991d-f386d2d06e57', '2020-02-28 19:39:54.24+01', '2020-02-28 19:39:54.24+01', NULL, 'hector@example.com', 'heditor', '$2b$12$p.p4JZBES6JXCD2lqO9D9ORqiZj64ECCoRBpvzHsLPLjYHcnCM/J6', '[]', '[]', NULL, NULL, NULL, 'user');
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, fragments, collections, teams, password_reset_token, password_reset_timestamp, type) VALUES ('bbe263a7-3cc5-4b3a-a6ce-d2cc70425406', '2020-02-28 19:39:53.504+01', '2020-02-28 19:39:59.54+01', NULL, 'john@example.com', 'author', '$2b$12$Bjr9z5v7nPTSDzHG6YtVQ.9M8QBsbiRbkSAeFiwEPZrTqpkxroxEi', '[]', '[]', NULL, NULL, NULL, 'user');
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, fragments, collections, teams, password_reset_token, password_reset_timestamp, type) VALUES ('1e28bd99-497d-4496-8e1a-169693995b18', '2020-02-28 19:39:55.011+01', '2020-02-28 19:41:01.782+01', NULL, 'robert@example.com', 'reviewer2', '$2b$12$E20/golpY0zs.NCSdziUHOfj7GSz7C.CYSDwJh4lX3hboRAo56wtC', '[]', '[]', NULL, NULL, NULL, 'user');
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, fragments, collections, teams, password_reset_token, password_reset_timestamp, type) VALUES ('60adcc92-64a0-4d87-97ef-a31ccf30517a', '2020-02-28 19:39:55.367+01', '2020-02-28 19:41:01.782+01', NULL, 'remionne@example.com', 'reviewer3', '$2b$12$7JVUD5Rhw5bqXwXYbjgFIuuHLcLaaPafwqMOQCab32x6VCaMnwNqm', '[]', '[]', NULL, NULL, NULL, 'user');
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, fragments, collections, teams, password_reset_token, password_reset_timestamp, type) VALUES ('e910b3d3-273d-4492-b68b-b33a5e4cb58d', '2020-02-28 19:39:54.618+01', '2020-02-28 19:41:01.782+01', NULL, 'regina@example.com', 'reviewer1', '$2b$12$4zYpy2jtXufGR3ib/Sh0mOTZHTeuIu1L9PqZKn7pgMs2zq7dXsDuq', '[]', '[]', NULL, NULL, NULL, 'user');


--
-- Name: aliases aliases_pkey; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.aliases
    ADD CONSTRAINT aliases_pkey PRIMARY KEY (id);


--
-- Name: entities entities_pkey; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.entities
    ADD CONSTRAINT entities_pkey PRIMARY KEY (id);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: journals journals_pkey; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.journals
    ADD CONSTRAINT journals_pkey PRIMARY KEY (id);


--
-- Name: manuscripts manuscripts_pkey; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.manuscripts
    ADD CONSTRAINT manuscripts_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: team_members_team_id_user_id_index; Type: INDEX; Schema: public; Owner: test
--

CREATE INDEX team_members_team_id_user_id_index ON public.team_members USING btree (team_id, user_id);


--
-- Name: teams_object_id_object_type_index; Type: INDEX; Schema: public; Owner: test
--

CREATE INDEX teams_object_id_object_type_index ON public.teams USING btree (object_id, object_type);


--
-- Name: team_members team_members_alias_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_alias_id_foreign FOREIGN KEY (alias_id) REFERENCES public.aliases(id);


--
-- Name: team_members team_members_team_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_foreign FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_members team_members_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

