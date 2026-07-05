// usePartner hook — fetch partner connection status and partner view data.
import { useCallback, useState } from "react";
import { api } from "../lib/api";
import type { ApiResponse } from "../types";

export interface PartnerConnection {
  status: "none" | "pending" | "active";
  inviteCode?: string;
  partnerName?: string | null;
  shareLevel?: "phase_only" | "full_summary";
  shareMood?: boolean;
  shareSymptoms?: boolean;
  sharePregnancy?: boolean;
}

export interface PartnerView {
  ownerFirstName: string;
  currentPhase: string;
  dayOfCycle: number;
  daysIntoPeriod: number | null;
  daysUntilPeriod: number;
  avgLength: number;
  nextEvents: Array<{ name: string; daysUntil: number }>;
  moodSummary: string | null;
  empathyTip: string;
  shareLevel: string;
  shareMood: boolean;
  acceptedAt: string | null;
  prediction?: {
    nextPeriod: string;
    fertileStart: string;
    fertileEnd: string;
    ovulationDay: string;
    avgLength: number;
  } | null;
}

export function usePartner() {
  const [connection, setConnection] = useState<PartnerConnection | null>(null);
  const [partnerView, setPartnerView] = useState<PartnerView | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchConnection = useCallback(async () => {
    const res = await api.get<ApiResponse<PartnerConnection | { status: "none" }>>(
      "/partner/my-connection"
    );
    if (res.data.success) {
      setConnection(res.data.data as PartnerConnection);
    }
  }, []);

  const fetchPartnerView = useCallback(async (): Promise<PartnerView | null> => {
    try {
      const res = await api.get<ApiResponse<PartnerView>>("/partner/view");
      if (res.data.success) {
        const data = res.data.data;
        setPartnerView(data);
        return data;
      }
    } catch {
      // not connected or error
    }
    return null;
  }, []);

  const createInvite = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.post<ApiResponse<PartnerConnection>>("/partner/invite");
      if (res.data.success) {
        setConnection(res.data.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptInvite = useCallback(async (inviteCode: string) => {
    setLoading(true);
    try {
      const res = await api.post<ApiResponse<{ ownerName: string; status: string }>>(
        "/partner/accept",
        { inviteCode: inviteCode.toUpperCase() }
      );
      return res.data;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(
    async (settings: { shareLevel?: string; shareMood?: boolean; shareSymptoms?: boolean; sharePregnancy?: boolean }) => {
      const res = await api.patch<ApiResponse<PartnerConnection>>(
        "/partner/settings",
        settings
      );
      if (res.data.success) {
        setConnection(res.data.data);
      }
    },
    []
  );

  const revoke = useCallback(async () => {
    await api.delete("/partner/revoke");
    setConnection(null);
    setPartnerView(null);
    // Re-fetch to confirm backend state
    await fetchConnection();
  }, [fetchConnection]);

  return {
    connection,
    partnerView,
    loading,
    fetchConnection,
    fetchPartnerView,
    createInvite,
    acceptInvite,
    updateSettings,
    revoke,
  };
}
