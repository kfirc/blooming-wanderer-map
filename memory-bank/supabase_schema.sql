

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."calculate_flower_intensity"("p_flower_id" "uuid", "p_location_id" "uuid") RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  report_count INTEGER;
  facebook_likes INTEGER;
  website_likes INTEGER;
  website_dislikes INTEGER;
  total_intensity NUMERIC;
BEGIN
  -- Count reports for this flower at this location
  SELECT COUNT(*) INTO report_count
  FROM public.bloom_reports br
  WHERE br.location_id = p_location_id
  AND p_flower_id::TEXT = ANY(br.flower_types);
  
  -- Sum Facebook likes from reports
  SELECT COALESCE(SUM(br.likes_count), 0) INTO facebook_likes
  FROM public.bloom_reports br
  WHERE br.location_id = p_location_id
  AND p_flower_id::TEXT = ANY(br.flower_types);
  
  -- Count website likes for this flower at this location
  SELECT COUNT(*) INTO website_likes
  FROM public.flower_location_reactions flr
  WHERE flr.flower_id = p_flower_id 
  AND flr.location_id = p_location_id 
  AND flr.reaction_type = 'like';
  
  -- Count website dislikes
  SELECT COUNT(*) INTO website_dislikes
  FROM public.flower_location_reactions flr
  WHERE flr.flower_id = p_flower_id 
  AND flr.location_id = p_location_id 
  AND flr.reaction_type = 'dislike';
  
  -- Calculate weighted intensity (reports count more, then facebook likes, then website reactions)
  total_intensity := 
    (report_count * 0.5) + 
    (facebook_likes * 0.3) + 
    (website_likes * 0.2) - 
    (website_dislikes * 0.1);
    
  -- Normalize to 0-1 scale (cap at reasonable maximum)
  total_intensity := LEAST(total_intensity / 10.0, 1.0);
  total_intensity := GREATEST(total_intensity, 0.0);
  
  RETURN total_intensity;
END;
$$;


ALTER FUNCTION "public"."calculate_flower_intensity"("p_flower_id" "uuid", "p_location_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_flower_intensity_on_reaction"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Update the flowers_per_location intensity
  UPDATE public.flowers_per_location
  SET intensity = calculate_flower_intensity(
    COALESCE(NEW.flower_id, OLD.flower_id), 
    COALESCE(NEW.location_id, OLD.location_id)
  ),
  updated_at = now()
  WHERE flower_id = COALESCE(NEW.flower_id, OLD.flower_id)
  AND location_id = COALESCE(NEW.location_id, OLD.location_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_flower_intensity_on_reaction"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_location_intensity"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  flower_record RECORD;
  avg_intensity NUMERIC := 0.0;
  flower_count INTEGER := 0;
BEGIN
  -- Calculate average intensity across all flowers at this location
  FOR flower_record IN 
    SELECT DISTINCT fpl.flower_id 
    FROM public.flowers_per_location fpl 
    WHERE fpl.location_id = COALESCE(NEW.location_id, OLD.location_id)
  LOOP
    avg_intensity := avg_intensity + calculate_flower_intensity(flower_record.flower_id, COALESCE(NEW.location_id, OLD.location_id));
    flower_count := flower_count + 1;
  END LOOP;
  
  IF flower_count > 0 THEN
    avg_intensity := avg_intensity / flower_count;
  END IF;
  
  -- Update location intensity
  UPDATE public.locations 
  SET intensity = avg_intensity,
      updated_at = now()
  WHERE id = COALESCE(NEW.location_id, OLD.location_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_location_intensity"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."bloom_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "location_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "facebook_post_url" "text" NOT NULL,
    "facebook_post_id" "text",
    "title" "text" NOT NULL,
    "description" "text",
    "images" "text"[] DEFAULT '{}'::"text"[],
    "flower_types" "text"[] DEFAULT '{}'::"text"[],
    "likes_count" integer DEFAULT 0,
    "post_date" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."bloom_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."flower_location_reactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "flower_id" "uuid" NOT NULL,
    "location_id" "uuid" NOT NULL,
    "user_ip" "text" NOT NULL,
    "reaction_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "flower_location_reactions_reaction_type_check" CHECK (("reaction_type" = ANY (ARRAY['like'::"text", 'dislike'::"text"])))
);


ALTER TABLE "public"."flower_location_reactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."flowers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "icon_url" "text",
    "description" "text",
    "bloom_season" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "bloom_start_month" integer,
    "bloom_end_month" integer,
    "bloom_start_day" integer,
    "bloom_end_day" integer,
    CONSTRAINT "flowers_bloom_end_day_check" CHECK ((("bloom_end_day" >= 1) AND ("bloom_end_day" <= 31))),
    CONSTRAINT "flowers_bloom_end_month_check" CHECK ((("bloom_end_month" >= 1) AND ("bloom_end_month" <= 12))),
    CONSTRAINT "flowers_bloom_start_day_check" CHECK ((("bloom_start_day" >= 1) AND ("bloom_start_day" <= 31))),
    CONSTRAINT "flowers_bloom_start_month_check" CHECK ((("bloom_start_month" >= 1) AND ("bloom_start_month" <= 12)))
);


ALTER TABLE "public"."flowers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."flowers_per_location" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "location_id" "uuid" NOT NULL,
    "flower_id" "uuid" NOT NULL,
    "intensity" numeric(3,2) DEFAULT 0.0 NOT NULL,
    "last_updated" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "flowers_per_location_intensity_check" CHECK ((("intensity" >= 0.0) AND ("intensity" <= 1.0)))
);


