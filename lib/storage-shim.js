// Provides window.storage.{get,set,remove} backed by the real mkis_kv table
// in Supabase (see supabase-setup.sql), so every device reads and writes the
// SAME shared records instead of each device's own separate local storage.
import { supabase } from "../integrations/supabase/client";

export function installStorageShim() {
  if (typeof window === "undefined") return;
  if (window.storage && window.storage.__mkisSupabase) return;
  window.storage = {
    __mkisSupabase: true,
    async get(key) {
      try {
        const { data, error } = await supabase
          .from("mkis_kv")
          .select("value")
          .eq("key", key)
          .maybeSingle();
        if (error) return null;
        return data ? { value: data.value } : null;
      } catch {
        return null;
      }
    },
    // Deliberately no try/catch swallowing the error here -- if the
    // Supabase write fails (network error, RLS issue, anything), that
    // failure MUST propagate as a rejected promise. saveShared()/
    // queueKeySave() in MKIS.jsx rely on that to know a write didn't
    // actually land, so they can retry it instead of wrongly marking it
    // saved. Swallowing the error here was exactly the bug that caused
    // entered results to silently vanish on St. Kizito's system -- the
    // app believed every save succeeded even when it hadn't.
    async set(key, value) {
      const { data, error } = await supabase
        .from("mkis_kv")
        .upsert({ key, value: String(value) }, { onConflict: "key" })
        .select()
        .maybeSingle();
      if (error) throw error;
      return data || true;
    },
    async remove(key) {
      const { error } = await supabase.from("mkis_kv").delete().eq("key", key);
      if (error) throw error;
      return true;
    },
  };
}
