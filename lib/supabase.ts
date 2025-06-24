import { createBrowserClient } from '@supabase/ssr';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const browserClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const componentClient = createClientComponentClient();

export const supabaseBrowser = browserClient;
export const supabase = componentClient;