ALTER TABLE "public"."flowers_per_location" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "latitude" numeric(10,8) NOT NULL,
    "longitude" numeric(11,8) NOT NULL,
    "intensity" numeric(3,2) DEFAULT 0.0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "locations_intensity_check" CHECK ((("intensity" >= 0.0) AND ("intensity" <= 1.0)))
);


ALTER TABLE "public"."locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "facebook_id" "text" NOT NULL,
    "facebook_username" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "profile_photo_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."bloom_reports"
    ADD CONSTRAINT "bloom_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."flower_location_reactions"
    ADD CONSTRAINT "flower_location_reactions_flower_id_location_id_user_ip_key" UNIQUE ("flower_id", "location_id", "user_ip");



ALTER TABLE ONLY "public"."flower_location_reactions"
    ADD CONSTRAINT "flower_location_reactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."flowers"
    ADD CONSTRAINT "flowers_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."flowers_per_location"
    ADD CONSTRAINT "flowers_per_location_location_id_flower_id_key" UNIQUE ("location_id", "flower_id");



ALTER TABLE ONLY "public"."flowers_per_location"
    ADD CONSTRAINT "flowers_per_location_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."flowers"
    ADD CONSTRAINT "flowers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_facebook_id_key" UNIQUE ("facebook_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_bloom_reports_location_id" ON "public"."bloom_reports" USING "btree" ("location_id");



CREATE INDEX "idx_bloom_reports_post_date" ON "public"."bloom_reports" USING "btree" ("post_date" DESC);



CREATE INDEX "idx_bloom_reports_user_id" ON "public"."bloom_reports" USING "btree" ("user_id");



CREATE INDEX "idx_flowers_name" ON "public"."flowers" USING "btree" ("name");



CREATE INDEX "idx_flowers_per_location_flower_id" ON "public"."flowers_per_location" USING "btree" ("flower_id");



CREATE INDEX "idx_flowers_per_location_location_id" ON "public"."flowers_per_location" USING "btree" ("location_id");



CREATE INDEX "idx_locations_coordinates" ON "public"."locations" USING "btree" ("latitude", "longitude");



CREATE INDEX "idx_users_facebook_id" ON "public"."users" USING "btree" ("facebook_id");



CREATE OR REPLACE TRIGGER "trigger_update_flower_intensity_on_reaction" AFTER INSERT OR DELETE OR UPDATE ON "public"."flower_location_reactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_flower_intensity_on_reaction"();



CREATE OR REPLACE TRIGGER "trigger_update_location_intensity" AFTER INSERT OR DELETE OR UPDATE ON "public"."bloom_reports" FOR EACH ROW EXECUTE FUNCTION "public"."update_location_intensity"();



CREATE OR REPLACE TRIGGER "trigger_update_location_intensity_from_flowers" AFTER INSERT OR DELETE OR UPDATE ON "public"."flowers_per_location" FOR EACH ROW EXECUTE FUNCTION "public"."update_location_intensity"();



ALTER TABLE ONLY "public"."bloom_reports"
    ADD CONSTRAINT "bloom_reports_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id");



