DO $$
DECLARE
  g_id UUID;
  admin_team_id UUID;
  gm_team_id UUID;
  user_team_id UUID;
BEGIN
SELECT id INTO g_id FROM groups LIMIT 1;
SELECT id INTO admin_team_id FROM teams
  WHERE global IS TRUE AND role='admin' LIMIT 1;
SELECT id INTO gm_team_id FROM teams
  WHERE object_id=g_id AND role='groupManager' LIMIT 1;
SELECT id INTO user_team_id FROM teams
  WHERE object_id=g_id AND role='user' LIMIT 1;


UPDATE configs SET form_data = '{"user": {"isAdmin": false, "kotahiApiTokens": "test:123456"}, "report": {"showInMenu": true}, "review": {"showSummary": false}, "dashboard": {"showSections": ["submission", "review", "editor"], "loginRedirectUrl": "/dashboard"}, "manuscript": {"tableColumns": "shortId, titleAndAbstract, created, updated, status, submission.$customStatus, author", "paginationCount": 10}, "publishing": {"webhook": {"ref": "test", "url": "https://someserver/webhook-address", "token": "test"}, "crossref": {"login": "test", "password": "test", "doiPrefix": "10.12345/", "licenseUrl": "test", "registrant": "test", "useSandbox": true, "journalName": "test", "depositorName": "test", "depositorEmail": "test@coko.foundation", "journalHomepage": "test", "publicationType": "article", "journalAbbreviatedName": "test", "publishedArticleLocationPrefix": "test"}, "hypothesis": {"group": null, "apiKey": null, "reverseFieldOrder": false, "shouldAllowTagging": false}}, "taskManager": {"teamTimezone": "Etc/UTC"}, "controlPanel": {"showTabs": ["Team", "Decision", "Manuscript text", "Metadata", "Tasks & Notifications"], "hideReview": true, "sharedReview": true, "displayManuscriptShortId": true}, "instanceName": "journal", "notification": {"gmailAuthEmail": null, "gmailSenderEmail": null, "gmailAuthPassword": null}, "groupIdentity": {"logoPath": "/assets/logo-kotahi.png", "brandName": "Kotahi", "primaryColor": "#3AAE2A", "secondaryColor": "#9e9e9e"}}'
WHERE group_id = g_id;

