import React, { useState, useRef, useEffect } from "react";
import { Moon, Sun, Send } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { SendChatMessage } from "../features/ChatFeature.js";
import { nanoid } from "@reduxjs/toolkit";
import ReactMarkdown from "react-markdown";
import CodeBlock from "../features/CodeBlock.jsx";
import { FcCancel } from "react-icons/fc";

export default function MiddleChatBox() {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.Settings);
  const chats = useSelector((state) => state.messages);
  const selectedModel = settings.Model.selected;
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(chats);
  const [isLightTheme, setIsLightTheme] = useState(true);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const controllerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [message]);

  const handleSend = async () => {
    setSending(true);
    setError(null);
  
    const userMessage = { id: nanoid(), type: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    dispatch(SendChatMessage(userMessage));
    const aiMessageId = nanoid();
    setMessages((prev) => [
      ...prev,
      { id: aiMessageId, type: "ai", content: "...." },
    ]);
  
    const data = {
      model: selectedModel,
      messages: [{ role: "user", content: message }],
      options: {},
    };
    setMessage("");
  
    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;
  
    try {
      const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal,
      });
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let content = "";
  
      while (true) {
        const { value, done } = await reader.read();  
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const jsonData = JSON.parse(chunk);
        content += jsonData.message.content;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessageId ? { ...m, content } : m
          )
        );
      }
  
      dispatch(SendChatMessage({ id: aiMessageId, type: "ai", content }));
    } catch (e) {
      if (e.name === "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessageId ? { ...m, content: "Message canceled." } : m
          )
        );
      } else {
        setError("Failed to send message: " + e.message);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessageId
              ? { ...m, content: "Failed to send message." }
              : m
          )
        );
      }
    } finally {
      setSending(false);
    }
  };
  
  const handleCancel = () => {
    controllerRef.current?.abort();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleTheme = () => {
    setIsLightTheme((prev) => !prev);
  };



  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden relative ${isLightTheme ? "light" : "dark"}`}>
      <div className={`absolute inset-0 ${isLightTheme ? "bg-white" : "bg-black"}`}></div>
      <div className={`absolute inset-0 ${isLightTheme ? "bg-gradient-to-br from-white via-gray-100/20 to-white opacity-80" : "bg-gradient-to-br from-black via-gray-900/20 to-black opacity-80"}`}></div>
      <div className={`absolute inset-0 ${isLightTheme ? "backdrop-blur-xl bg-white/30" : "backdrop-blur-xl bg-black/30"}`}></div>

      <div className="relative z-10 h-full flex flex-col">
        <div className={`h-14 sm:h-16 border-b ${isLightTheme ? "border-gray-300/20" : "border-purple-500/20"} flex items-center justify-between px-3 sm:px-6 ${isLightTheme ? "bg-white/40" : "bg-black/40"} backdrop-blur-lg`}>
          <div className="text-white font-semibold text-lg flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLightTheme ? "bg-gray-400" : "bg-purple-400"} animate-pulse`}></div>
            <span className={isLightTheme ? "text-black" : "text-white"}>Ollama</span>
          </div>
          <div className="relative">
            <select className={`${isLightTheme ? "bg-white/40 text-black" : "bg-black/40 text-white"} py-1 px-2 sm:p-2 rounded-md border ${isLightTheme ? "border-gray-300/20" : "border-purple-500/20"} backdrop-blur-md focus:outline-none focus:ring-1 ${isLightTheme ? "focus:ring-gray-500/30" : "focus:ring-purple-500/30"} appearance-none pr-8 text-sm sm:text-base`}>
              <option className={`${isLightTheme ? "bg-white text-black" : "bg-black text-white"}`}>Ollama model 1</option>
              <option className={`${isLightTheme ? "bg-white text-black" : "bg-black text-white"}`}>Ollama model 2</option>
              <option className={`${isLightTheme ? "bg-white text-black" : "bg-black text-white"}`}>Ollama model 3</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          <button onClick={toggleTheme} className={`${isLightTheme ? "text-black hover:bg-purple-500" : "text-white hover:bg-purple-800"} p-2 hover:bg-purple-800/30 rounded-full transition-colors`} title="Toggle theme">
            {isLightTheme ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 custom-scrollbar ${isLightTheme ? "scrollbar-thumb-gray-500/10" : "scrollbar-thumb-purple-500/10"}`}>
          {messages.map((msg, index) =>
            msg.type === "ai" ? (
              <AIChat key={index} content={msg.content} isLightTheme={isLightTheme} />
            ) : (
              <UserChat key={index} content={msg.content} isLightTheme={isLightTheme} />
            )
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={`w-full px-2 sm:px-4 py-3 sm:py-6 ${isLightTheme ? "bg-white" : "bg-black/40"} backdrop-blur-lg border-t ${isLightTheme ? "border-gray-300" : "border-purple-500/20"}`}>
          <div className="w-full max-w-3xl mx-auto">
            <div className={`bg-white dark:bg-black/5 backdrop-blur-md border ${isLightTheme ? "border-gray-300" : "border-purple-500/80"} shadow-lg p-2 sm:p-4 rounded-xl relative`}>
              <textarea ref={textareaRef} rows={1} value={message} minLength={5} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder="Enter your prompt..." className={`w-full resize-none overflow-y-auto max-h-40 bg-transparent p-2 pr-12 sm:pr-16 rounded-md focus:outline-none focus:ring-0 text-sm sm:text-base ${isLightTheme ? "text-black placeholder:text-gray-600 focus:ring-gray-500" : "text-white placeholder:text-gray-500 focus:ring-purple-500/20"}`} />
              <button onClick={sending ? handleCancel : handleSend} className={`absolute right-3 bottom-4 sm:right-4 sm:bottom-6 transition-colors px-3 py-1 rounded-md text-sm flex items-center justify-center border ${isLightTheme ? "bg-gray-800/30 hover:bg-gray-700/40 text-black border-gray-500/30" : "bg-purple-800/30 hover:bg-purple-700/40 text-white border-purple-500/30"}`}>
                {sending ? <FcCancel size={20} /> : <Send size={20} />}
              </button>
            </div>
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${isLightTheme ? "rgba(100, 100, 100, 0.5) transparent" : "rgba(138, 75, 175, 0.5) transparent"};
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: ${isLightTheme ? "rgba(100, 100, 100, 0.5)" : "rgba(138, 75, 175, 0.5)"};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: ${isLightTheme ? "rgba(100, 100, 100, 0.7)" : "rgba(138, 75, 175, 0.7)"};
        }
      `}</style>
    </div>
  );
}