ALTER TABLE ONLY "public"."bloom_reports"
    ADD CONSTRAINT "bloom_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."flower_location_reactions"
    ADD CONSTRAINT "flower_location_reactions_flower_id_fkey" FOREIGN KEY ("flower_id") REFERENCES "public"."flowers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."flower_location_reactions"
    ADD CONSTRAINT "flower_location_reactions_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."flowers_per_location"
    ADD CONSTRAINT "flowers_per_location_flower_id_fkey" FOREIGN KEY ("flower_id") REFERENCES "public"."flowers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."flowers_per_location"
    ADD CONSTRAINT "flowers_per_location_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can add flower reactions" ON "public"."flower_location_reactions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can view bloom reports" ON "public"."bloom_reports" FOR SELECT USING (true);



CREATE POLICY "Anyone can view flower reactions" ON "public"."flower_location_reactions" FOR SELECT USING (true);



CREATE POLICY "Anyone can view flowers" ON "public"."flowers" FOR SELECT USING (true);



CREATE POLICY "Anyone can view flowers per location" ON "public"."flowers_per_location" FOR SELECT USING (true);



CREATE POLICY "Anyone can view locations" ON "public"."locations" FOR SELECT USING (true);



CREATE POLICY "Anyone can view users" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can create reports" ON "public"."bloom_reports" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can manage flowers" ON "public"."flowers" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can manage flowers per location" ON "public"."flowers_per_location" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can manage locations" ON "public"."locations" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can manage their own profile" ON "public"."users" USING (((("auth"."uid"())::"text" = "facebook_id") OR ("auth"."role"() = 'authenticated'::"text")));



CREATE POLICY "Users can update their own reactions" ON "public"."flower_location_reactions" FOR UPDATE USING (true);



CREATE POLICY "Users can update their own reports" ON "public"."bloom_reports" FOR UPDATE USING (("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."facebook_id" = ("auth"."uid"())::"text"))));



ALTER TABLE "public"."bloom_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."flower_location_reactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."flowers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."flowers_per_location" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."locations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_flower_intensity"("p_flower_id" "uuid", "p_location_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_flower_intensity"("p_flower_id" "uuid", "p_location_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_flower_intensity"("p_flower_id" "uuid", "p_location_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_flower_intensity_on_reaction"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_flower_intensity_on_reaction"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_flower_intensity_on_reaction"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_location_intensity"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_location_intensity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_location_intensity"() TO "service_role";



GRANT ALL ON TABLE "public"."bloom_reports" TO "anon";
GRANT ALL ON TABLE "public"."bloom_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."bloom_reports" TO "service_role";



GRANT ALL ON TABLE "public"."flower_location_reactions" TO "anon";
GRANT ALL ON TABLE "public"."flower_location_reactions" TO "authenticated";
GRANT ALL ON TABLE "public"."flower_location_reactions" TO "service_role";



GRANT ALL ON TABLE "public"."flowers" TO "anon";
GRANT ALL ON TABLE "public"."flowers" TO "authenticated";
GRANT ALL ON TABLE "public"."flowers" TO "service_role";



GRANT ALL ON TABLE "public"."flowers_per_location" TO "anon";
GRANT ALL ON TABLE "public"."flowers_per_location" TO "authenticated";
GRANT ALL ON TABLE "public"."flowers_per_location" TO "service_role";



GRANT ALL ON TABLE "public"."locations" TO "anon";
GRANT ALL ON TABLE "public"."locations" TO "authenticated";
GRANT ALL ON TABLE "public"."locations" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






RESET ALL;
