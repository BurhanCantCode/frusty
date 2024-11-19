import { Message } from "@/lib/constants";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Card } from "./ui/card";
import { Bot, User } from "lucide-react";
import Image from 'next/image';

type ContentItem = {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
};

export function ChatMessage({ message }: { message: Message }) {
  const isArray = Array.isArray(message.content);
  const hasImage = isArray 
    ? (message.content as ContentItem[]).some((c: ContentItem) => c.type === 'image_url')
    : false;
  const textContent = isArray 
    ? (message.content as ContentItem[]).find((c: ContentItem) => c.type === 'text')?.text || ''
    : (message.content as string);
  const imageContent = isArray
    ? (message.content as ContentItem[]).find((c: ContentItem) => c.type === 'image_url')?.image_url?.url
    : null;

  return (
    <div
      className={cn(
        "mb-4 flex",
        message.role === "assistant" ? "justify-start" : "justify-end"
      )}
    >
      <Card
        className={cn(
          "flex max-w-[80%] gap-3 px-4 py-3",
          message.role === "assistant"
            ? "bg-muted/50"
            : "bg-primary text-primary-foreground"
        )}
      >
        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center">
          {message.role === "assistant" ? (
            <Bot className="h-4 w-4" />
          ) : (
            <User className="h-4 w-4" />
          )}
        </div>
        <div className="flex flex-col gap-3">
          {imageContent && (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={imageContent} 
              alt="Uploaded content"
              className="max-h-48 rounded-lg object-contain"
            />
          )}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <ReactMarkdown>{textContent}</ReactMarkdown>
          </div>
        </div>
      </Card>
    </div>
  );
} 