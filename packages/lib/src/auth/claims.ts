import { createClient } from '../supabase/server';

export async function getClaims() {
	const supabase = await createClient();
	return supabase.auth.getClaims();
}