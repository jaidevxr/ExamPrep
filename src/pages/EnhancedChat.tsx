import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Loader2, Plus, MessageSquare, Trash2, Menu, X, Search } from "lucide-react";
import { ArcadeNavbar } from "@/components/ArcadeNavbar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Message = { role: "user" | "assistant"; content: string };
type Conversation = { id: string; title: string; created_at: string };

const EnhancedChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading conversations:', error);
      return;
    }

    setConversations(data || []);
  };

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load conversation');
      return;
    }

    const typedMessages = (data || []).map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }));

    setMessages(typedMessages);
    setCurrentConversationId(conversationId);
    setSidebarOpen(false);
  };

  const createNewConversation = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user?.id,
        title: 'New Conversation'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
      return;
    }

    setMessages([]);
    setCurrentConversationId(data.id);
    loadConversations();
    setSidebarOpen(false);
  };

  const deleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      toast.error('Failed to delete conversation');
      return;
    }

    if (currentConversationId === conversationId) {
      setMessages([]);
      setCurrentConversationId(null);
    }

    loadConversations();
    toast.success('Conversation deleted');
  };

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!currentConversationId) return;

    await supabase.from('messages').insert({
      conversation_id: currentConversationId,
      role,
      content
    });

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', currentConversationId);
  };

  const streamChat = async (userMessage: Message) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
    
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: [...messages, userMessage]
        }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) {
          toast.error("Rate limit exceeded. Please try again later.");
          return;
        }
        if (resp.status === 402) {
          toast.error("AI credits exhausted. Please contact support.");
          return;
        }
        throw new Error("Failed to start stream");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let assistantContent = "";

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save assistant message to database
      if (assistantContent) {
        await saveMessage('assistant', assistantContent);
        
        // Update conversation title if it's the first message
        if (messages.length === 1) {
          await supabase
            .from('conversations')
            .update({ title: userMessage.content.slice(0, 50) })
            .eq('id', currentConversationId);
          loadConversations();
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get response. Please try again.");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Create conversation if needed
    if (!currentConversationId) {
      const { data } = await supabase
        .from('conversations')
        .insert({
          user_id: user?.id,
          title: input.slice(0, 50)
        })
        .select()
        .single();

      if (data) {
        setCurrentConversationId(data.id);
        loadConversations();
      }
    }

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Save user message
    if (currentConversationId) {
      await saveMessage('user', input);
    }

    await streamChat(userMessage);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <ArcadeNavbar />
      <div className="min-h-screen min-h-[100dvh] w-full relative flex">
        {/* Sidebar - Conversation History */}
        <div className={`fixed lg:relative inset-y-0 left-0 z-40 w-72 bg-card border-r-2 border-border transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} pt-16 lg:pt-0`}>
          <div className="h-full flex flex-col p-4">
            <Button
              onClick={createNewConversation}
              className="w-full font-black arcade-text border-2 border-border mb-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              NEW CHAT
            </Button>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="pl-10 minecraft-block text-sm"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredConversations.length === 0 && searchQuery && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No conversations found
                </p>
              )}
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => loadMessages(conv.id)}
                  className={`p-3 minecraft-block cursor-pointer hover:bg-accent/10 transition-all ${
                    currentConversationId === conv.id ? 'bg-accent/20 border-accent' : ''
                  } group`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <MessageSquare className="h-3 w-3 mb-1 text-muted-foreground" />
                      <p className="text-xs font-bold truncate">{conv.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => deleteConversation(conv.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col pt-16 lg:pt-0">
          {/* Mobile menu button */}
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden fixed top-20 left-4 z-20 minecraft-block"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-4xl h-full flex flex-col">
            <div className="bg-gradient-to-r from-accent/10 via-accent/20 to-accent/10 backdrop-blur-sm pixel-border py-4 px-4 sm:py-6 sm:px-6 relative overflow-hidden mb-4">
              <div className="relative z-10">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black arcade-text text-accent flex items-center gap-3">
                  🤖 AI STUDY BUDDY
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 uppercase tracking-wider font-bold">
                  Unlimited conversations • Instant responses
                </p>
              </div>
            </div>

            <Card className="flex-1 overflow-hidden minecraft-block bg-card/95 mb-4 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4 p-4">
                      <div className="text-5xl sm:text-6xl">🎓</div>
                      <p className="text-muted-foreground text-xs sm:text-sm uppercase tracking-wider font-bold max-w-xs">
                        Start a new conversation with your AI study buddy!
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto pt-4">
                        {['Explain quantum physics', 'Help me plan my studies', 'Quiz me on history', 'Study tips for exams'].map((prompt, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            onClick={() => setInput(prompt)}
                            className="minecraft-block text-xs font-bold h-auto py-3 whitespace-normal"
                          >
                            {prompt}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 minecraft-block ${
                            message.role === "user"
                              ? "bg-accent/20 border-accent/40"
                              : "bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="text-lg">
                              {message.role === "user" ? "👤" : "🤖"}
                            </div>
                            <p className="text-[10px] sm:text-xs uppercase tracking-wider font-black text-muted-foreground">
                              {message.role === "user" ? "You" : "AI Buddy"}
                            </p>
                          </div>
                          <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start animate-fade-in">
                        <div className="bg-muted/50 p-3 sm:p-4 minecraft-block">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <p className="text-xs text-muted-foreground">Thinking...</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <div className="p-3 sm:p-4 border-t-4 border-border">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything..."
                    disabled={isLoading}
                    className="flex-1 minecraft-block h-11 sm:h-12 text-sm sm:text-base"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="minecraft-block bg-accent text-accent-foreground hover:bg-accent/90 h-11 sm:h-12 px-4 sm:px-6"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  Powered by Lovable AI • Unlimited conversations
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnhancedChat;
