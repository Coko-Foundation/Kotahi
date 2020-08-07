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
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

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
-- Data for Name: aliases; Type: TABLE DATA; Schema: public; Owner: test
--



--
-- Data for Name: channel_members; Type: TABLE DATA; Schema: public; Owner: test
--



--
-- Data for Name: channels; Type: TABLE DATA; Schema: public; Owner: test
--



--
-- Data for Name: entities; Type: TABLE DATA; Schema: public; Owner: test
--



--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: test
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: public; Owner: test
--



--
-- Data for Name: manuscripts; Type: TABLE DATA; Schema: public; Owner: test
--



--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: test
--



--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: test
--

INSERT INTO public.migrations (id, run_at) VALUES ('1524494862-entities.sql', '2020-08-08 01:24:21.497041+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1542276313-initial-user-migration.sql', '2020-08-08 01:24:21.508257+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1560771823-add-unique-constraints-to-users.sql', '2020-08-08 01:24:21.516779+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1580908536-add-identities.sql', '2020-08-08 01:24:21.53186+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1581371297-migrate-users-to-identities.js', '2020-08-08 01:24:21.553008+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1581450834-manuscript.sql', '2020-08-08 01:24:21.562353+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1582930582-drop-fragments-and-collections.js', '2020-08-08 01:24:21.571131+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1585323910-add-channels.sql', '2020-08-08 01:24:21.584346+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1585344885-add-messages.sql', '2020-08-08 01:24:21.594971+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1585513226-add-profile-pic.sql', '2020-08-08 01:24:21.600277+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1592915682-change-identities-constraint.sql', '2020-08-08 01:24:21.608405+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1596830547-review.sql', '2020-08-08 01:24:21.617437+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1596830548-add-review-comments.sql', '2020-08-08 01:24:21.627281+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1596830548-initial-team-migration.sql', '2020-08-08 01:25:13.230055+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1596838897-files.sql', '2020-08-08 01:25:13.243773+02');


--
-- Data for Name: review_comments; Type: TABLE DATA; Schema: public; Owner: test
--



--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: test
--



--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: test
--



--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: test
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: test
--



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

INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online) VALUES ('85e1300e-003c-4e96-987b-23812f902477', '2020-07-21 16:35:38.381+02', '2020-07-24 16:43:03.114+02', NULL, NULL, '0000000294294446', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser1.jpg', false);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online) VALUES ('027afa6a-edbc-486e-bb31-71e12f8ea1c5', '2020-07-21 16:17:24.734+02', '2020-07-24 16:43:15.46+02', NULL, NULL, '0000000205642016', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser2.jpg', false);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online) VALUES ('1d599f2c-d293-4d5e-b6c1-ba34e81e3fc8', '2020-07-24 15:21:54.59+02', '2020-07-24 16:43:26.378+02', NULL, NULL, '0000000318382441', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser3.jpg', false);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online) VALUES ('40e3d054-9ac8-4c0f-84ed-e3c6307662cd', '2020-07-21 16:36:24.973+02', '2020-07-24 16:43:43.943+02', NULL, NULL, '0000000159567341', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser4.jpg', true);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online) VALUES ('231717dd-ba09-43d4-ac98-9d5542b27a0c', '2020-07-22 14:18:36.597+02', '2020-07-24 16:43:54.939+02', NULL, NULL, '000000032536230X', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser5.jpg', false);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online) VALUES ('3802b0e7-aadc-45de-9cf9-918fede99b97', '2020-07-21 16:30:45.719+02', '2020-07-24 16:49:06.488+02', true, NULL, '0000000256415729', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser6.jpg', true);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online) VALUES ('0da0bbec-9261-4706-b990-0c10aa3cc6b4', '2020-07-21 16:35:06.125+02', '2020-07-24 16:44:59.306+02', NULL, NULL, '0000000276459921', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser7.jpg', true);


INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('d341a633-cdce-4a7f-a9ad-5afc03cd0dd1', '027afa6a-edbc-486e-bb31-71e12f8ea1c5', '2020-07-21 16:17:24.741+02', '2020-07-21 16:17:25.87+02', 'orcid', '0000-0002-0564-2016', 'Emily Clay', NULL, '{"accessToken": "079a1165-31e5-4b59-9a99-d80ff7a21ebf", "refreshToken": "ccadc737-defc-419e-823b-a9f3673848ba"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('bcda196e-765a-42c8-94da-ca2e43b80f96', '3802b0e7-aadc-45de-9cf9-918fede99b97', '2020-07-21 16:30:45.721+02', '2020-07-21 16:33:26.742+02', 'orcid', '0000-0002-5641-5729', 'Sinead Sullivan', NULL, '{"accessToken": "ef1ed3ec-8371-41b2-a136-fd196ae52a72", "refreshToken": "6972dace-d9a6-4cd3-a2ad-ec7eb3e457c7"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('4af83984-6359-47c5-a075-5ddfa9c555d9', '0da0bbec-9261-4706-b990-0c10aa3cc6b4', '2020-07-21 16:35:06.127+02', '2020-07-21 16:35:07.104+02', 'orcid', '0000-0002-7645-9921', 'Sherry Crofoot', NULL, '{"accessToken": "2ad4e130-0775-4e13-87fb-8e8f5a0570ae", "refreshToken": "159933d9-2020-4c02-bdfb-163af41017dc"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('acfa1777-0aec-4fe1-bc16-92bb9d19e884', '85e1300e-003c-4e96-987b-23812f902477', '2020-07-21 16:35:38.384+02', '2020-07-21 16:35:39.358+02', 'orcid', '0000-0002-9429-4446', 'Elaine Barnes', NULL, '{"accessToken": "dcf07bc7-e59c-41b3-9ce0-924ac20aeeea", "refreshToken": "ae49d6a1-8e62-419d-8767-4a3ec22c1950"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('88c85115-d83c-42d7-a1a1-0139827977da', '40e3d054-9ac8-4c0f-84ed-e3c6307662cd', '2020-07-21 16:36:24.975+02', '2020-07-21 16:36:26.059+02', 'orcid', '0000-0001-5956-7341', 'Gale Davis', NULL, '{"accessToken": "3e9f6f6c-7cc0-4afa-9fdf-6ed377c36aad", "refreshToken": "80b1e911-df97-43f1-9f11-17b61913f6d7"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('049f91da-c84e-4b80-be2e-6e0cfca7a136', '231717dd-ba09-43d4-ac98-9d5542b27a0c', '2020-07-22 14:18:36.611+02', '2020-07-22 14:18:37.745+02', 'orcid', '0000-0003-2536-230X', 'Test Account', NULL, '{"accessToken": "eb551178-79e5-4189-8c5f-0a553092a9b5", "refreshToken": "4506fa5f-bd77-4867-afb4-0b07ea5302d6"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('2fb8359c-239c-43fa-91f5-1ff2058272a6', '1d599f2c-d293-4d5e-b6c1-ba34e81e3fc8', '2020-07-24 15:21:54.604+02', '2020-07-24 15:21:55.7+02', 'orcid', '0000-0003-1838-2441', 'Joanne Pilger', NULL, '{"accessToken": "842de329-ef16-4461-b83b-e8fe57238904", "refreshToken": "524fbdc5-9c67-4b4c-af17-2ce4cf294e88"}', true);

