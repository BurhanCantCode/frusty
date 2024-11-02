'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Image, MessageSquare, Zap, Bot } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-blue-500/5" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-8 max-w-3xl relative z-10"
      >
        {/* Floating bot icon */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [-10, 10, -10] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="mb-6"
        >
          <Bot className="w-16 h-16 mx-auto text-primary" />
        </motion.div>

        <motion.h1 
          className="text-5xl md:text-7xl font-bold"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-primary">
            Fuck GPA
          </span>
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          No signup. No BS. Just start chatting.
        </motion.p>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all"
              whileHover={{ 
                scale: 1.05,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * (i + 4) }}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <feature.icon className="w-10 h-10 mb-4 text-primary" />
              </motion.div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16 flex justify-center"
        >
          <Link href="/chat">
            <motion.button
              className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium text-lg flex items-center gap-2 hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Chatting <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

const features = [
  {
    title: 'Multiple AI Models',
    description: 'Choose from various AI models optimized for different tasks and capabilities.',
    icon: Zap
  },
  {
    title: 'Image Analysis',
    description: 'Upload images and get detailed AI analysis with visual understanding.',
    icon: Image
  },
  {
    title: 'Natural Conversations',
    description: 'Engage in fluid conversations with advanced language models.',
    icon: MessageSquare
  }
];
