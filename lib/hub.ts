// Cliente Supabase do Hub Central WhatsApp (compartilhado com CollectPro, GIA Gestão, Track)
import { createClient } from "@supabase/supabase-js";

const HUB_URL = "https://ptmttmqprbullvgulyhb.supabase.co";
const HUB_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0bXR0bXFwcmJ1bGx2Z3VseWhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMTMyMzksImV4cCI6MjA4ODU4OTIzOX0.D_wwsIH1zNow7gTwOCVSBalWgt629ZPdKZWl4jL9SNk";

export const supabaseHub = createClient(HUB_URL, HUB_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const HUB_FN_URL = `${HUB_URL}/functions/v1`;
export const HUB_ANON = HUB_ANON_KEY;

export async function callHubEdge(path: string, body?: any) {
  const res = await fetch(`${HUB_FN_URL}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${HUB_ANON}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

// Types mínimos
export interface WhatsAppInstance {
  id: string;
  nome: string;
  tipo: "central" | "colaborador" | "meta_oficial";
  status: "connected" | "disconnected" | "qr_pending" | "banned" | "error";
  telefone: string | null;
  instance_name: string | null;
  is_default_central: boolean;
  qr_code: string | null;
  meta_config?: any;
}

export interface WhatsAppMessage {
  id: string;
  instance_id: string;
  direction: "in" | "out";
  status: string;
  telefone: string;
  tipo: string;
  body: string | null;
  external_id: string | null;
  criado_em: string;
  enviado_em?: string;
  entregue_em?: string;
  lido_em?: string;
}

export interface WhatsAppConversation {
  instance_id: string;
  telefone: string;
  associado_id: string | null;
  total_mensagens: number;
  nao_lidas: number;
  ultima_mensagem: string | null;
  ultima_mensagem_em: string;
  ultima_direction: "in" | "out";
}
