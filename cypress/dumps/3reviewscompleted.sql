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


--
-- Name: job_state; Type: TYPE; Schema: pgboss; Owner: test
--

CREATE TYPE pgboss.job_state AS ENUM (
    'created',
    'retry',
    'active',
    'completed',
    'expired',
    'cancelled',
    'failed'
);


ALTER TYPE pgboss.job_state OWNER TO test;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: archive; Type: TABLE; Schema: pgboss; Owner: test
--

CREATE TABLE pgboss.archive (
    id uuid NOT NULL,
    name text NOT NULL,
    priority integer NOT NULL,
    data jsonb,
    state pgboss.job_state NOT NULL,
    retrylimit integer NOT NULL,
    retrycount integer NOT NULL,
    retrydelay integer NOT NULL,
    retrybackoff boolean NOT NULL,
    startafter timestamp with time zone NOT NULL,
    startedon timestamp with time zone,
    singletonkey text,
    singletonon timestamp without time zone,
    expirein interval NOT NULL,
    createdon timestamp with time zone NOT NULL,
    completedon timestamp with time zone,
    archivedon timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE pgboss.archive OWNER TO test;

--
-- Name: job; Type: TABLE; Schema: pgboss; Owner: test
--

CREATE TABLE pgboss.job (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    name text NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    data jsonb,
    state pgboss.job_state DEFAULT 'created'::pgboss.job_state NOT NULL,
    retrylimit integer DEFAULT 0 NOT NULL,
    retrycount integer DEFAULT 0 NOT NULL,
    retrydelay integer DEFAULT 0 NOT NULL,
    retrybackoff boolean DEFAULT false NOT NULL,
    startafter timestamp with time zone DEFAULT now() NOT NULL,
    startedon timestamp with time zone,
    singletonkey text,
    singletonon timestamp without time zone,
    expirein interval DEFAULT '00:15:00'::interval NOT NULL,
    createdon timestamp with time zone DEFAULT now() NOT NULL,
    completedon timestamp with time zone
);


ALTER TABLE pgboss.job OWNER TO test;

--
-- Name: version; Type: TABLE; Schema: pgboss; Owner: test
--

CREATE TABLE pgboss.version (
    version text NOT NULL
);


ALTER TABLE pgboss.version OWNER TO test;

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
-- Data for Name: archive; Type: TABLE DATA; Schema: pgboss; Owner: test
--



--
-- Data for Name: job; Type: TABLE DATA; Schema: pgboss; Owner: test
--



--
-- Data for Name: version; Type: TABLE DATA; Schema: pgboss; Owner: test
--

INSERT INTO pgboss.version (version) VALUES ('10');


--
-- Data for Name: aliases; Type: TABLE DATA; Schema: public; Owner: test
--



--
-- Data for Name: entities; Type: TABLE DATA; Schema: public; Owner: test
--



--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.files (id, created, updated, object, object_id, label, file_type, filename, url, mime_type, size, type) VALUES ('89e23936-9271-46bc-9585-19d21a67bba9', '2019-12-05 16:26:09.886+01', '2019-12-05 16:26:09.886+01', 'Manuscript', '0f66a0d2-52b2-4de3-8efb-d07b3e6a087d', NULL, 'manuscript', 'test-pdf.pdf', '/0d6bf973199e958342350dcb9a5146eb.pdf', 'application/pdf', 106798, 'file');


--
-- Data for Name: journals; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.journals (id, created, updated, title, meta, type) VALUES ('f3e14b10-9027-4c3c-be79-68aa5ff0d6c9', '2019-12-05 16:26:07.424+01', '2019-12-05 16:26:07.424+01', 'My Journal', NULL, 'journal');


--
-- Data for Name: manuscripts; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.manuscripts (id, created, updated, parent_id, status, decision, authors, suggestions, meta, type) VALUES ('0f66a0d2-52b2-4de3-8efb-d07b3e6a087d', '2019-12-05 16:26:09.861+01', '2019-12-05 16:26:24.861+01', NULL, 'submitted', NULL, NULL, '{"editors": {"opposed": "Gina Ode", "suggested": "John Ode"}, "reviewers": {"opposed": "James Doe", "suggested": "Jane Doe"}}', '{"notes": [{"content": "This work was supported by the Trust [grant numbers 393,295]; the Natural Environment Research Council [grant number 49493].", "notesType": "fundingAcknowledgement"}, {"content": "", "notesType": "specialInstructions", "__typename": "Note"}], "title": "A Manuscript For The Ages", "abstract": "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem.", "keywords": "quantum, machines, nature", "articleType": "original-research", "declarations": {"openData": "yes", "preregistered": "yes", "researchNexus": "no", "openPeerReview": "yes", "previouslySubmitted": "no"}, "articleSections": ["cognitive-psychology"]}', 'Manuscript');


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.migrations (id, run_at) VALUES ('1524494862-entities.sql', '2019-12-05 16:26:05.130061+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1537450834-files.sql', '2019-12-05 16:26:05.140123+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1537450834-journals.sql', '2019-12-05 16:26:05.149932+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1537450834-manuscript.sql', '2019-12-05 16:26:05.161293+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1537450834-review.sql', '2019-12-05 16:26:05.198325+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1542276313-initial-user-migration.sql', '2019-12-05 16:26:05.209449+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1542801241-initial-team-migration.sql', '2019-12-05 16:26:05.219017+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1547596236-initial-team-member-migration.js', '2019-12-05 16:26:05.236755+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1548205275-move-members.js', '2019-12-05 16:26:05.244594+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1548205276-simplify-object.js', '2019-12-05 16:26:05.257434+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1548328420-add-alias-migration.js', '2019-12-05 16:26:05.273399+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1560771823-add-unique-constraints-to-users.sql', '2019-12-05 16:26:05.2811+01');


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.reviews (id, created, updated, recommendation, is_decision, comments, user_id, manuscript_id, type) VALUES ('e49108aa-9074-4911-b62d-3f6e59340033', '2019-12-05 16:26:40.032+01', '2019-12-05 16:26:45.883+01', 'accepted', false, '[{"type": "note", "content": "Great research into CC bases in the ky289 variant are mutated to TC which results in the truncation of the SAD-1."}, {"type": "confidential", "content": "Not too bad."}]', '4338f5c1-6182-4cc4-be29-fd9ccc7cbe0e', '0f66a0d2-52b2-4de3-8efb-d07b3e6a087d', 'Review');
INSERT INTO public.reviews (id, created, updated, recommendation, is_decision, comments, user_id, manuscript_id, type) VALUES ('d8f3ff17-7845-46bc-859c-69f2b6fde343', '2019-12-05 16:26:49.104+01', '2019-12-05 16:26:54.224+01', 'revise', false, '[{"type": "note", "content": "Mediocre analysis of Iron-Sulfur ClUster assembly enzyme homolog."}, {"type": "confidential", "content": "It is so so."}]', '058ae58b-f87c-4ed3-b74b-8451ce71ed67', '0f66a0d2-52b2-4de3-8efb-d07b3e6a087d', 'Review');
INSERT INTO public.reviews (id, created, updated, recommendation, is_decision, comments, user_id, manuscript_id, type) VALUES ('8224969d-0a32-4a52-9263-6d97a3033205', '2019-12-05 16:26:57.429+01', '2019-12-05 16:27:03.718+01', 'rejected', false, '[{"type": "note", "content": "mTOR-Is positively influence the occurrence and course of certain tumors after solid organ transplantation."}, {"type": "confidential", "content": "It is not good."}]', '549eea97-67fe-481e-a0d4-9e378375b152', '0f66a0d2-52b2-4de3-8efb-d07b3e6a087d', 'Review');


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('7474b1c0-886f-4517-a877-81168f1abdc3', '2019-12-05 16:26:09.925+01', '2019-12-05 16:26:09.925+01', NULL, 'f92f3eef-c855-4ff6-b5a3-efedce2657b1', 'bf371f23-e97d-4750-af59-f6ac52f93ef1', NULL);
INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('d4607e98-5648-43a5-b82e-6f2faff1f606', '2019-12-05 16:26:28.723+01', '2019-12-05 16:26:28.723+01', NULL, '120880f3-35c0-400d-b428-7d7f5995b894', '327368fc-7ad8-4bcd-8f01-ff0267c41fe7', NULL);
INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('aff39942-2f5d-48d5-b5c2-0ffa9f7d40b0', '2019-12-05 16:26:29.166+01', '2019-12-05 16:26:29.166+01', NULL, '0f9a96a3-16c4-485a-af6e-b0cd1cab5600', 'f18c93b2-13ae-4918-8b2a-fc10e86f36f7', NULL);
INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('b2db32f0-90f5-4b11-8523-4557c1d1ea53', '2019-12-05 16:27:03.998+01', '2019-12-05 16:27:03.998+01', 'completed', '17120f87-8f2a-4c45-a5fd-1ecbf9e024e3', '058ae58b-f87c-4ed3-b74b-8451ce71ed67', NULL);
INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('9a66383b-516b-4dfd-9169-9b03a5cd3285', '2019-12-05 16:27:03.998+01', '2019-12-05 16:27:03.998+01', 'completed', '17120f87-8f2a-4c45-a5fd-1ecbf9e024e3', '4338f5c1-6182-4cc4-be29-fd9ccc7cbe0e', NULL);
INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('918d4af4-e232-45fd-818b-67c9d2823d38', '2019-12-05 16:27:03.998+01', '2019-12-05 16:27:03.998+01', 'completed', '17120f87-8f2a-4c45-a5fd-1ecbf9e024e3', '549eea97-67fe-481e-a0d4-9e378375b152', NULL);


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.teams (id, created, updated, name, role, owners, global, type, object_id, object_type) VALUES ('f92f3eef-c855-4ff6-b5a3-efedce2657b1', '2019-12-05 16:26:09.884+01', '2019-12-05 16:26:09.884+01', 'Author', 'author', NULL, NULL, 'team', '0f66a0d2-52b2-4de3-8efb-d07b3e6a087d', 'Manuscript');
INSERT INTO public.teams (id, created, updated, name, role, owners, global, type, object_id, object_type) VALUES ('120880f3-35c0-400d-b428-7d7f5995b894', '2019-12-05 16:26:28.718+01', '2019-12-05 16:26:28.718+01', 'Senior Editor', 'seniorEditor', '["c0e7a747-a871-46b4-9164-2a20a18ff7df"]', NULL, 'team', '0f66a0d2-52b2-4de3-8efb-d07b3e6a087d', 'Manuscript');
INSERT INTO public.teams (id, created, updated, name, role, owners, global, type, object_id, object_type) VALUES ('0f9a96a3-16c4-485a-af6e-b0cd1cab5600', '2019-12-05 16:26:29.157+01', '2019-12-05 16:26:29.157+01', 'Handling Editor', 'handlingEditor', '["c0e7a747-a871-46b4-9164-2a20a18ff7df"]', NULL, 'team', '0f66a0d2-52b2-4de3-8efb-d07b3e6a087d', 'Manuscript');
INSERT INTO public.teams (id, created, updated, name, role, owners, global, type, object_id, object_type) VALUES ('17120f87-8f2a-4c45-a5fd-1ecbf9e024e3', '2019-12-05 16:26:33.992+01', '2019-12-05 16:26:57.415+01', 'Reviewer Editor', 'reviewerEditor', '["f18c93b2-13ae-4918-8b2a-fc10e86f36f7"]', NULL, 'team', '0f66a0d2-52b2-4de3-8efb-d07b3e6a087d', 'Manuscript');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, fragments, collections, teams, password_reset_token, password_reset_timestamp, type) VALUES ('c0e7a747-a871-46b4-9164-2a20a18ff7df', '2019-12-05 16:26:05.59+01', '2019-12-05 16:26:05.59+01', true, 'admin@example.com', 'admin', '$2b$12$EChACaS/XzaicNq.iUBifen4tXo2Yc0.ls9KltXrNy8ZuyOw3lM1u', '[]', '[]', NULL, NULL, NULL, 'user');
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, fragments, collections, teams, password_reset_token, password_reset_timestamp, type) VALUES ('327368fc-7ad8-4bcd-8f01-ff0267c41fe7', '2019-12-05 16:26:06.194+01', '2019-12-05 16:26:06.194+01', NULL, 'simone@example.com', 'seditor', '$2b$12$EluikN3SVbcn5lBaKaBciuBDwUzfXuk4bUbddyQs8uC3Q5KBpkgMO', '[]', '[]', NULL, NULL, NULL, 'user');
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, fragments, collections, teams, password_reset_token, password_reset_timestamp, type) VALUES ('f18c93b2-13ae-4918-8b2a-fc10e86f36f7', '2019-12-05 16:26:06.505+01', '2019-12-05 16:26:06.505+01', NULL, 'hector@example.com', 'heditor', '$2b$12$JhrX4DRzem.ov09.tvRI.OSdmQWS1u/t32oDdJidfR9n/9N9opDeO', '[]', '[]', NULL, NULL, NULL, 'user');
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, fragments, collections, teams, password_reset_token, password_reset_timestamp, type) VALUES ('bf371f23-e97d-4750-af59-f6ac52f93ef1', '2019-12-05 16:26:05.89+01', '2019-12-05 16:26:09.937+01', NULL, 'john@example.com', 'author', '$2b$12$rS/zdEOTE3Vu8p68vCJrR.tqMrXFyzBX4IO7S/T8iFVcf8lOQ.qKK', '[]', '[]', NULL, NULL, NULL, 'user');
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, fragments, collections, teams, password_reset_token, password_reset_timestamp, type) VALUES ('058ae58b-f87c-4ed3-b74b-8451ce71ed67', '2019-12-05 16:26:07.111+01', '2019-12-05 16:27:04.002+01', NULL, 'robert@example.com', 'reviewer2', '$2b$12$DyVhyy5xuoUu5pEgy2bEXe2xlZtpHbjaXs2uj.jGzvBmnQzN49MRW', '[]', '[]', NULL, NULL, NULL, 'user');
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, fragments, collections, teams, password_reset_token, password_reset_timestamp, type) VALUES ('4338f5c1-6182-4cc4-be29-fd9ccc7cbe0e', '2019-12-05 16:26:06.803+01', '2019-12-05 16:27:04.002+01', NULL, 'regina@example.com', 'reviewer1', '$2b$12$yVgiMTluowuQvP5zrZlRLu56VNZ67IvC9njHmVFSUYkJjuFZ.xg6q', '[]', '[]', NULL, NULL, NULL, 'user');
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, fragments, collections, teams, password_reset_token, password_reset_timestamp, type) VALUES ('549eea97-67fe-481e-a0d4-9e378375b152', '2019-12-05 16:26:07.413+01', '2019-12-05 16:27:04.002+01', NULL, 'remionne@example.com', 'reviewer3', '$2b$12$ibUUZ.7BySYtaxEgFetaouFXGuiqfhvA7CY13tiRZ/uhIqejA3UFO', '[]', '[]', NULL, NULL, NULL, 'user');


