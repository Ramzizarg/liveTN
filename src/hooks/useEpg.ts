import { useCallback, useEffect, useState } from "react";
import { TUNISIA_STREAM_IDS } from "@/data/channels";
import { fetchEpg, getNowAndNext, type EpgByChannel, type Programme } from "@/lib/epg";

export type EpgProgrammeInfo = { now?: Programme; next?: Programme };

export function useEpg(portal: string, username: string, password: string) {
  const [epg, setEpg] = useState<EpgByChannel | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const base = portal?.replace(/\/+$/, "").trim();
    if (!base || !username?.trim() || !password?.trim()) {
      setEpg(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchEpg(portal, username, password)
      .then((data) => {
        if (!cancelled) {
          setEpg(data);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [portal, username, password]);

  const getProgrammeForChannel = useCallback(
    (channelId: string): EpgProgrammeInfo => {
      if (!epg) return {};
      const streamId = TUNISIA_STREAM_IDS[channelId];
      const programmes = streamId ? epg[streamId] : undefined;
      if (!programmes) return {};
      return getNowAndNext(programmes, Date.now());
    },
    [epg]
  );

  return { epg, loading, getProgrammeForChannel };
}
