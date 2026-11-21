CREATE TABLE public.bank_ai_service_state (
  service text PRIMARY KEY CHECK (service = 'bank-troubleshoot'),
  blocked_status integer NOT NULL CHECK (blocked_status IN (402, 403)),
  blocked_type text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.bank_ai_service_state TO service_role;
REVOKE ALL ON public.bank_ai_service_state FROM anon, authenticated;
ALTER TABLE public.bank_ai_service_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Server manages AI availability" ON public.bank_ai_service_state FOR ALL TO service_role USING (true) WITH CHECK (true);