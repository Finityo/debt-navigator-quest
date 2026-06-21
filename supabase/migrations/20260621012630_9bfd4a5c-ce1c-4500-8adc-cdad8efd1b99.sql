
-- 1. Pin search_path on SECURITY DEFINER functions that don't have it
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;

-- 2. Revoke EXECUTE on backend-only SECURITY DEFINER functions from anon/authenticated/public
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- delete_user_account must remain callable by signed-in users (they delete their own account)
REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

-- 3. Storage policies for email-assets bucket
--   Public SELECT (bucket is intentionally public for email images)
--   INSERT/UPDATE/DELETE locked to service_role only
DROP POLICY IF EXISTS "Public read email-assets" ON storage.objects;
DROP POLICY IF EXISTS "Service role insert email-assets" ON storage.objects;
DROP POLICY IF EXISTS "Service role update email-assets" ON storage.objects;
DROP POLICY IF EXISTS "Service role delete email-assets" ON storage.objects;

CREATE POLICY "Public read email-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'email-assets');

CREATE POLICY "Service role insert email-assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'email-assets' AND auth.role() = 'service_role');

CREATE POLICY "Service role update email-assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'email-assets' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'email-assets' AND auth.role() = 'service_role');

CREATE POLICY "Service role delete email-assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'email-assets' AND auth.role() = 'service_role');
