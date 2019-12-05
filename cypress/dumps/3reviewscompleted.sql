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
-- Name: pgboss; Type: SCHEMA; Schema: -; Owner: juretriglav
--

CREATE SCHEMA pgboss;


ALTER SCHEMA pgboss OWNER TO juretriglav;

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
-- Name: aliases; Type: TABLE; Schema: public; Owner: juretriglav
--

CREATE TABLE public.aliases (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    name character varying(255),
    email character varying(255),
    aff character varying(255)
);


ALTER TABLE public.aliases OWNER TO juretriglav;

--
-- Name: entities; Type: TABLE; Schema: public; Owner: juretriglav
--

CREATE TABLE public.entities (
    id uuid NOT NULL,
    data jsonb
);


ALTER TABLE public.entities OWNER TO juretriglav;

--
-- Name: files; Type: TABLE; Schema: public; Owner: juretriglav
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


ALTER TABLE public.files OWNER TO juretriglav;

--
-- Name: journals; Type: TABLE; Schema: public; Owner: juretriglav
--

CREATE TABLE public.journals (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    title text,
    meta jsonb,
    type text NOT NULL
);


ALTER TABLE public.journals OWNER TO juretriglav;

--
-- Name: manuscripts; Type: TABLE; Schema: public; Owner: juretriglav
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


ALTER TABLE public.manuscripts OWNER TO juretriglav;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: juretriglav
--

