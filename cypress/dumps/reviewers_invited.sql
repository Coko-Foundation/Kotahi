DO $$
DECLARE
  g_id UUID;
BEGIN
SELECT object_id  INTO g_id FROM team_members JOIN teams ON teams.id  = team_members.team_id WHERE object_type = 'Group' LIMIT 1;

-- -------------------------------------------------------------
-- Senior Editor Assigned 
-- -------------------------------------------------------------
INSERT INTO "public"."files" ("id", "created", "updated", "type", "name", "stored_objects", "tags", "reference_id", "object_id", "alt", "upload_status", "caption") VALUES
('c3a9c3ee-9822-46da-97e6-e12bb8af6c1c', '2022-09-13 14:07:25.575+00', '2022-09-13 14:07:25.575+00', 'file', 'test-pdf.pdf', '[{"id": "1c28e52b-f5aa-443e-999a-41605340e37c", "key": "915c52f62e1f.pdf", "size": 187018, "type": "original", "mimetype": "application/pdf", "extension": "pdf", "imageMetadata": null}]', '["manuscript"]', NULL, '908587ed-c5f8-4532-aa56-bc94f805d336', NULL, NULL, NULL);
INSERT INTO "public"."manuscripts" ("id", "created", "updated", "parent_id", "submitter_id", "status", "decision", "authors", "meta", "submission", "published", "type", "evaluations_hypothesis_map", "is_imported", "import_source", "import_source_server", "short_id", "submitted_date", "is_hidden","form_fields_to_publish", "searchable_text", "search_tsvector", "doi", "group_id") VALUES
('908587ed-c5f8-4532-aa56-bc94f805d336', '2022-09-13 14:07:25.565+00', '2022-09-13 14:07:32.971+00', NULL, 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', 'submitted', NULL, NULL, '{"title": "test pdf"}', '{"DOI": "", "cover": "", "title": "", "topics": [], "Funding": "", "abstract": "", "datacode": "", "objectType": "", "references": "", "authorNames": "", "dateAccepted": "", "dateReceived": "", "copyrightYear": "", "datePublished": "", "DecisionLetter": "", "copyrightHolder": "", "reviewingEditor": "", "EditorsEvaluation": "", "competingInterests": "", "copyrightStatement": "", "authorContributions": "", "AuthorCorrespondence": ""}', NULL, 'Manuscript', NULL, NULL, NULL, NULL, 12, '2022-09-13 14:07:32.475+00', false, '[]', 'test pdf', '"2":9B "demo":4B,7B "kotahi":3B,6B "pdf":2A "test":1A', NULL, g_id);
INSERT INTO "public"."channels" ("id", "manuscript_id", "created", "updated", "topic", "type", "group_id") VALUES
('90c5f618-ccc4-4be2-8a79-f396ca5582c7', '908587ed-c5f8-4532-aa56-bc94f805d336', '2022-09-13 14:07:25.575+00', '2022-09-13 14:07:25.575+00', 'Manuscript discussion', 'all', g_id),
('f1bdad7f-de4c-4833-87d5-27aa2838197f', '908587ed-c5f8-4532-aa56-bc94f805d336', '2022-09-13 14:07:25.575+00', '2022-09-13 14:07:25.575+00', 'Editorial discussion', 'editorial', g_id);
INSERT INTO "public"."messages" ("id", "user_id", "channel_id", "created", "updated", "content") VALUES
('43a31e42-3da6-4078-bc69-52565db09caf', 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', 'f1bdad7f-de4c-4833-87d5-27aa2838197f', '2022-09-13 14:07:32.462+00', '2022-09-13 14:07:32.462+00', 'Submission Confirmation Email sent by Kotahi to Emily Clay');
INSERT INTO "public"."teams" ("id", "created", "updated", "name", "role", "members", "owners", "global", "type", "object_id", "object_type") VALUES
('62469169-e185-43e3-965c-3e4ecf3dcbcb', '2022-09-15 06:52:52.933+00', '2022-09-15 06:52:52.933+00', 'Author', 'author', NULL, NULL, NULL, 'team', '908587ed-c5f8-4532-aa56-bc94f805d336', 'manuscript'),
('84b65fa6-0ca9-42ee-92dc-e8c98307456b', '2022-09-15 06:53:16.324+00', '2022-09-15 06:53:16.324+00', 'Senior Editor', 'seniorEditor', NULL, NULL, NULL, 'team', '908587ed-c5f8-4532-aa56-bc94f805d336', 'manuscript');
INSERT INTO "public"."team_members" ("id", "created", "updated", "status", "team_id", "user_id", "alias_id", "is_shared") VALUES
('e150f9c6-903a-4753-9934-26c4a74be188', '2022-09-13 14:07:25.582+00', '2022-09-13 14:07:25.582+00', NULL, '62469169-e185-43e3-965c-3e4ecf3dcbcb', 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', NULL, NULL);

-- -------------------------------------------------------------
-- Reviwers Assigned
-- -------------------------------------------------------------
-- Reviewers Team is Added
INSERT INTO "public"."teams" ("id", "created", "updated", "name", "role", "members", "owners", "global", "type", "object_id", "object_type") VALUES
('4f26aac1-3f96-43d4-a41e-595b363fa524', '2022-09-13 14:46:58.148+00', '2022-09-13 14:46:58.148+00', 'Reviewers', 'reviewer', NULL, NULL, NULL, 'team', '908587ed-c5f8-4532-aa56-bc94f805d336', 'manuscript');

-- Six new reviewers are inserted in the reviewer team 
-- Quirk: Assigning reviewers updates the `team_members.id` of the Senior Editor.
INSERT INTO "public"."team_members" ("id", "created", "updated", "status", "team_id", "user_id", "alias_id", "is_shared") VALUES
('910db2fa-0975-4f9e-93e5-49a88879a42c', '2022-09-13 14:46:57.459+00', '2022-09-13 14:46:57.459+00', NULL, '84b65fa6-0ca9-42ee-92dc-e8c98307456b', '85e1300e-003c-4e96-987b-23812f902477', NULL, NULL),
('d178722c-17c6-45b8-985b-a34ab39c61f5', '2022-09-13 14:47:01.485+00', '2022-09-13 14:47:01.485+00', 'invited', '4f26aac1-3f96-43d4-a41e-595b363fa524', 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', NULL, NULL),
('dae43250-ede2-462b-8fc9-7ef1054946db', '2022-09-13 14:46:59.657+00', '2022-09-13 14:46:59.657+00', 'invited', '4f26aac1-3f96-43d4-a41e-595b363fa524', '5b861dfb-02df-4be1-bc67-41a21611f5e7', NULL, NULL),
('e1c8af8d-fe86-48fd-afba-b5279705d5a5', '2022-09-13 14:46:58.15+00' , '2022-09-13 14:46:58.15+00' , 'invited', '4f26aac1-3f96-43d4-a41e-595b363fa524', 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', NULL, NULL),
('63335151-176b-4142-80c9-1ea594d9edab', '2022-09-14 05:02:35.031+00', '2022-09-14 05:02:35.031+00', 'invited', '4f26aac1-3f96-43d4-a41e-595b363fa524', '41d52254-a2b8-4ea4-9ded-bfbfe9671578', NULL, NULL),
('9b658252-fb7d-4f06-bca1-803783d5095b', '2022-09-14 05:02:38.57+00' , '2022-09-14 05:02:38.57+00' , 'invited', '4f26aac1-3f96-43d4-a41e-595b363fa524', 'dcabc94f-eb6e-49bb-97d3-fc1a38f9408c', NULL, NULL),
('a11d610c-4f0b-4747-9682-41dfee5b1316', '2022-09-14 05:02:36.849+00', '2022-09-14 05:02:36.849+00', 'invited', '4f26aac1-3f96-43d4-a41e-595b363fa524', '7f2fb549-51c0-49d5-844d-8a2fbbbbc0ad', NULL, NULL);

END $$;
