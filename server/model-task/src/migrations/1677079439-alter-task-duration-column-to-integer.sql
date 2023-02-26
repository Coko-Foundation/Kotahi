ALTER TABLE "public"."tasks" DROP COLUMN "default_duration_days";
ALTER TABLE "public"."tasks" ADD COLUMN "default_duration_days" INTEGER;
