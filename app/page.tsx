'use client';

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, MessageSquare, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center px-4 py-16">
      {/* Hero Section */}
      <motion.section 
        className="mx-auto max-w-5xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-6 text-4xl font-bold sm:text-6xl">
          Experience Next-Gen{" "}
          <motion.span 
            className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent"
            animate={{ 
              backgroundPosition: ["0%", "100%", "0%"],
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            AI Chat
          </motion.span>
        </h1>
        <p className="mb-4 text-lg text-muted-foreground sm:text-xl">
          Powerful AI conversations without the limits. No signup required.
        </p>
        <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
          Just chat. No accounts. No restrictions. No BS.
        </p>
        <motion.div 
          className="flex justify-center gap-4"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button asChild size="lg">
            <Link href="/chat">
              Start Chatting <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section className="mx-auto mt-24 max-w-5xl">
        <motion.h2 
          className="mb-12 text-center text-3xl font-bold"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Why Choose Us?
        </motion.h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <MessageSquare className="h-8 w-8" />,
              title: "No Limits",
              description: "Created as an alternative to ChatGPT's restrictive limits and signup requirements"
            },
            {
              icon: <Zap className="h-8 w-8" />,
              title: "Instant Access",
              description: "No accounts, no signups - just start chatting immediately"
            },
            {
              icon: <Shield className="h-8 w-8" />,
              title: "Multiple Models",
              description: "Choose from various AI models for different needs"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Section */}
      <section className="mx-auto mt-24 max-w-5xl text-center">
        <h2 className="mb-6 text-3xl font-bold">The Story</h2>
        <p className="text-lg text-muted-foreground">
          Built out of frustration with ChatGPT's limitations and endless login prompts. 
          I wanted a simple tool that just works - no accounts, no usage limits, no interruptions. 
          That's exactly what this is.
        </p>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Card>
        <CardContent className="flex flex-col items-center p-6 text-center">
          <motion.div 
            className="mb-4 rounded-lg bg-primary/10 p-3"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            {icon}
          </motion.div>
          <h3 className="mb-2 font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
