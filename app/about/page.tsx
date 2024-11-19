'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Bot, Sparkles, Zap, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div 
        className="max-w-4xl mx-auto space-y-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Main Story Section */}
        <motion.section 
          className="text-center"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold mb-6">
            <motion.span 
              className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ["0%", "100%", "0%"],
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              The Skibidi Story
            </motion.span>
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            womp womp... another AI chat app? 🤔
          </p>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-xl">
              NO SIGNUP?! NO LIMITS?! GYATT?! FR FR NO CAP ON GOD?! 
              <span className="text-purple-500"> SKIBIDI TOILET</span> APPROVED! 
              🚽✨
            </p>
          </div>
        </motion.section>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: <Bot className="w-12 h-12" />,
              title: "NO RIZZ REQUIRED",
              description: "Chat without the cringe signup forms and verification emails fr fr",
              gradient: "from-purple-100 to-pink-100 dark:from-purple-900/10 dark:to-pink-900/10"
            },
            {
              icon: <Sparkles className="w-12 h-12" />,
              title: "REAL BUSSIN FEATURES",
              description: "Voice, images, and text - it's giving multimodal excellence 💅",
              gradient: "from-blue-100 to-cyan-100 dark:from-blue-900/10 dark:to-cyan-900/10"
            },
            {
              icon: <Zap className="w-12 h-12" />,
              title: "NO CAP SPEED",
              description: "Faster than your rizz getting rejected. SHEEEESH! ⚡",
              gradient: "from-green-100 to-emerald-100 dark:from-green-900/10 dark:to-emerald-900/10"
            }
          ].map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className={`bg-gradient-to-br ${card.gradient}`}>
                <CardContent className="p-6 text-center">
                  <motion.div 
                    className="mx-auto mb-4"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {card.icon}
                  </motion.div>
                  <h3 className="font-bold mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Meme Section */}
        <motion.section 
          className="text-center bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-4">Why Though? 🤔</h2>
          <div className="space-y-4 text-lg">
            <p>
              ChatGPT be like: &quot;Sorry, you&apos;ve reached your limit&quot; 🤓
              <br />
              Me: &quot;NAAAAHHHH FR FR?&quot; 
            </p>
            <p>
              OpenAI: &quot;Please sign up for Plus&quot; 🤑
              <br />
              Me: &quot;Skibidi toilet camera man says NO&quot; 🚽📸
            </p>
            <p className="font-bold text-xl">
              So I made this absolutely bussin app that just works
              <br />
              NO SIGNUP NO CAP FR FR ON GOD
            </p>
          </div>
        </motion.section>

        {/* Creator Section */}
        <motion.section 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold mb-4">The Creator</h2>
          <p className="text-lg mb-4">
            Built by Burhanuddin Khatri - CS Student & ML Enthusiast
            <br />
            <span className="text-muted-foreground">
              git push --force and move on! 💭
            </span>
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="https://github.com/BurhanCantCode" target="_blank">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="https://www.linkedin.com/in/burhanuddin-khatri-aa44a8247" target="_blank">
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </Link>
            </Button>
          </div>
        </motion.section>

        {/* Bottom Text */}
        <section className="text-center">
          <p className="text-sm text-muted-foreground">
            Built with 💀 by someone who got tired of ChatGPT&apos;s tomfoolery
            <br />
            Powered by GYATT technology and skibidi toilet energy
          </p>
        </section>
      </motion.div>
    </div>
  );
} 