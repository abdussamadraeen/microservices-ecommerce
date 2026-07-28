"use client";
import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";
import { sendMessageToGemini } from "../services/geminiService";
import { ChatMessage, GeminiHistoryItem } from "@repo/types";

const MI_ORANGE = "#FF6A00";

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Hi there! I'm your Mi AI Assistant. Need help choosing a new phone or smart device? 📱✨",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      scrollToBottom();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    const userText = input.trim();
    if (!userText || isLoading) return;

    const newUserMessage: ChatMessage = { role: "user", text: userText };
    const updatedMessages = [...messages, newUserMessage];

    // Update UI immediately
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Filter out error messages
      const historyCandidates = updatedMessages.filter((m) => !m.isError);

      // If first item is model, drop it so history starts with user (Gemini quirk)
      if (historyCandidates.length > 0 && historyCandidates[0]?.role === "model") {
        historyCandidates.shift();
      }

      const history: GeminiHistoryItem[] = historyCandidates.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const responseText = await sendMessageToGemini(userText, history);

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: responseText,
        },
      ]);
    } catch {
      // append error message (flagged) so it can be filtered next time
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Sorry, I encountered an error. Please check your connection.",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] rounded-full shadow-xl transition-all duration-300 hover:scale-110 w-[60px] h-[60px] bg-[#FF6A00] border-[3px] border-white flex items-center justify-center overflow-hidden print:hidden"
      >
        {isOpen ? (
          <X className="text-white w-8 h-8" />
        ) : (
          <Image
            src="/chat.png"
            alt="Chat Icon"
            width={42}
            height={42}
            className="object-contain"
          />
        )}
      </button>


      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 w-[90vw] md:w-96 bg-white rounded-2xl shadow-2xl z-[9999] flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right h-[500px] outline outline-[3px] outline-[#FF6A00] print:hidden ${isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
          }`}
        role="dialog"
        aria-label="Mi AI Assistant"
      >
        {/* Header */}
        <div className="p-4 flex items-center gap-3 bg-[#FF6A00]">
          <div className="bg-white/20 p-2 rounded-full">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-bold">Mi AI Assistant</h3>
            <p className="text-white/90 text-xs">Powered by Gemini</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4" role="log" aria-live="polite">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user"
                  ? "rounded-tr-none bg-[#FF6A00] text-white"
                  : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none"
                  } ${msg.isError ? "!bg-red-50 !text-red-600 !border-red-200" : ""}`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#FF6A00]" />
                <span className="text-xs text-gray-500">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#FF6A00]">
          <div className="flex items-center gap-3 rounded-full px-4 py-3 bg-white h-12 shadow-sm">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about phones, specs..."
              aria-label="Type a message"
              disabled={isLoading}
              className="flex-1 bg-transparent border-none outline-none text-base placeholder-gray-400 text-gray-900 pl-3 caret-[#FF6A00] selection:bg-[#FF6A00] selection:text-white"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              className={`p-2 rounded-full transition-colors ${input.trim()
                ? "bg-[#FF6A00] text-white"
                : "bg-gray-100 text-gray-300 cursor-not-allowed"
                }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default ChatWidget;