INSERT INTO users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online, last_online, recent_tab, menu_pinned, chat_expanded) VALUES
('85e1300e-003c-4e96-987b-23812f902477', '2020-07-21 16:35:38.381+02', '2020-07-24 16:43:03.114+02', NULL, NULL, 'Elaine Barnes', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser1.jpg', false, NULL, 'submissions', FALSE, FALSE),
('ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', '2020-07-21 16:17:24.734+02', '2020-07-24 16:43:15.46+02', NULL, NULL, 'Emily Clay', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser2.jpg', false, NULL, 'submissions', FALSE, FALSE),
('5b861dfb-02df-4be1-bc67-41a21611f5e7', '2020-07-24 15:21:54.59+02', '2020-07-24 16:43:26.378+02', NULL, NULL, 'Joane Pilger', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser3.jpg', false, NULL, 'submissions', FALSE, FALSE),
('7f2fb549-51c0-49d5-844d-8a2fbbbbc0ad', '2020-07-21 16:36:24.973+02', '2020-07-24 16:43:43.943+02', NULL, 'galekotahitestemailaccount@test.com', 'Gale Davis', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser4.jpg', true, NULL, 'submissions', FALSE, FALSE),
('231717dd-ba09-43d4-ac98-9d5542b27a0c', '2020-07-22 14:18:36.597+02', '2020-07-24 16:43:54.939+02', true, NULL, 'Test Account', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser5.jpg', false, NULL, 'submissions', FALSE, FALSE),
('41d52254-a2b8-4ea4-9ded-bfbfe9671578', '2020-07-21 16:35:06.125+02', '2020-07-24 16:44:59.306+02', NULL, 'sherrykotahitestemailaccount@test.com', 'Sherry Crofoot', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser7.jpg', true, NULL, 'submissions', FALSE, FALSE),
('f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', '2020-07-21 16:30:45.719+02', '2021-03-10 12:41:10.044+01', true, 'sineadkotahitestemailaccount@test.com', 'Sinead Sullivan', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser6.jpg', false, NULL, 'submissions', FALSE, FALSE);

INSERT INTO identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES
(gen_random_uuid(), 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', '2020-07-21 16:17:24.741+02', '2020-07-21 16:17:25.87+02', 'orcid', '0000-0002-0564-2016', 'Emily Clay', NULL, '{"accessToken": "079a1165-31e5-4b59-9a99-d80ff7a21ebf", "refreshToken": "ccadc737-defc-419e-823b-a9f3673848ba"}', true),
(gen_random_uuid(), 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', '2020-07-21 16:30:45.721+02', '2020-07-21 16:33:26.742+02', 'orcid', '0000-0002-5641-5729', 'Sinead Sullivan', NULL, '{"accessToken": "ef1ed3ec-8371-41b2-a136-fd196ae52a72", "refreshToken": "6972dace-d9a6-4cd3-a2ad-ec7eb3e457c7"}', true),
(gen_random_uuid(), '41d52254-a2b8-4ea4-9ded-bfbfe9671578', '2020-07-21 16:35:06.127+02', '2020-07-21 16:35:07.104+02', 'orcid', '0000-0002-7645-9921', 'Sherry Crofoot', NULL, '{"accessToken": "2ad4e130-0775-4e13-87fb-8e8f5a0570ae", "refreshToken": "159933d9-2020-4c02-bdfb-163af41017dc"}', true),
(gen_random_uuid(), '85e1300e-003c-4e96-987b-23812f902477', '2020-07-21 16:35:38.384+02', '2020-07-21 16:35:39.358+02', 'orcid', '0000-0002-9429-4446', 'Elaine Barnes', NULL, '{"accessToken": "dcf07bc7-e59c-41b3-9ce0-924ac20aeeea", "refreshToken": "ae49d6a1-8e62-419d-8767-4a3ec22c1950"}', true),
(gen_random_uuid(), '7f2fb549-51c0-49d5-844d-8a2fbbbbc0ad', '2020-07-21 16:36:24.975+02', '2020-07-21 16:36:26.059+02', 'orcid', '0000-0001-5956-7341', 'Gale Davis', NULL, '{"accessToken": "3e9f6f6c-7cc0-4afa-9fdf-6ed377c36aad", "refreshToken": "80b1e911-df97-43f1-9f11-17b61913f6d7"}', true),
(gen_random_uuid(), '231717dd-ba09-43d4-ac98-9d5542b27a0c', '2020-07-22 14:18:36.611+02', '2020-07-22 14:18:37.745+02', 'orcid', '0000-0003-2536-230X', 'Test Account', NULL, '{"accessToken": "eb551178-79e5-4189-8c5f-0a553092a9b5", "refreshToken": "4506fa5f-bd77-4867-afb4-0b07ea5302d6"}', true),
(gen_random_uuid(), '5b861dfb-02df-4be1-bc67-41a21611f5e7', '2020-07-24 15:21:54.604+02', '2020-07-24 15:21:55.7+02', 'orcid', '0000-0003-1838-2441', 'Joane Pilger', NULL, '{"accessToken": "842de329-ef16-4461-b83b-e8fe57238904", "refreshToken": "524fbdc5-9c67-4b4c-af17-2ce4cf294e88"}', true);

INSERT INTO team_members (id, created, updated, status, team_id, user_id, alias_id, is_shared) VALUES
(gen_random_uuid(), '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', NULL, gm_team_id, '231717dd-ba09-43d4-ac98-9d5542b27a0c', NULL, NULL),
(gen_random_uuid(), '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', NULL, gm_team_id, 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', NULL, NULL);

END $$
