'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GROQ_MODELS, type Message, type ModelId } from '@/lib/constants';
import { ImagePlus, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

declare module 'react-katex' {
  interface KatexProps {
    math: string;
    block?: boolean;
    errorColor?: string;
    renderError?: (error: any) => JSX.Element;
  }
  export const InlineMath: React.FC<KatexProps>;
  export const BlockMath: React.FC<KatexProps>;
}

type CodeProps = {
  node?: any;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState<ModelId>(GROQ_MODELS[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!input.trim() && !selectedImage) return;

    let newMessage: Message;

    if (selectedImage) {
      newMessage = {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: selectedImage } },
          { type: 'text', text: input || 'Analyze this image' }
        ]
      };
    } else {
      newMessage = {
        role: 'user',
        content: input
      };
    }

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await fetch(selectedImage ? '/api/chat-image' : '/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, newMessage],
          model: selectedImage ? "llama-3.2-11b-vision-preview" : model,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result as string;
      setSelectedImage(base64Image);
    };
    reader.readAsDataURL(file);
  };

  const renderMessageContent = (content: Message['content']) => {
    if (typeof content === 'string') {
      return (
        <ReactMarkdown
          className="prose dark:prose-invert max-w-none"
          components={{
            strong: ({ children }) => <span className="font-bold">{children}</span>,
            em: ({ children }) => <span className="italic">{children}</span>,
            ul: ({ children }) => <ul className="list-disc ml-4 my-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal ml-4 my-2">{children}</ol>,
            li: ({ children }) => <li className="my-1">{children}</li>,
            code: ({ inline, className, children, ...props }: CodeProps) => {
              if (!children) return null;
              const match = /language-(\w+)/.exec(className || '');
              const textContent = children.toString();
              
              if (inline && textContent.startsWith('$') && textContent.endsWith('$')) {
                const math = textContent.slice(1, -1);
                return <InlineMath math={math} />;
              } else if (match && match[1] === 'math') {
                return <BlockMath math={textContent} />;
              }
              return <code className={className} {...props}>{children}</code>;
            }
          }}
        >
          {content.replace(/\$([^$]+)\$/g, '`$$$1$$`')}
        </ReactMarkdown>
      );
    }
    
    if (Array.isArray(content)) {
      return content.map((item, index) => (
        <div key={index}>
          {item.type === 'image_url' && item.image_url?.url && (
            <img 
              src={item.image_url.url} 
              alt="Uploaded content"
              className="max-w-sm rounded-lg mb-2" 
            />
          )}
          {item.type === 'text' && item.text && (
            <ReactMarkdown
              className="prose dark:prose-invert max-w-none"
              components={{
                strong: ({ children }) => <span className="font-bold">{children}</span>,
                em: ({ children }) => <span className="italic">{children}</span>,
                ul: ({ children }) => <ul className="list-disc ml-4 my-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal ml-4 my-2">{children}</ol>,
                li: ({ children }) => <li className="my-1">{children}</li>,
                code: ({ inline, className, children, ...props }: CodeProps) => {
                  if (!children) return null;
                  const match = /language-(\w+)/.exec(className || '');
                  const textContent = children.toString();
                  
                  if (inline && textContent.startsWith('$') && textContent.endsWith('$')) {
                    const math = textContent.slice(1, -1);
                    return <InlineMath math={math} />;
                  } else if (match && match[1] === 'math') {
                    return <BlockMath math={textContent} />;
                  }
                  return <code className={className} {...props}>{children}</code>;
                }
              }}
            >
              {item.text.replace(/\$([^$]+)\$/g, '`$$$1$$`')}
            </ReactMarkdown>
          )}
        </div>
      ));
    }

    return null;
  };

  return (
    <main className="container mx-auto p-4 max-w-4xl min-h-screen">
      <Card className="mt-4 shadow-lg">
        <div className="p-4 flex gap-4 border-b">
          <Select 
            value={model} 
            onValueChange={(value: ModelId) => {
              setModel(value);
              setMessages([]);
              setSelectedImage(null);
              setInput('');
            }}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {GROQ_MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{model.name}</span>
                    <span className="text-xs text-muted-foreground">{model.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="p-4 space-y-4 h-[600px] overflow-y-auto bg-background">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-4 rounded-lg max-w-[80%] ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 shadow-sm'
                }`}
              >
                <div className={`${
                  message.role === 'assistant' 
                    ? 'prose prose-gray dark:prose-invert max-w-none' 
                    : 'text-sm'
                }`}>
                  {renderMessageContent(message.content)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t bg-card">
          {selectedImage && (
            <div className="mb-4 relative">
              <img 
                src={selectedImage} 
                alt="Selected" 
                className="max-h-[200px] rounded-lg object-contain" 
              />
              <Button
                onClick={() => setSelectedImage(null)}
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
              >
                Remove
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedImage ? "Add a message about the image..." : "Type a message..."}
              className="flex-1 min-h-[80px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                disabled={isLoading}
                className="h-10 w-10 p-0"
              >
                <ImagePlus className="h-4 w-4" />
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="h-10 w-10 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}