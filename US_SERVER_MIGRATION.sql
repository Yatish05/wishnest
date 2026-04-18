-- ==========================================
-- US SUPABASE SERVER MIGRATION SCRIPT
-- ==========================================
-- Target: US East (N. Virginia) project
-- Description: Re-creates the core schema (public) to fix "missing table" errors.
-- ==========================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

-- 2. Create "public" Schema Tables
-- ==========================================

-- USERS
CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "password" "text",
    "role" "text" DEFAULT 'user'::"text",
    "preferences" "jsonb" DEFAULT '{"theme": "light", "defaultVisibility": "public", "notificationsEnabled": true}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_email_key" UNIQUE ("email"),
    CONSTRAINT "users_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'guest'::"text"])))
);

-- WISHLISTS
CREATE TABLE IF NOT EXISTS "public"."wishlists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "occasion" "text" DEFAULT 'Other'::"text",
    "visibility" "text" DEFAULT 'public'::"text",
    "gender" "text" DEFAULT 'unisex'::"text",
    "is_public" boolean DEFAULT true,
    "user_id" "uuid",
    "shared_with" "text"[] DEFAULT ARRAY[]::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "wishlists_gender_check" CHECK (("gender" = ANY (ARRAY['male'::"text", 'female'::"text", 'unisex'::"text"]))),
    CONSTRAINT "wishlists_visibility_check" CHECK (("visibility" = ANY (ARRAY['public'::"text", 'private'::"text"])))
);

-- ITEMS
CREATE TABLE IF NOT EXISTS "public"."items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "wishlist_id" "uuid",
    "name" "text" NOT NULL,
    "link" "text",
    "img" "text",
    "notes" "text",
    "is_purchased" boolean DEFAULT false,
    "purchased_at" timestamp with time zone,
    "purchased_by" "uuid",
    "hidden_from_owner" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "message" "text" NOT NULL,
    "type" "text" DEFAULT 'info'::"text",
    "read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- 3. Add Foreign Keys
-- ==========================================

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wishlists_user_id_fkey') THEN
        ALTER TABLE "public"."wishlists" ADD CONSTRAINT "wishlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'items_wishlist_id_fkey') THEN
        ALTER TABLE "public"."items" ADD CONSTRAINT "items_wishlist_id_fkey" FOREIGN KEY ("wishlist_id") REFERENCES "public"."wishlists"("id") ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'items_purchased_by_fkey') THEN
        ALTER TABLE "public"."items" ADD CONSTRAINT "items_purchased_by_fkey" FOREIGN KEY ("purchased_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_user_id_fkey') THEN
        ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
    END IF;
END $$;