CREATE TABLE public.migrations (
    id text NOT NULL,
    run_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.migrations OWNER TO juretriglav;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: juretriglav
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


ALTER TABLE public.reviews OWNER TO juretriglav;

--
-- Name: team_members; Type: TABLE; Schema: public; Owner: juretriglav
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


ALTER TABLE public.team_members OWNER TO juretriglav;

--
-- Name: teams; Type: TABLE; Schema: public; Owner: juretriglav
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


ALTER TABLE public.teams OWNER TO juretriglav;

--
-- Name: users; Type: TABLE; Schema: public; Owner: juretriglav
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


ALTER TABLE public.users OWNER TO juretriglav;

--
-- Data for Name: aliases; Type: TABLE DATA; Schema: public; Owner: juretriglav
--



--
-- Data for Name: entities; Type: TABLE DATA; Schema: public; Owner: juretriglav
--



--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: juretriglav
--

INSERT INTO public.files (id, created, updated, object, object_id, label, file_type, filename, url, mime_type, size, type) VALUES ('c30ce54d-01c2-4a8d-abab-7e4698bb442d', '2019-12-05 10:31:18.856+01', '2019-12-05 10:31:18.856+01', 'Manuscript', '48c59f5d-063b-4bdf-b25c-bdbeea5b920f', NULL, 'manuscript', 'test-pdf.pdf', '/4a9ec4b8ec7887d352799acbb0f4b93e.pdf', 'application/pdf', 142400, 'file');


--
-- Data for Name: journals; Type: TABLE DATA; Schema: public; Owner: juretriglav
--

INSERT INTO public.journals (id, created, updated, title, meta, type) VALUES ('d52ff750-649f-4aa1-bd5a-173af317be07', '2019-12-05 10:31:15.422+01', '2019-12-05 10:31:15.422+01', 'My Journal', NULL, 'journal');


--
-- Data for Name: manuscripts; Type: TABLE DATA; Schema: public; Owner: juretriglav
--

INSERT INTO public.manuscripts (id, created, updated, parent_id, status, decision, authors, suggestions, meta, type) VALUES ('48c59f5d-063b-4bdf-b25c-bdbeea5b920f', '2019-12-05 10:31:18.849+01', '2019-12-05 10:31:33.833+01', NULL, 'submitted', NULL, NULL, '{"editors": {"opposed": "Gina Ode", "suggested": "John Ode"}, "reviewers": {"opposed": "James Doe", "suggested": "Jane Doe"}}', '{"notes": [{"content": "This work was supported by the Trust [grant numbers 393,295]; the Natural Environment Research Council [grant number 49493].", "notesType": "fundingAcknowledgement"}, {"content": "", "notesType": "specialInstructions", "__typename": "Note"}], "title": "A Manuscript For The Ages", "abstract": "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem.", "keywords": "quantum, machines, nature", "articleType": "original-research", "declarations": {"openData": "yes", "preregistered": "yes", "researchNexus": "no", "openPeerReview": "yes", "streamlinedReview": "no"}}', 'Manuscript');


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: juretriglav
--

INSERT INTO public.migrations (id, run_at) VALUES ('1524494862-entities.sql', '2019-12-05 10:31:12.929178+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1537450834-files.sql', '2019-12-05 10:31:12.940802+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1537450834-journals.sql', '2019-12-05 10:31:12.952618+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1537450834-manuscript.sql', '2019-12-05 10:31:12.96326+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1537450834-review.sql', '2019-12-05 10:31:12.9737+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1542276313-initial-user-migration.sql', '2019-12-05 10:31:12.983886+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1542801241-initial-team-migration.sql', '2019-12-05 10:31:12.992219+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1547596236-initial-team-member-migration.js', '2019-12-05 10:31:13.026353+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1548205275-move-members.js', '2019-12-05 10:31:13.043161+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1548205276-simplify-object.js', '2019-12-05 10:31:13.055473+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1548328420-add-alias-migration.js', '2019-12-05 10:31:13.074211+01');
INSERT INTO public.migrations (id, run_at) VALUES ('1560771823-add-unique-constraints-to-users.sql', '2019-12-05 10:31:13.083803+01');


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: juretriglav
--

INSERT INTO public.reviews (id, created, updated, recommendation, is_decision, comments, user_id, manuscript_id, type) VALUES ('b03aedd0-5d98-4420-8e0e-faeb559f0662', '2019-12-05 10:31:47.505+01', '2019-12-05 10:31:53.332+01', 'accepted', false, '[{"type": "note", "content": "Great research into CC bases in the ky289 variant are mutated to TC which results in the truncation of the SAD-1."}, {"type": "confidential", "content": "Not too bad."}]', '52e70751-4bed-47e0-bc3c-a7ed0badb80b', '48c59f5d-063b-4bdf-b25c-bdbeea5b920f', 'Review');
INSERT INTO public.reviews (id, created, updated, recommendation, is_decision, comments, user_id, manuscript_id, type) VALUES ('276b355d-463e-496a-b974-d17dedfb07bc', '2019-12-05 10:31:56.425+01', '2019-12-05 10:32:01.636+01', 'revise', false, '[{"type": "note", "content": "Mediocre analysis of Iron-Sulfur ClUster assembly enzyme homolog."}, {"type": "confidential", "content": "It is so so."}]', '8af22450-8180-4bc9-b0df-3612a9ec444f', '48c59f5d-063b-4bdf-b25c-bdbeea5b920f', 'Review');
INSERT INTO public.reviews (id, created, updated, recommendation, is_decision, comments, user_id, manuscript_id, type) VALUES ('45cfcc5d-d923-4336-857c-7d1856155262', '2019-12-05 10:32:04.876+01', '2019-12-05 10:32:10.991+01', 'rejected', false, '[{"type": "note", "content": "mTOR-Is positively influence the occurrence and course of certain tumors after solid organ transplantation."}, {"type": "confidential", "content": "It is not good."}]', '3a046ffe-75d9-443f-8551-ee9588206c74', '48c59f5d-063b-4bdf-b25c-bdbeea5b920f', 'Review');


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: juretriglav
--

INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('48012a75-642f-4790-9197-c3f055ecfee3', '2019-12-05 10:31:18.862+01', '2019-12-05 10:31:18.862+01', NULL, '6264aa83-5392-409b-9bb2-a0ec88d32a29', '5e20fe9e-240d-432f-aef8-d5a940711eb9', NULL);
INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('fca8bce4-a019-460a-bc59-f3cd022cfcc3', '2019-12-05 10:31:38.124+01', '2019-12-05 10:31:38.124+01', NULL, '93bc8ed2-b97a-43b6-8541-3ce342a86e2a', '322bb9b4-1908-408c-b375-7aaaae3aed86', NULL);
INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('9cac9df4-ef15-48de-94fa-7451a2c67edf', '2019-12-05 10:31:38.532+01', '2019-12-05 10:31:38.532+01', NULL, '897c10ff-c5fa-4ce0-bcb1-6b9c144e9fc9', 'd95ddba5-3c59-405a-ab81-5b61a91c7e15', NULL);
INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('cd7aaf67-4295-4b47-8811-0fdada2ac082', '2019-12-05 10:32:11.277+01', '2019-12-05 10:32:11.277+01', 'completed', '7a2c85f9-24b2-4eeb-9d59-93361409956d', '3a046ffe-75d9-443f-8551-ee9588206c74', NULL);
INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('7be8f088-9c71-4bf7-be9a-356ac92a6ab7', '2019-12-05 10:32:11.277+01', '2019-12-05 10:32:11.277+01', 'completed', '7a2c85f9-24b2-4eeb-9d59-93361409956d', '52e70751-4bed-47e0-bc3c-a7ed0badb80b', NULL);
INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('9304fe54-9380-48bf-8c3f-8655f5dfea39', '2019-12-05 10:32:11.277+01', '2019-12-05 10:32:11.277+01', 'completed', '7a2c85f9-24b2-4eeb-9d59-93361409956d', '8af22450-8180-4bc9-b0df-3612a9ec444f', NULL);


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: juretriglav
--

INSERT INTO public.teams (id, created, updated, name, role, owners, global, type, object_id, object_type) VALUES ('6264aa83-5392-409b-9bb2-a0ec88d32a29', '2019-12-05 10:31:18.857+01', '2019-12-05 10:31:18.857+01', 'Author', 'author', NULL, NULL, 'team', '48c59f5d-063b-4bdf-b25c-bdbeea5b920f', 'Manuscript');
INSERT INTO public.teams (id, created, updated, name, role, owners, global, type, object_id, object_type) VALUES ('93bc8ed2-b97a-43b6-8541-3ce342a86e2a', '2019-12-05 10:31:38.12+01', '2019-12-05 10:31:38.12+01', 'Senior Editor', 'seniorEditor', '["29480975-6656-4e30-b38f-5ea4e8875f7b"]', NULL, 'team', '48c59f5d-063b-4bdf-b25c-bdbeea5b920f', 'Manuscript');
INSERT INTO public.teams (id, created, updated, name, role, owners, global, type, object_id, object_type) VALUES ('897c10ff-c5fa-4ce0-bcb1-6b9c144e9fc9', '2019-12-05 10:31:38.53+01', '2019-12-05 10:31:38.53+01', 'Handling Editor', 'handlingEditor', '["29480975-6656-4e30-b38f-5ea4e8875f7b"]', NULL, 'team', '48c59f5d-063b-4bdf-b25c-bdbeea5b920f', 'Manuscript');
INSERT INTO public.teams (id, created, updated, name, role, owners, global, type, object_id, object_type) VALUES ('7a2c85f9-24b2-4eeb-9d59-93361409956d', '2019-12-05 10:31:42.287+01', '2019-12-05 10:32:04.86+01', 'Reviewer Editor', 'reviewerEditor', '["d95ddba5-3c59-405a-ab81-5b61a91c7e15"]', NULL, 'team', '48c59f5d-063b-4bdf-b25c-bdbeea5b920f', 'Manuscript');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: juretriglav
--

INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, fragments, collections, teams, password_reset_token, password_reset_timestamp, type) VALUES ('29480975-6656-4e30-b38f-5ea4e8875f7b', '2019-12-05 10:31:13.488+01', '2019-12-05 10:31:13.488+01', true, 'admin@example.com', 'admin', '$2b$12$8wk0Wqg3vKGedUOEbLPe9eMk7un2suPt5CIT1B1rk5r./NOAQArLC', '[]', '[]', NULL, NULL, NULL, 'user');
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, fragments, collections, teams, password_reset_token, password_reset_timestamp, type) VALUES ('322bb9b4-1908-408c-b375-7aaaae3aed86', '2019-12-05 10:31:14.165+01', '2019-12-05 10:31:14.165+01', NULL, 'simone@example.com', 'seditor', '$2b$12$CWXbJLl59JakHInhl.GmMuVOqY5NJot0LjHxIOU.nerKtozmj5Chq', '[]', '[]', NULL, NULL, NULL, 'user');
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, fragments, collections, teams, password_reset_token, password_reset_timestamp, type) VALUES ('d95ddba5-3c59-405a-ab81-5b61a91c7e15', '2019-12-05 10:31:14.484+01', '2019-12-05 10:31:14.484+01', NULL, 'hector@example.com', 'heditor', '$2b$12$sKycgevQbfVM7WrtOYojq.Xb3yQ5e.dOnG1u45ggCu.SnEIHVbiri', '[]', '[]', NULL, NULL, NULL, 'user');
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, fragments, collections, teams, password_reset_token, password_reset_timestamp, type) VALUES ('5e20fe9e-240d-432f-aef8-d5a940711eb9', '2019-12-05 10:31:13.802+01', '2019-12-05 10:31:18.866+01', NULL, 'john@example.com', 'author', '$2b$12$AH584m.NlWkF2RFoVi5BGORp7ZzLOF9uFI2szZX5TgDjS8I9SBgT2', '[]', '[]', NULL, NULL, NULL, 'user');
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, fragments, collections, teams, password_reset_token, password_reset_timestamp, type) VALUES ('3a046ffe-75d9-443f-8551-ee9588206c74', '2019-12-05 10:31:15.413+01', '2019-12-05 10:32:11.282+01', NULL, 'remionne@example.com', 'reviewer3', '$2b$12$A4M4wO4LoJEJ5AVGjw55euqNbOgku1JNGQKDdDOHrlWRRs4X8zAMK', '[]', '[]', NULL, NULL, NULL, 'user');
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, fragments, collections, teams, password_reset_token, password_reset_timestamp, type) VALUES ('52e70751-4bed-47e0-bc3c-a7ed0badb80b', '2019-12-05 10:31:14.789+01', '2019-12-05 10:32:11.282+01', NULL, 'regina@example.com', 'reviewer1', '$2b$12$E70uFzCElsUOIuFqGsWRE.tLECjcSwolyKayAu9iTZymTyHlZcVDy', '[]', '[]', NULL, NULL, NULL, 'user');
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, fragments, collections, teams, password_reset_token, password_reset_timestamp, type) VALUES ('8af22450-8180-4bc9-b0df-3612a9ec444f', '2019-12-05 10:31:15.111+01', '2019-12-05 10:32:11.282+01', NULL, 'robert@example.com', 'reviewer2', '$2b$12$T9JQWNORnP2bxurH21AKZujWSPsfayvS7SNwDLoUn81Z2Zfo1dsAy', '[]', '[]', NULL, NULL, NULL, 'user');