function UserChat({ content, isLightTheme }) {
  return (
    <div className={`flex p-2 sm:p-4 space-x-2 sm:space-x-3 justify-end`}>
      <div className="max-w-[75%] sm:max-w-[70%] md:max-w-xl lg:max-w-2xl">
        <p className={`${isLightTheme ? "bg-purple-200/30 text-gray-800" : "bg-purple-900/30 text-gray-200"} p-2 sm:p-3 rounded-lg border ${isLightTheme ? "border-purple-300/20" : "border-purple-500/20"} backdrop-blur-sm break-words`}>
          {content}
        </p>
      </div>
      <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full border ${isLightTheme ? "border-purple-300/20 bg-purple-300/20" : "border-purple-500/20 bg-purple-500/20"} flex items-center justify-center ${isLightTheme ? "text-black" : "text-white"}`}>
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
        </svg>
      </div>
    </div>
  );
}

function AIChat({ content, isLightTheme }) {
  return (
    <div className={`flex p-2 sm:p-4 space-x-2 sm:space-x-3`}>
      <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full border ${isLightTheme ? "border-purple-300/20 bg-purple-300/20" : "border-purple-500/20 bg-purple-500/20"} flex items-center justify-center ${isLightTheme ? "text-black" : "text-white"}`}>
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 7H7v6h6V7z" />
          <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 110-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
        </svg>
      </div>
      <div className={`${isLightTheme ? "text-black/80" : "text-white/80"} max-w-[75%] sm:max-w-[70%] md:max-w-xl lg:max-w-2xl bg-purple-600/10 p-5 overflow-y-auto rounded-md`}>
        <ReactMarkdown components={{ code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <CodeBlock language={match[1]} value={String(children).trim()} />
            ) : (
              <code className={className} {...props}>{children}</code>
            );
          }
        }}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
