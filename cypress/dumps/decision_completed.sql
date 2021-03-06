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
    name text,
    email text,
    aff text
);


ALTER TABLE public.aliases OWNER TO test;

--
-- Name: channel_members; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public.channel_members (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    user_id uuid NOT NULL,
    channel_id uuid NOT NULL
);


ALTER TABLE public.channel_members OWNER TO test;

--
-- Name: channels; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public.channels (
    id uuid NOT NULL,
    manuscript_id uuid,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    topic text,
    type text
);


ALTER TABLE public.channels OWNER TO test;

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
    label text,
    file_type text,
    filename text,
    url text,
    mime_type text,
    size integer,
    type text NOT NULL,
    manuscript_id uuid,
    review_comment_id uuid,
    CONSTRAINT exactly_one_file_owner CHECK (((((manuscript_id IS NOT NULL))::integer + ((review_comment_id IS NOT NULL))::integer) = 1))
);


ALTER TABLE public.files OWNER TO test;

--
-- Name: identities; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public.identities (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    type text NOT NULL,
    identifier text,
    name text,
    aff text,
    oauth jsonb,
    is_default boolean
);


ALTER TABLE public.identities OWNER TO test;

--
-- Name: manuscripts; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public.manuscripts (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    parent_id uuid,
    submitter_id uuid,
    status text,
    decision text,
    authors jsonb,
    suggestions jsonb,
    meta jsonb,
    submission jsonb,
    published timestamp with time zone,
    type text NOT NULL
);


ALTER TABLE public.manuscripts OWNER TO test;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public.messages (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    channel_id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    content text
);