--
-- Name: job job_pkey; Type: CONSTRAINT; Schema: pgboss; Owner: test
--

ALTER TABLE ONLY pgboss.job
    ADD CONSTRAINT job_pkey PRIMARY KEY (id);


--
-- Name: version version_pkey; Type: CONSTRAINT; Schema: pgboss; Owner: test
--

ALTER TABLE ONLY pgboss.version
    ADD CONSTRAINT version_pkey PRIMARY KEY (version);


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
-- Name: archive_id_idx; Type: INDEX; Schema: pgboss; Owner: test
--

CREATE INDEX archive_id_idx ON pgboss.archive USING btree (id);


--
-- Name: job_name; Type: INDEX; Schema: pgboss; Owner: test
--

CREATE INDEX job_name ON pgboss.job USING btree (name text_pattern_ops);


--
-- Name: job_singletonkey; Type: INDEX; Schema: pgboss; Owner: test
--

CREATE UNIQUE INDEX job_singletonkey ON pgboss.job USING btree (name, singletonkey) WHERE ((state < 'completed'::pgboss.job_state) AND (singletonon IS NULL));


--
-- Name: job_singletonkeyon; Type: INDEX; Schema: pgboss; Owner: test
--

CREATE UNIQUE INDEX job_singletonkeyon ON pgboss.job USING btree (name, singletonon, singletonkey) WHERE (state < 'expired'::pgboss.job_state);


--
-- Name: job_singletonon; Type: INDEX; Schema: pgboss; Owner: test
--

CREATE UNIQUE INDEX job_singletonon ON pgboss.job USING btree (name, singletonon) WHERE ((state < 'expired'::pgboss.job_state) AND (singletonkey IS NULL));


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

