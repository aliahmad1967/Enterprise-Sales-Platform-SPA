import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Send, Sparkles } from "lucide-react";
import { Avatar, Button, Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle, Tooltip } from "@esp/ui";
import { uid } from "@esp/utils";
import { useI18n } from "@/i18n";
import { useUiStore } from "@/state/ui";
import { answerQuery, type AiMessage } from "@/lib/ai";

const suggestions = ["ai.analyze", "ai.forecast", "ai.lowStock", "ai.summarize"] as const;
const suggestionPrompts = ["Analyze this month's sales", "Forecast next month", "Reorder suggestions", "Summarize performance"];

export function AiAssistant() {
  const { t, locale } = useI18n();
  const open = useUiStore((s) => s.aiOpen);
  const setOpen = useUiStore((s) => s.setAiOpen);
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        locale === "ar"
          ? "مرحباً! أنا المساعد الذكي. اسألني عن المبيعات، التوقعات، أو إعادة الطلب."
          : "Hi! I'm your AI assistant. Ask me about sales, forecasts, or reordering.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    setInput("");
    setMessages((m) => [...m, { id: uid("msg"), role: "user", content }]);
    setBusy(true);
    try {
      const reply = await answerQuery(content);
      setMessages((m) => [...m, { id: uid("msg"), role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: uid("msg"), role: "assistant", content: t("toast.error") },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 20 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-20 end-4 z-40 flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-primary transition-transform hover:scale-105 active:scale-95 sm:bottom-6"
        aria-label={t("nav.aiAssistant")}
      >
        <Sparkles className="size-5" />
      </motion.button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="end" className="sm:max-w-md w-full">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Sparkles className="size-4" />
              </span>
              {t("ai.title")}
            </SheetTitle>
          </SheetHeader>

          <SheetBody className="flex flex-col gap-3 pb-0">
            {messages.length <= 1 ? (
              <div className="space-y-2 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("ai.suggested")}
                </p>
                {suggestions.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => send(suggestionPrompts[i]!)}
                    className="flex w-full items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {t(s)}
                    <ArrowUp className="ms-auto size-3.5 rtl:rotate-180" />
                  </button>
                ))}
              </div>
            ) : null}

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto py-2">
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex items-start gap-2.5">
                    <Avatar name="AI" color="#7C3AED" size="sm" />
                    <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-border bg-surface px-4 py-2.5 text-sm whitespace-pre-line text-foreground shadow-xs">
                      {m.content}
                    </div>
                  </div>
                ),
              )}
              {busy ? (
                <div className="flex items-start gap-2.5">
                  <Avatar name="AI" color="#7C3AED" size="sm" />
                  <div className="flex items-center gap-1 rounded-2xl border border-border bg-surface px-4 py-3">
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.15s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.3s]" />
                  </div>
                </div>
              ) : null}
            </div>
          </SheetBody>

          <div className="border-t border-border p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("ai.placeholder")}
                className="h-10 flex-1 rounded-xl border border-input bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={t("ai.placeholder")}
              />
              <Tooltip content={t("ai.send")}>
                <Button type="submit" size="icon" disabled={busy || !input.trim()}>
                  <Send className="size-4" />
                </Button>
              </Tooltip>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
