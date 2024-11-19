'use client';
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { GROQ_MODELS, initialChatSessions, type Message, type ModelId, type ChatSession, getModelById } from "@/lib/constants";
import { Send, ImagePlus, X, Plus, MessageSquare, Mic, Upload } from "lucide-react";
import { ChatMessage } from "@/components/chat-message";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
}

export default function ChatPage() {
  const [currentModel, setCurrentModel] = useState<ModelId>("mixtral-8x7b-32768");
  const [chatSessions, setChatSessions] = useState<Record<ModelId, Message[]>>(initialChatSessions);
  const [savedChats, setSavedChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout>();

  // Scroll to bottom effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load saved chats from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedChats');
    if (saved) {
      setSavedChats(JSON.parse(saved));
    }
  }, []);

  // Save chats to localStorage
  useEffect(() => {
    localStorage.setItem('savedChats', JSON.stringify(savedChats));
  }, [savedChats]);

  // Handle image selection
  const handleImageSelect = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        setImage(base64Image);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      });
    }
  };

  // Handle pasted images
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items || []);
      for (const item of items) {
        if (item.type.indexOf('image') === 0) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            await handleImageSelect(file);
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const createNewChat = () => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      name: `${getModelById(currentModel)?.name || 'New Chat'} ${savedChats.length + 1}`,
      modelId: currentModel,
      messages: [],
      lastUpdated: Date.now()
    };
    setSavedChats(prev => [...prev, newChat]);
    setCurrentChatId(newChat.id);
    setMessages([]);
    setImage(null);
    setInput("");
  };

  const loadChat = (chatId: string) => {
    const chat = savedChats.find(c => c.id === chatId);
    if (chat) {
      // Set the model first to ensure proper context
      setCurrentModel(chat.modelId);
      setMessages(chat.messages);
      setCurrentChatId(chatId);
      // Reset image and input states
      setImage(null);
      setInput("");
    }
  };

  const updateCurrentChat = (newMessages: Message[]) => {
    if (currentChatId) {
      setSavedChats(prev => prev.map(chat => 
        chat.id === currentChatId
          ? { 
              ...chat, 
              messages: newMessages, 
              lastUpdated: Date.now(),
              modelId: currentModel // Ensure model is saved
            }
          : chat
      ));
    }
  };

  const handleModelChange = (newModel: ModelId) => {
    if (currentModel !== newModel) {
      // Save current chat before switching
      if (currentChatId && messages.length > 0) {
        setSavedChats(prev => prev.map(chat => 
          chat.id === currentChatId
            ? { ...chat, messages, lastUpdated: Date.now() }
            : chat
        ));
      }

      // Create new chat with new model
      const newChat: ChatSession = {
        id: Date.now().toString(),
        name: `${getModelById(newModel)?.name || 'New Chat'} ${savedChats.length + 1}`,
        modelId: newModel,
        messages: [],
        lastUpdated: Date.now()
      };

      setSavedChats(prev => [...prev, newChat]);
      setCurrentModel(newModel);
      setCurrentChatId(newChat.id);
      setMessages([]);
      setImage(null);
      setInput("");
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !image) || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: image ? [
        {
          type: "image_url",
          image_url: { url: image }
        },
        {
          type: "text",
          text: input || "What do you see in this image?"
        }
      ] : input
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    updateCurrentChat(newMessages);
    setInput("");
    setImage(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: newMessages,
          modelId: currentModel 
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      const updatedMessages = [...newMessages, data];
      setMessages(updatedMessages);
      updateCurrentChat(updatedMessages);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from AI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm' // Use WebM format which is widely supported
      });
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        // Convert WebM to WAV format
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const wavBlob = await convertToWav(audioBlob);
        const audioUrl = URL.createObjectURL(wavBlob);
        setAudioUrl(audioUrl);
        handleAudioSubmit(wavBlob);
        // Clear recording state
        setRecordingDuration(0);
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }
      };

      mediaRecorder.start(1000); // Record in 1-second chunks
      recorderRef.current = mediaRecorder;
      setIsRecording(true);
      
      // Start duration counter
      setRecordingDuration(0);
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Stop recording after 30 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          stopRecording();
        }
      }, 30000);
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "Error",
        description: "Failed to start recording. Make sure you have a microphone connected.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
      recorderRef.current.stream.getTracks().forEach(track => track.stop());
      recorderRef.current = null;
    }
    setIsRecording(false);
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
  };

  const handleAudioSubmit = async (audioBlob: Blob) => {
    if (!audioBlob) return;

    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('modelId', currentModel);

    setIsLoading(true);
    setInput("Waiting for transcription model to load...");

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to transcribe audio');
      }

      const data = await response.json();
      const transcription = data.text;

      // Add the transcription as a user message
      const userMessage: Message = {
        role: "user",
        content: [
          {
            type: "audio_url",
            audio_url: { url: audioUrl || '' }
          },
          {
            type: "text",
            text: transcription
          }
        ]
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      updateCurrentChat(newMessages);
      setInput("");
      setAudioUrl(null);

      // Get AI response
      await handleSubmit();
    } catch (error) {
      console.error('Audio transcription error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to transcribe audio',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  // Add this helper function to convert audio to WAV format
  const convertToWav = async (blob: Blob): Promise<Blob> => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;
    const wavBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);
    
    // Copy the audio data to the new buffer
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      wavBuffer.copyToChannel(channelData, channel);
    }
    
    // Convert to WAV
    const offlineContext = new OfflineAudioContext(numberOfChannels, length, sampleRate);
    const source = offlineContext.createBufferSource();
    source.buffer = wavBuffer;
    source.connect(offlineContext.destination);
    source.start();
    
    const renderedBuffer = await offlineContext.startRendering();
    
    // Create WAV file
    const wavData = new Float32Array(renderedBuffer.length);
    renderedBuffer.copyFromChannel(wavData, 0);
    
    return new Blob([wavData], { type: 'audio/wav' });
  };

  // Add visual indicator for model in chat list
  const renderChatButton = (chat: ChatSession) => (
    <button
      key={chat.id}
      onClick={() => loadChat(chat.id)}
      className={`w-full px-4 py-2 text-left hover:bg-accent flex flex-col gap-1 ${
        currentChatId === chat.id ? 'bg-accent' : ''
      }`}
    >
      <span className="font-medium truncate">{chat.name}</span>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {formatDate(chat.lastUpdated)}
        </span>
        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
          {getModelById(chat.modelId)?.name.split(' ')[0]}
        </span>
      </div>
    </button>
  );

  return (
    <div className="container mx-auto flex h-[calc(100vh-3.5rem)] gap-4 p-4">
      {/* Sidebar */}
      <div className="w-64 flex flex-col gap-2">
        <Button onClick={createNewChat} className="w-full">
          <Plus className="mr-2 h-4 w-4" /> New Chat
        </Button>
        <div className="flex-1 overflow-auto rounded-lg border">
          {savedChats
            .sort((a, b) => b.lastUpdated - a.lastUpdated)
            .map(chat => renderChatButton(chat))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Model Selection and Info */}
        <div className="flex flex-col gap-2">
          <Select value={currentModel} onValueChange={handleModelChange}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(GROQ_MODELS.reduce((acc, model) => {
                const category = model.category;
                if (!acc[category]) acc[category] = [];
                acc[category].push(model);
                return acc;
              }, {} as Record<string, typeof GROQ_MODELS[number][]>)).map(([category, models]) => (
                <SelectGroup key={category}>
                  <SelectLabel>{category}</SelectLabel>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {model.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>

          {/* Model Info */}
          {currentModel && (
            <div className="rounded-lg bg-muted p-2 text-sm">
              <h3 className="font-medium">Model Capabilities:</h3>
              <ul className="mt-1 list-disc pl-4">
                {getModelById(currentModel)?.bestFor.map((use, i) => (
                  <li key={i}>{use}</li>
                ))}
              </ul>
              <p className="mt-1 text-xs text-muted-foreground">
                Limits: {getModelById(currentModel)?.limits.requestsPerDay} requests/day
              </p>
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <Card className="flex-1 overflow-hidden p-4">
          <div className="h-full overflow-y-auto pr-4">
            {messages.map((message, i) => (
              <ChatMessage key={i} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </Card>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          {image && (
            <div className="relative">
              <img 
                src={image} 
                alt="Preview" 
                className="max-h-48 rounded-lg object-contain"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2"
                onClick={() => setImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {audioUrl && (
            <div className="relative">
              <audio src={audioUrl} controls className="w-full" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2"
                onClick={() => setAudioUrl(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                getModelById(currentModel)?.category === 'Audio Models'
                  ? "Record or upload audio..."
                  : image 
                  ? "Add a description for the image..." 
                  : "Type your message... (Ctrl+V to paste images)"
              }
              className="min-h-[60px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
              
              {getModelById(currentModel)?.category === 'Audio Models' ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => isRecording ? stopRecording() : startRecording()}
                    className="relative"
                  >
                    <Mic className={`h-4 w-4 ${isRecording ? 'text-red-500' : ''}`} />
                    {isRecording && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                        {recordingDuration}s
                      </span>
                    )}
                  </Button>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    ref={audioInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAudioSubmit(file);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => audioInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageSelect(file);
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={isLoading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function handleAIResponse(newMessages: Message[]) {
  throw new Error("Function not implemented.");
}
