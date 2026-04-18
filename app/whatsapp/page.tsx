"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import {
  supabaseHub, callHubEdge, HUB_ANON,
  type WhatsAppInstance, type WhatsAppMessage, type WhatsAppConversation,
} from "@/lib/hub";

export default function WhatsAppPage() {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load instances
  useEffect(() => {
    const load = async () => {
      const { data } = await (supabaseHub as any).from("whatsapp_instances")
        .select("*").order("is_default_central", { ascending: false });
      const list = (data || []) as WhatsAppInstance[];
      setInstances(list);
      if (!selectedInstanceId) {
        const def = list.find((i) => i.is_default_central) || list[0];
        if (def) setSelectedInstanceId(def.id);
      }
    };
    load();
    const ch = supabaseHub.channel("evt-hub-instances")
      .on("postgres_changes" as any,
        { event: "*", schema: "public", table: "whatsapp_instances" },
        load).subscribe();
    return () => { supabaseHub.removeChannel(ch); };
  }, []);

  // Load conversations
  useEffect(() => {
    if (!selectedInstanceId) return;
    const load = async () => {
      const { data } = await (supabaseHub as any).from("whatsapp_conversations")
        .select("*")
        .eq("instance_id", selectedInstanceId)
        .order("ultima_mensagem_em", { ascending: false })
        .limit(200);
      setConversations((data || []) as WhatsAppConversation[]);
    };
    load();
    const ch = supabaseHub.channel(`evt-hub-msgs-${selectedInstanceId}`)
      .on("postgres_changes" as any,
        { event: "*", schema: "public", table: "whatsapp_messages",
          filter: `instance_id=eq.${selectedInstanceId}` },
        load).subscribe();
    return () => { supabaseHub.removeChannel(ch); };
  }, [selectedInstanceId]);

  // Load messages
  useEffect(() => {
    if (!selectedInstanceId || !selectedPhone) { setMessages([]); return; }
    const load = async () => {
      const { data } = await (supabaseHub as any).from("whatsapp_messages")
        .select("*")
        .eq("instance_id", selectedInstanceId)
        .eq("telefone", selectedPhone)
        .order("criado_em", { ascending: true })
        .limit(500);
      setMessages((data || []) as WhatsAppMessage[]);
      setTimeout(() => scrollRef.current?.scrollTo({ top: 1e9 }), 50);
    };
    load();
    const ch = supabaseHub.channel(`evt-msg-${selectedInstanceId}-${selectedPhone}`)
      .on("postgres_changes" as any,
        { event: "*", schema: "public", table: "whatsapp_messages",
          filter: `instance_id=eq.${selectedInstanceId}` },
        (p: any) => {
          const r = p.new || p.old;
          if (r?.telefone === selectedPhone) load();
        }).subscribe();
    return () => { supabaseHub.removeChannel(ch); };
  }, [selectedInstanceId, selectedPhone]);

  const activeInstance = instances.find((i) => i.id === selectedInstanceId);

  const handleSend = async () => {
    if (!draft.trim() || !selectedPhone || !selectedInstanceId) return;
    const text = draft.trim();
    setDraft("");
    setSending(true);
    try {
      await callHubEdge("whatsapp-send", {
        instance_id: selectedInstanceId,
        telefone: selectedPhone,
        texto: text,
      });
    } catch (e: any) {
      alert("Falha ao enviar: " + e.message);
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  const handleConnect = async () => {
    if (!activeInstance) return;
    setQr(null);
    setQrOpen(true);
    try {
      const r = await callHubEdge("whatsapp-instance-connect",
        { instance_id: activeInstance.id });
      setQr(r.qr_code);
    } catch (e: any) {
      alert("Falha: " + e.message);
      setQrOpen(false);
    }
  };

  const filteredConvs = conversations;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-6 py-3">
        <h1 className="text-xl font-bold">WhatsApp — Eventos PRO</h1>
        <p className="text-xs text-slate-500">
          Painel compartilhado Hub Central (uazapi + Meta Cloud)
        </p>
      </header>

      <div className="flex h-[calc(100vh-4rem)] border-t">
        {/* Instâncias */}
        <div className="w-20 bg-slate-100 border-r flex flex-col items-center py-3 gap-2">
          {instances.map((i) => {
            const active = i.id === selectedInstanceId;
            const letter = i.tipo === "meta_oficial" ? "M" :
              i.tipo === "central" ? "C" : (i.nome[0]?.toUpperCase() || "?");
            const color = i.tipo === "central" ? "bg-blue-100 text-blue-700" :
              i.tipo === "meta_oficial" ? "bg-emerald-100 text-emerald-700" :
              "bg-slate-200 text-slate-600";
            return (
              <button
                key={i.id}
                onClick={() => { setSelectedInstanceId(i.id); setSelectedPhone(null); }}
                className={`relative h-11 w-11 rounded-xl font-bold ${color} ${
                  active ? "ring-2 ring-blue-600 ring-offset-2 ring-offset-slate-100" : ""
                }`}
                title={`${i.nome} — ${i.status}`}
              >
                {letter}
                <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-slate-100 ${
                  i.status === "connected" ? "bg-emerald-500" :
                  i.status === "qr_pending" ? "bg-amber-500" : "bg-slate-400"
                }`} />
              </button>
            );
          })}
        </div>

        {/* Conversas */}
        <div className="w-80 bg-white border-r flex flex-col">
          {activeInstance && (
            <div className="p-3 border-b bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{activeInstance.nome}</p>
                  <p className="text-[11px] text-slate-500">
                    {activeInstance.status === "connected"
                      ? (activeInstance.telefone || "Online")
                      : activeInstance.status}
                  </p>
                </div>
                {activeInstance.status !== "connected" && activeInstance.tipo !== "meta_oficial" && (
                  <button
                    onClick={handleConnect}
                    className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded"
                  >
                    Conectar
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">
                Nenhuma conversa
              </div>
            ) : filteredConvs.map((c) => (
              <button
                key={c.telefone}
                onClick={() => setSelectedPhone(c.telefone)}
                className={`w-full text-left px-3 py-2.5 border-b hover:bg-slate-50 ${
                  c.telefone === selectedPhone ? "bg-slate-100" : ""
                }`}
              >
                <div className="flex justify-between items-center gap-2">
                  <p className="font-medium text-sm truncate">{c.telefone}</p>
                  {c.nao_lidas > 0 && (
                    <span className="bg-emerald-500 text-white text-[10px] rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center">
                      {c.nao_lidas}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {c.ultima_direction === "out" && <span className="opacity-60">Você: </span>}
                  {c.ultima_mensagem || "(mídia)"}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col bg-[#efeae2]">
          {!selectedPhone ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Selecione uma conversa
            </div>
          ) : (
            <>
              <div className="bg-white border-b px-4 py-3 shadow-sm">
                <p className="font-semibold text-sm">{selectedPhone}</p>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((m) => {
                  const mine = m.direction === "out";
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-lg px-3 py-2 shadow-sm ${
                        mine ? "bg-[#d9fdd3]" : "bg-white"
                      }`}>
                        <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] text-slate-500">
                            {new Date(m.criado_em).toLocaleTimeString("pt-BR",
                              { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-3 bg-white border-t">
                <div className="flex gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                    }}
                    rows={1}
                    placeholder="Escreva uma mensagem"
                    className="flex-1 resize-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !draft.trim()}
                    className="bg-blue-600 text-white px-4 rounded-lg text-sm disabled:opacity-50"
                  >
                    {sending ? "..." : "Enviar"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {qrOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Conectar WhatsApp</h3>
            <p className="text-sm text-slate-600 mb-4">
              Abra WhatsApp &gt; Aparelhos conectados &gt; Conectar dispositivo e leia o QR.
            </p>
            {qr ? (
              <img
                src={qr.startsWith("data:") ? qr : `data:image/png;base64,${qr}`}
                alt="QR"
                className="w-64 h-64 mx-auto border-2 p-2 rounded"
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                Gerando QR...
              </div>
            )}
            <button
              onClick={() => setQrOpen(false)}
              className="w-full mt-4 py-2 border rounded"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