ALTER TABLE public.messages OWNER TO test;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public.migrations (
    id text NOT NULL,
    run_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.migrations OWNER TO test;

--
-- Name: review_comments; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public.review_comments (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    review_id uuid,
    user_id uuid,
    content text,
    comment_type text,
    type text
);


ALTER TABLE public.review_comments OWNER TO test;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public.reviews (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    recommendation text,
    is_decision boolean DEFAULT false,
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
    members jsonb,
    owners jsonb,
    global boolean,
    type text NOT NULL,
    manuscript_id uuid
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
    teams jsonb,
    password_reset_token text,
    password_reset_timestamp timestamp with time zone,
    type text NOT NULL,
    profile_picture text,
    online boolean
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

INSERT INTO pgboss.version (version) VALUES ('11');


--
-- Data for Name: aliases; Type: TABLE DATA; Schema: public; Owner: test
--



--
-- Data for Name: channel_members; Type: TABLE DATA; Schema: public; Owner: test
--



--
-- Data for Name: channels; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.channels (id, manuscript_id, created, updated, topic, type) VALUES ('a183114f-ed43-43d2-9852-e95b546c94f0', 'feb4db67-c975-446e-9131-1b92943cf8ed', '2020-08-16 23:19:04.294+02', '2020-08-16 23:19:04.294+02', 'Manuscript discussion', 'all');
INSERT INTO public.channels (id, manuscript_id, created, updated, topic, type) VALUES ('9a85e645-3b16-4e1c-8e84-73af36c48712', 'feb4db67-c975-446e-9131-1b92943cf8ed', '2020-08-16 23:19:04.294+02', '2020-08-16 23:19:04.294+02', 'Editorial discussion', 'editorial');


--
-- Data for Name: entities; Type: TABLE DATA; Schema: public; Owner: test
--



--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.files (id, created, updated, label, file_type, filename, url, mime_type, size, type, manuscript_id, review_comment_id) VALUES ('cbc2943a-bd1e-46d2-a7eb-aea5109893ed', '2020-08-16 23:19:25.243+02', '2020-08-16 23:19:25.243+02', NULL, 'supplementary', 'test-pdf.pdf', '/static/uploads/fa2c9dcd868b920e3cae84ab494f3468.pdf', 'application/pdf', 142400, 'file', 'feb4db67-c975-446e-9131-1b92943cf8ed', NULL);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('d341a633-cdce-4a7f-a9ad-5afc03cd0dd1', '027afa6a-edbc-486e-bb31-71e12f8ea1c5', '2020-07-21 16:17:24.741+02', '2020-07-21 16:17:25.87+02', 'orcid', '0000-0002-0564-2016', 'Emily Clay', NULL, '{"accessToken": "079a1165-31e5-4b59-9a99-d80ff7a21ebf", "refreshToken": "ccadc737-defc-419e-823b-a9f3673848ba"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('bcda196e-765a-42c8-94da-ca2e43b80f96', '3802b0e7-aadc-45de-9cf9-918fede99b97', '2020-07-21 16:30:45.721+02', '2020-07-21 16:33:26.742+02', 'orcid', '0000-0002-5641-5729', 'Sinead Sullivan', NULL, '{"accessToken": "ef1ed3ec-8371-41b2-a136-fd196ae52a72", "refreshToken": "6972dace-d9a6-4cd3-a2ad-ec7eb3e457c7"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('4af83984-6359-47c5-a075-5ddfa9c555d9', '0da0bbec-9261-4706-b990-0c10aa3cc6b4', '2020-07-21 16:35:06.127+02', '2020-07-21 16:35:07.104+02', 'orcid', '0000-0002-7645-9921', 'Sherry Crofoot', NULL, '{"accessToken": "2ad4e130-0775-4e13-87fb-8e8f5a0570ae", "refreshToken": "159933d9-2020-4c02-bdfb-163af41017dc"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('acfa1777-0aec-4fe1-bc16-92bb9d19e884', '85e1300e-003c-4e96-987b-23812f902477', '2020-07-21 16:35:38.384+02', '2020-07-21 16:35:39.358+02', 'orcid', '0000-0002-9429-4446', 'Elaine Barnes', NULL, '{"accessToken": "dcf07bc7-e59c-41b3-9ce0-924ac20aeeea", "refreshToken": "ae49d6a1-8e62-419d-8767-4a3ec22c1950"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('88c85115-d83c-42d7-a1a1-0139827977da', '40e3d054-9ac8-4c0f-84ed-e3c6307662cd', '2020-07-21 16:36:24.975+02', '2020-07-21 16:36:26.059+02', 'orcid', '0000-0001-5956-7341', 'Gale Davis', NULL, '{"accessToken": "3e9f6f6c-7cc0-4afa-9fdf-6ed377c36aad", "refreshToken": "80b1e911-df97-43f1-9f11-17b61913f6d7"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('049f91da-c84e-4b80-be2e-6e0cfca7a136', '231717dd-ba09-43d4-ac98-9d5542b27a0c', '2020-07-22 14:18:36.611+02', '2020-07-22 14:18:37.745+02', 'orcid', '0000-0003-2536-230X', 'Test Account', NULL, '{"accessToken": "eb551178-79e5-4189-8c5f-0a553092a9b5", "refreshToken": "4506fa5f-bd77-4867-afb4-0b07ea5302d6"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('2fb8359c-239c-43fa-91f5-1ff2058272a6', '1d599f2c-d293-4d5e-b6c1-ba34e81e3fc8', '2020-07-24 15:21:54.604+02', '2020-07-24 15:21:55.7+02', 'orcid', '0000-0003-1838-2441', 'Joanne Pilger', NULL, '{"accessToken": "842de329-ef16-4461-b83b-e8fe57238904", "refreshToken": "524fbdc5-9c67-4b4c-af17-2ce4cf294e88"}', true);


--
-- Data for Name: manuscripts; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.manuscripts (id, created, updated, parent_id, submitter_id, status, decision, authors, suggestions, meta, submission, published, type) VALUES ('feb4db67-c975-446e-9131-1b92943cf8ed', '2020-08-16 23:19:04.249+02', '2020-08-16 23:20:23.033+02', NULL, '027afa6a-edbc-486e-bb31-71e12f8ea1c5', 'accepted', 'accepted', NULL, NULL, '{"title": "My URL submission"}', '{"irb": "yes", "name": "Emily Clay", "cover": "This is my cover letter", "links": [{"url": "https://doi.org/10.6084/m9.figshare.913521.v1"}, {"url": "https://github.com/jure/mathtype_to_mathml"}], "ethics": "This is my ethics statement", "contact": "emily@example.com", "methods": ["Functional MRI", "Optical Imaging"], "datacode": "This is my data and code availability statement", "humanMRI": "3T", "keywords": "some, keywords", "packages": ["SPM", "FSL"], "subjects": "patients", "suggested": "Erica James, Matthew Matretzky", "objectType": "software", "affiliation": "Example University, Egland", "otherMethods": "Erica James, Matthew Matretzky", "humanMRIother": "7T", "otherPackages": "Jupyter, Stencila", "animal_research_approval": "yes"}', NULL, 'Manuscript');


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: test
--



--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.migrations (id, run_at) VALUES ('1524494862-entities.sql', '2020-08-16 22:36:46.642584+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1542276313-initial-user-migration.sql', '2020-08-16 22:36:46.654019+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1560771823-add-unique-constraints-to-users.sql', '2020-08-16 22:36:46.66205+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1580908536-add-identities.sql', '2020-08-16 22:36:46.674013+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1581371297-migrate-users-to-identities.js', '2020-08-16 22:36:46.695786+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1581450834-manuscript.sql', '2020-08-16 22:36:46.705481+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1582930582-drop-fragments-and-collections.js', '2020-08-16 22:36:46.715537+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1585323910-add-channels.sql', '2020-08-16 22:36:46.728966+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1585344885-add-messages.sql', '2020-08-16 22:36:46.743035+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1585513226-add-profile-pic.sql', '2020-08-16 22:36:46.748428+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1592915682-change-identities-constraint.sql', '2020-08-16 22:36:46.756393+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1596830547-review.sql', '2020-08-16 22:36:46.766024+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1596830548-add-review-comments.sql', '2020-08-16 22:36:46.776351+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1596830548-initial-team-migration.sql', '2020-08-16 22:36:46.795918+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1596838897-files.sql', '2020-08-16 22:36:46.807663+02');


--
-- Data for Name: review_comments; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.review_comments (id, created, updated, review_id, user_id, content, comment_type, type) VALUES ('8a085610-99ef-4017-bb3c-c70f3ab1e748', '2020-08-16 23:19:57.152+02', '2020-08-16 23:19:57.152+02', '4d506030-cbb8-4368-be90-58c973c5abaa', NULL, '<p>Great paper, congratulations! Gale Davis</p>', 'review', 'ReviewComment');
INSERT INTO public.review_comments (id, created, updated, review_id, user_id, content, comment_type, type) VALUES ('a5015c5e-7a13-49dd-a2da-5d10aa765d9b', '2020-08-16 23:19:58.157+02', '2020-08-16 23:19:58.157+02', '4d506030-cbb8-4368-be90-58c973c5abaa', NULL, '<p>This is a very important paper. Gale Davis</p>', 'confidential', 'ReviewComment');
INSERT INTO public.review_comments (id, created, updated, review_id, user_id, content, comment_type, type) VALUES ('aaacdb10-de74-493e-9b8c-b4f0a3a96b3d', '2020-08-16 23:20:02.302+02', '2020-08-16 23:20:02.302+02', '4ea2e924-c1db-42b7-9bc1-4bbb8fc7693e', NULL, '<p>Great paper, congratulations! Sherry Crofoot</p>', 'review', 'ReviewComment');
INSERT INTO public.review_comments (id, created, updated, review_id, user_id, content, comment_type, type) VALUES ('e01ae54a-c4a1-4e05-ab81-60e072839c29', '2020-08-16 23:20:03.686+02', '2020-08-16 23:20:03.686+02', '4ea2e924-c1db-42b7-9bc1-4bbb8fc7693e', NULL, '<p>This is a very important paper. Sherry Crofoot</p>', 'confidential', 'ReviewComment');
INSERT INTO public.review_comments (id, created, updated, review_id, user_id, content, comment_type, type) VALUES ('64335342-b092-446a-9f49-82f5a803ca29', '2020-08-16 23:20:08.092+02', '2020-08-16 23:20:08.092+02', '9441bece-c44d-479a-8901-1b2a1878e41d', NULL, '<p>Great paper, congratulations! Elaine Barnes</p>', 'review', 'ReviewComment');
INSERT INTO public.review_comments (id, created, updated, review_id, user_id, content, comment_type, type) VALUES ('068fe9e5-f9a6-402f-95c1-51163322a529', '2020-08-16 23:20:09.639+02', '2020-08-16 23:20:09.639+02', '9441bece-c44d-479a-8901-1b2a1878e41d', NULL, '<p>This is a very important paper. Elaine Barnes</p>', 'confidential', 'ReviewComment');
INSERT INTO public.review_comments (id, created, updated, review_id, user_id, content, comment_type, type) VALUES ('7aa82dbc-0761-4165-a240-06870f5fe162', '2020-08-16 23:20:22.471+02', '2020-08-16 23:20:22.471+02', '00cf409b-e997-40a3-a834-5485ae5342ec', NULL, '<p>Great paper, dear authors, congratulations!</p>', 'decision', 'ReviewComment');


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.reviews (id, created, updated, recommendation, is_decision, user_id, manuscript_id, type) VALUES ('4d506030-cbb8-4368-be90-58c973c5abaa', '2020-08-16 23:19:55.686+02', '2020-08-16 23:19:58.165+02', 'accepted', false, '40e3d054-9ac8-4c0f-84ed-e3c6307662cd', 'feb4db67-c975-446e-9131-1b92943cf8ed', 'Review');
INSERT INTO public.reviews (id, created, updated, recommendation, is_decision, user_id, manuscript_id, type) VALUES ('4ea2e924-c1db-42b7-9bc1-4bbb8fc7693e', '2020-08-16 23:20:00.095+02', '2020-08-16 23:20:03.694+02', 'accepted', false, '0da0bbec-9261-4706-b990-0c10aa3cc6b4', 'feb4db67-c975-446e-9131-1b92943cf8ed', 'Review');
INSERT INTO public.reviews (id, created, updated, recommendation, is_decision, user_id, manuscript_id, type) VALUES ('9441bece-c44d-479a-8901-1b2a1878e41d', '2020-08-16 23:20:05.907+02', '2020-08-16 23:20:09.643+02', 'accepted', false, '85e1300e-003c-4e96-987b-23812f902477', 'feb4db67-c975-446e-9131-1b92943cf8ed', 'Review');
INSERT INTO public.reviews (id, created, updated, recommendation, is_decision, user_id, manuscript_id, type) VALUES ('473b30ec-c5fa-4005-9e96-c9a92e88009c', '2020-08-16 23:20:22.316+02', '2020-08-16 23:20:22.316+02', 'accepted', true, '1d599f2c-d293-4d5e-b6c1-ba34e81e3fc8', 'feb4db67-c975-446e-9131-1b92943cf8ed', 'Review');
INSERT INTO public.reviews (id, created, updated, recommendation, is_decision, user_id, manuscript_id, type) VALUES ('00cf409b-e997-40a3-a834-5485ae5342ec', '2020-08-16 23:20:22.463+02', '2020-08-16 23:20:22.463+02', NULL, true, '1d599f2c-d293-4d5e-b6c1-ba34e81e3fc8', 'feb4db67-c975-446e-9131-1b92943cf8ed', 'Review');


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('a55c62d5-5c7c-42e3-9953-1b7010d73021', '2020-08-16 23:19:04.336+02', '2020-08-16 23:19:04.336+02', NULL, '2b25ff83-7d5b-4385-87be-23eb6cc17f19', '027afa6a-edbc-486e-bb31-71e12f8ea1c5', NULL);
INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('85256f3e-00c4-4d8e-a4de-5c1e42fa934f', '2020-08-16 23:19:37.339+02', '2020-08-16 23:19:37.339+02', NULL, '6ebd51ae-bcda-4fc5-b829-206df41f4a8c', '1d599f2c-d293-4d5e-b6c1-ba34e81e3fc8', NULL);
INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('28e6898c-3ba7-4897-9850-5f76df197534', '2020-08-16 23:19:47.533+02', '2020-08-16 23:20:05.896+02', 'completed', 'bd154ffd-d72a-43df-bfb6-bdb4766a115b', '40e3d054-9ac8-4c0f-84ed-e3c6307662cd', NULL);
INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('cb8d3d1f-5fe3-46f5-b49b-811734ece039', '2020-08-16 23:19:48.172+02', '2020-08-16 23:20:05.896+02', 'completed', 'bd154ffd-d72a-43df-bfb6-bdb4766a115b', '0da0bbec-9261-4706-b990-0c10aa3cc6b4', NULL);
INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('3c2ffed8-88ca-4eef-94b2-318c318fb738', '2020-08-16 23:19:48.851+02', '2020-08-16 23:20:09.939+02', 'completed', 'bd154ffd-d72a-43df-bfb6-bdb4766a115b', '85e1300e-003c-4e96-987b-23812f902477', NULL);


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.teams (id, created, updated, name, role, members, owners, global, type, manuscript_id) VALUES ('2b25ff83-7d5b-4385-87be-23eb6cc17f19', '2020-08-16 23:19:04.294+02', '2020-08-16 23:19:04.294+02', 'Author', 'author', NULL, NULL, NULL, 'team', 'feb4db67-c975-446e-9131-1b92943cf8ed');
INSERT INTO public.teams (id, created, updated, name, role, members, owners, global, type, manuscript_id) VALUES ('6ebd51ae-bcda-4fc5-b829-206df41f4a8c', '2020-08-16 23:19:37.334+02', '2020-08-16 23:19:37.334+02', 'Senior Editor', 'seniorEditor', NULL, NULL, NULL, 'team', 'feb4db67-c975-446e-9131-1b92943cf8ed');
INSERT INTO public.teams (id, created, updated, name, role, members, owners, global, type, manuscript_id) VALUES ('bd154ffd-d72a-43df-bfb6-bdb4766a115b', '2020-08-16 23:19:47.53+02', '2020-08-16 23:20:05.896+02', 'Reviewers', 'reviewer', NULL, NULL, NULL, 'team', 'feb4db67-c975-446e-9131-1b92943cf8ed');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online) VALUES ('231717dd-ba09-43d4-ac98-9d5542b27a0c', '2020-07-22 14:18:36.597+02', '2020-07-24 16:43:54.939+02', NULL, NULL, '000000032536230X', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser5.jpg', false);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online) VALUES ('027afa6a-edbc-486e-bb31-71e12f8ea1c5', '2020-07-21 16:17:24.734+02', '2020-08-16 23:19:35.648+02', NULL, NULL, '0000000205642016', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser2.jpg', false);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online) VALUES ('3802b0e7-aadc-45de-9cf9-918fede99b97', '2020-07-21 16:30:45.719+02', '2020-08-16 23:19:37.463+02', true, NULL, '0000000256415729', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser6.jpg', false);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online) VALUES ('40e3d054-9ac8-4c0f-84ed-e3c6307662cd', '2020-07-21 16:36:24.973+02', '2020-08-16 23:19:59.464+02', NULL, NULL, '0000000159567341', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser4.jpg', false);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online) VALUES ('0da0bbec-9261-4706-b990-0c10aa3cc6b4', '2020-07-21 16:35:06.125+02', '2020-08-16 23:20:05.006+02', NULL, NULL, '0000000276459921', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser7.jpg', false);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online) VALUES ('85e1300e-003c-4e96-987b-23812f902477', '2020-07-21 16:35:38.381+02', '2020-08-16 23:20:12.189+02', NULL, NULL, '0000000294294446', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser1.jpg', false);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online) VALUES ('1d599f2c-d293-4d5e-b6c1-ba34e81e3fc8', '2020-07-24 15:21:54.59+02', '2020-08-16 23:20:23.732+02', NULL, NULL, '0000000318382441', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser3.jpg', true);


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
-- Name: channel_members channel_members_pkey; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.channel_members
    ADD CONSTRAINT channel_members_pkey PRIMARY KEY (id);


--
-- Name: channels channels_pkey; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_pkey PRIMARY KEY (id);


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
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: manuscripts manuscripts_pkey; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.manuscripts
    ADD CONSTRAINT manuscripts_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: review_comments review_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.review_comments
    ADD CONSTRAINT review_comments_pkey PRIMARY KEY (id);


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
-- Name: archive_archivedon_idx; Type: INDEX; Schema: pgboss; Owner: test
--

CREATE INDEX archive_archivedon_idx ON pgboss.archive USING btree (archivedon);


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
-- Name: channel_members_idx; Type: INDEX; Schema: public; Owner: test
--

CREATE INDEX channel_members_idx ON public.channel_members USING btree (user_id, channel_id);


--
-- Name: is_default_idx; Type: INDEX; Schema: public; Owner: test
--

CREATE UNIQUE INDEX is_default_idx ON public.identities USING btree (is_default, user_id) WHERE (is_default IS TRUE);


--
-- Name: team_members_team_id_user_id_idx; Type: INDEX; Schema: public; Owner: test
--

CREATE INDEX team_members_team_id_user_id_idx ON public.team_members USING btree (team_id, user_id);


--
-- Name: teams_manuscript_id_idx; Type: INDEX; Schema: public; Owner: test
--

CREATE INDEX teams_manuscript_id_idx ON public.teams USING btree (manuscript_id);


--
-- Name: channel_members channel_members_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.channel_members
    ADD CONSTRAINT channel_members_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id);


--
-- Name: channel_members channel_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.channel_members
    ADD CONSTRAINT channel_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: channels channels_manuscript_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_manuscript_id_fkey FOREIGN KEY (manuscript_id) REFERENCES public.manuscripts(id) ON DELETE CASCADE;


--
-- Name: files files_manuscript_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_manuscript_id_fkey FOREIGN KEY (manuscript_id) REFERENCES public.manuscripts(id) ON DELETE CASCADE;


--
-- Name: files files_review_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_review_comment_id_fkey FOREIGN KEY (review_comment_id) REFERENCES public.review_comments(id) ON DELETE CASCADE;


--
-- Name: manuscripts manuscripts_submitter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.manuscripts
    ADD CONSTRAINT manuscripts_submitter_id_fkey FOREIGN KEY (submitter_id) REFERENCES public.users(id);


--
-- Name: messages messages_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id) ON DELETE CASCADE;


--
-- Name: messages messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: review_comments review_comments_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.review_comments
    ADD CONSTRAINT review_comments_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;


--
-- Name: review_comments review_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.review_comments
    ADD CONSTRAINT review_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: reviews reviews_manuscript_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_manuscript_id_fkey FOREIGN KEY (manuscript_id) REFERENCES public.manuscripts(id) ON DELETE CASCADE;


--
-- Name: identities sidentities_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.identities
    ADD CONSTRAINT sidentities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_alias_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_alias_id_fkey FOREIGN KEY (alias_id) REFERENCES public.aliases(id);


--
-- Name: team_members team_members_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_members team_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teams teams_manuscript_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_manuscript_id_fkey FOREIGN KEY (manuscript_id) REFERENCES public.manuscripts(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

