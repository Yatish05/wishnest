-- =====================================================================
-- WishNest Defense-in-Depth Row Level Security (RLS) Policies
-- =====================================================================
-- Note: All WishNest API handlers run server-side using SUPABASE_SERVICE_ROLE_KEY
-- which automatically bypasses RLS. These policies provide defense-in-depth in
-- case an anon/public key is ever accidentally exposed or misused.
-- =====================================================================

-- 1. ENABLE RLS ON ALL TABLES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- 2. USERS TABLE POLICIES
-- Users can view and update only their own profile row
CREATE POLICY users_select_own ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY users_update_own ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- 3. WISHLISTS TABLE POLICIES
-- Users can view their own wishlists OR any public wishlist
CREATE POLICY wishlists_select_accessible ON public.wishlists
  FOR SELECT
  USING (
    user_id = auth.uid() 
    OR is_public = true 
    OR visibility = 'public'
  );

-- Users can insert, update, or delete only their own wishlists
CREATE POLICY wishlists_insert_own ON public.wishlists
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY wishlists_update_own ON public.wishlists
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY wishlists_delete_own ON public.wishlists
  FOR DELETE
  USING (user_id = auth.uid());

-- 4. ITEMS TABLE POLICIES
-- Anyone can view items belonging to accessible wishlists
CREATE POLICY items_select_accessible ON public.items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.wishlists w
      WHERE w.id = items.wishlist_id
      AND (w.user_id = auth.uid() OR w.is_public = true OR w.visibility = 'public')
    )
  );

-- Only wishlist owners can add/modify/delete items
CREATE POLICY items_insert_owner ON public.items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.wishlists w
      WHERE w.id = items.wishlist_id
      AND w.user_id = auth.uid()
    )
  );

CREATE POLICY items_update_owner ON public.items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.wishlists w
      WHERE w.id = items.wishlist_id
      AND w.user_id = auth.uid()
    )
  );

CREATE POLICY items_delete_owner ON public.items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.wishlists w
      WHERE w.id = items.wishlist_id
      AND w.user_id = auth.uid()
    )
  );