--
-- Name: aliases aliases_pkey; Type: CONSTRAINT; Schema: public; Owner: juretriglav
--

ALTER TABLE ONLY public.aliases
    ADD CONSTRAINT aliases_pkey PRIMARY KEY (id);


--
-- Name: entities entities_pkey; Type: CONSTRAINT; Schema: public; Owner: juretriglav
--

ALTER TABLE ONLY public.entities
    ADD CONSTRAINT entities_pkey PRIMARY KEY (id);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: juretriglav
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: journals journals_pkey; Type: CONSTRAINT; Schema: public; Owner: juretriglav
--

ALTER TABLE ONLY public.journals
    ADD CONSTRAINT journals_pkey PRIMARY KEY (id);


--
-- Name: manuscripts manuscripts_pkey; Type: CONSTRAINT; Schema: public; Owner: juretriglav
--

ALTER TABLE ONLY public.manuscripts
    ADD CONSTRAINT manuscripts_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: juretriglav
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: juretriglav
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: juretriglav
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: juretriglav
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: juretriglav
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: juretriglav
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: juretriglav
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: team_members_team_id_user_id_index; Type: INDEX; Schema: public; Owner: juretriglav
--

CREATE INDEX team_members_team_id_user_id_index ON public.team_members USING btree (team_id, user_id);


--
-- Name: teams_object_id_object_type_index; Type: INDEX; Schema: public; Owner: juretriglav
--

CREATE INDEX teams_object_id_object_type_index ON public.teams USING btree (object_id, object_type);


--
-- Name: team_members team_members_alias_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: juretriglav
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_alias_id_foreign FOREIGN KEY (alias_id) REFERENCES public.aliases(id);


--
-- Name: team_members team_members_team_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: juretriglav
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_foreign FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_members team_members_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: juretriglav
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

