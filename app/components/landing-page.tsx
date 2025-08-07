"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Github,
  Brain,
  Star,
  Globe,
  Eye,
  ChevronLeft,
  ChevronRight,
  Database,
  Zap,
  TrendingUp,
  Users,
  Lock,
  Layers,
  Calendar,
  Code,
  Shield,
  Network,
  Coins,
  Users2,
  Rocket,
  Sparkles,
  Key,
  Wallet,
  Vote,
} from "lucide-react";
import Logo from "@/app/assets/images/logo.png"
import Image from "next/image";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentScreenshot, setCurrentScreenshot] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeRoadmapPhase, setActiveRoadmapPhase] = useState(0);
  const [activeTokenUtility, setActiveTokenUtility] = useState(0);

  // Add particle system state and functions
  const [particles, setParticles] = useState<
    Array<{
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      life: number;
      color: string;
    }>
  >([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    // Initialize particles
    const initialParticles = Array.from({ length: 50 }, () => createParticle());
    setParticles(initialParticles);

    // Start animation
    animationRef.current = requestAnimationFrame(animateParticles);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const createParticle = () => {
    const colors = [
      "rgba(56, 189, 248, 0.6)",
      "rgba(168, 85, 247, 0.6)",
      "rgba(236, 72, 153, 0.6)",
    ];
    return {
      x:
        Math.random() *
        (typeof window !== "undefined" ? window.innerWidth : 1000),
      y:
        Math.random() *
        (typeof window !== "undefined" ? window.innerHeight : 1000),
      size: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      life: Math.random() * 100 + 100,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  };

  const animateParticles = () => {
    if (!canvasRef.current) {
      animationRef.current = requestAnimationFrame(animateParticles);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      animationRef.current = requestAnimationFrame(animateParticles);
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    setParticles((prevParticles) => {
      const updatedParticles = prevParticles.map((particle) => {
        // Update position
        const newX = particle.x + particle.vx;
        const newY = particle.y + particle.vy;

        // Decrease life
        const newLife = particle.life - 1;

        // If particle is dead, create a new one
        if (newLife <= 0) {
          return createParticle();
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(newX, newY, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        // Draw connections between nearby particles
        prevParticles.forEach((otherParticle) => {
          const dx = newX - otherParticle.x;
          const dy = newY - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(newX, newY);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${
              0.1 * (1 - distance / 100)
            })`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });

        return {
          ...particle,
          x: newX,
          y: newY,
          life: newLife,
        };
      });

      return updatedParticles;
    });

    animationRef.current = requestAnimationFrame(animateParticles);
  };

  // Update canvas size on window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 4000);

    // Rotate through roadmap phases
    const roadmapInterval = setInterval(() => {
      setActiveRoadmapPhase((prev) => (prev + 1) % 4);
    }, 5000);

    // Rotate through token utilities
    const tokenInterval = setInterval(() => {
      setActiveTokenUtility((prev) => (prev + 1) % 4);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(roadmapInterval);
      clearInterval(tokenInterval);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const features = [
    {
      icon: <Github className="w-6 h-6" />,
      title: "Code Momentum",
      description: "Track repository velocity and contributor activity",
      gradient: "from-cyan-400 to-blue-500",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Signal Intelligence",
      description: "Multi-modal traction analysis across platforms",
      gradient: "from-purple-400 to-pink-500",
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Insights",
      description: "RAG-powered narrative generation and forecasting",
      gradient: "from-emerald-400 to-teal-500",
    },
  ];

  const stats = [
    {
      label: "Signal Sources",
      value: "4+",
      icon: <Database className="w-5 h-5" />,
    },
    {
      label: "Builder Projects",
      value: "1K+",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Early Signals",
      value: "10K+",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      label: "Accuracy Rate",
      value: "87%",
      icon: <Brain className="w-5 h-5" />,
    },
  ];

  const ecosystems = [
    {
      name: "Solana",
      logo: "◉",
      description: "Primary Deployment Chain",
      gradient: "from-purple-400 to-pink-500",
    },
    {
      name: "Ethereum",
      logo: "◈",
      description: "Smart Contract Analytics",
      gradient: "from-blue-400 to-cyan-500",
    },
    {
      name: "Farcaster",
      logo: "◐",
      description: "Decentralized Social Signals",
      gradient: "from-purple-500 to-blue-400",
    },
    {
      name: "GitHub",
      logo: "⬢",
      description: "Code Activity Tracking",
      gradient: "from-blue-500 to-teal-400",
    },
    {
      name: "Discord",
      logo: "◎",
      description: "Community Intelligence",
      gradient: "from-pink-400 to-purple-500",
    },
    {
      name: "Twitter",
      logo: "▲",
      description: "Social Momentum Analysis",
      gradient: "from-pink-500 to-red-400",
    },
  ];

  const screenshots = [
    {
      title: "Builder Dashboard",
      description: "Comprehensive momentum intelligence for Web3 builders",
      image:
        "/placeholder.svg?height=600&width=1000&text=Builder+Dashboard+Interface",
      features: [
        "Real-time momentum scoring",
        "Multi-modal signal analysis",
        "AI-powered insights",
      ],
    },
    {
      title: "Signal Radar",
      description:
        "Early traction detection across GitHub, social, and onchain",
      image:
        "/placeholder.svg?height=600&width=1000&text=Signal+Radar+Analytics",
      features: [
        "Anomaly detection",
        "Trend forecasting",
        "Cross-platform correlation",
      ],
    },
    {
      title: "Project Intelligence",
      description: "Deep dive into project velocity and community momentum",
      image:
        "/placeholder.svg?height=600&width=1000&text=Project+Intelligence+View",
      features: [
        "Federated scoring",
        "Privacy-preserving analysis",
        "Builder-first insights",
      ],
    },
    {
      title: "Community Pulse",
      description: "Decentralized community engagement and sentiment tracking",
      image:
        "/placeholder.svg?height=600&width=1000&text=Community+Pulse+Monitor",
      features: [
        "Sentiment analysis",
        "Engagement patterns",
        "Growth indicators",
      ],
    },
  ];

  const roadmapPhases = [
    {
      quarter: "Q4 2025",
      title: "Genesis",
      icon: <Rocket className="w-6 h-6" />,
      gradient: "from-cyan-400 to-blue-500",
      milestones: [
        "Rebrand and redeploy as Signiq",
        "Publish whitepaper + token strategy",
        "GitHub, Discord, Twitter, Farcaster integrations",
        "AI-powered Momentum Insights (via Google Gemini Pro)",
        "Virtuals Launch + DAO Onboarding",
      ],
    },
    {
      quarter: "Q1 2026",
      title: "Builderverse",
      icon: <Code className="w-6 h-6" />,
      gradient: "from-purple-400 to-pink-500",
      milestones: [
        "Launch Builder Dashboard with GitHub-linked identity",
        "Dev Spotlight: On-chain contributor leaderboard",
        "Momentum-as-a-Service (MaaS) for partner communities",
        "Beta: Signal Plugins (RAG extensions, z-scorer modules)",
      ],
    },
    {
      quarter: "Q2 2026",
      title: "Proof of Signal",
      icon: <Shield className="w-6 h-6" />,
      gradient: "from-emerald-400 to-teal-500",
      milestones: [
        "Anchor verifiable signal hashes on Solana",
        "TEE-based privacy zones for stealth project mode",
        "Anomaly Challenge Protocol: crowd-dispute prediction",
        "Token-gated Launch Readiness Score for projects",
      ],
    },
    {
      quarter: "Q3 2026",
      title: "RAGNet DAO",
      icon: <Network className="w-6 h-6" />,
      gradient: "from-amber-400 to-orange-500",
      milestones: [
        "Decentralized RAG worker pool with $UMKR rewards",
        "Insight verification leaderboard (Staking-based)",
        "zkProof of Alignment: validate AI summaries",
        "Retroactive airdrop for contributors + liquidity launch",
      ],
    },
  ];

  const tokenUtilities = [
    {
      title: "Access Control",
      description:
        "Access to premium dashboards, early project reports, and builder-specific analytics requires staking a minimum $UMKR threshold.",
      icon: <Key className="w-6 h-6" />,
      gradient: "from-cyan-400 to-blue-500",
    },
    {
      title: "Builder Incentives",
      description:
        "Builders can earn $UMKR by submitting validated GitHub metadata or launching verified on-chain deployments.",
      icon: <Sparkles className="w-6 h-6" />,
      gradient: "from-purple-400 to-pink-500",
    },
    {
      title: "Insight Verification",
      description:
        "AI-generated momentum insights can be validated through staking challenges — rewarding participants for dispute resolution.",
      icon: <Shield className="w-6 h-6" />,
      gradient: "from-emerald-400 to-teal-500",
    },
    {
      title: "Community Curation",
      description:
        "Token-weighted voting is used to promote trending signals or projects on the platform.",
      icon: <Vote className="w-6 h-6" />,
      gradient: "from-amber-400 to-orange-500",
    },
  ];

  const tokenAllocation = [
    { category: "Builder Incentives", percentage: 25, color: "bg-cyan-400" },
    { category: "Liquidity Mining", percentage: 20, color: "bg-purple-400" },
    { category: "Core Team", percentage: 15, color: "bg-pink-400" },
    { category: "Community DAO", percentage: 15, color: "bg-emerald-400" },
    { category: "Investors", percentage: 10, color: "bg-blue-400" },
    { category: "Ecosystem Grants", percentage: 10, color: "bg-teal-400" },
    { category: "Advisors", percentage: 5, color: "bg-amber-400" },
  ];

  const nextScreenshot = () => {
    setCurrentScreenshot((prev) => (prev + 1) % screenshots.length);
  };

  const prevScreenshot = () => {
    setCurrentScreenshot(
      (prev) => (prev - 1 + screenshots.length) % screenshots.length
    );
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden font-mono">
      {/* Dynamic Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-50 pointer-events-none opacity-"
        style={{ width: "100%", height: "100%" }}
      />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ backgroundColor: "black" }}
        width={typeof window !== "undefined" ? window.innerWidth : 1000}
        height={typeof window !== "undefined" ? window.innerHeight : 1000}
      />
      <div className="fixed inset-0 opacity-80">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-purple-900/10 to-pink-900/10" />

        {/* Light trail effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute h-[1px] w-[40%] top-[20%] left-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-light-trail-1"></div>
          <div className="absolute h-[1px] w-[60%] top-[45%] right-0 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent animate-light-trail-2"></div>
          <div className="absolute h-[1px] w-[35%] bottom-[30%] left-[10%] bg-gradient-to-r from-transparent via-pink-400/30 to-transparent animate-light-trail-3"></div>
          <div className="absolute w-[1px] h-[30%] top-[5%] left-[25%] bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-light-trail-vertical-1"></div>
          <div className="absolute w-[1px] h-[45%] top-[20%] right-[35%] bg-gradient-to-b from-transparent via-purple-400/20 to-transparent animate-light-trail-vertical-2"></div>
        </div>

        <div
          className="absolute w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl transition-all duration-1000"
          style={{
            left: mousePosition.x / 10,
            top: mousePosition.y / 10,
          }}
        />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Enhanced grid pattern with perspective shift */}
        <div
          className="absolute inset-0 opacity-10 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            transform: `perspective(1000px) rotateX(${
              mousePosition.y * 0.005
            }deg) rotateY(${mousePosition.x * -0.005}deg)`,
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-8 lg:px-16">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
            <Image src={Logo} alt="Logo" width={32} height={32} />
          </div>
          <span className="text-xl font-light tracking-wider text-cyan-100">
            Signiq
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-12 text-sm font-light">
          <a
            href="#features"
            className="text-gray-400 hover:text-cyan-300 transition-colors tracking-wide"
          >
            FEATURES
          </a>
          <a
            href="#platform"
            className="text-gray-400 hover:text-cyan-300 transition-colors tracking-wide"
          >
            PLATFORM
          </a>
          <a
            href="#roadmap"
            className="text-gray-400 hover:text-cyan-300 transition-colors tracking-wide"
          >
            ROADMAP
          </a>
          <a
            href="#tokenomics"
            className="text-gray-400 hover:text-cyan-300 transition-colors tracking-wide"
          >
            TOKENOMICS
          </a>
          <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-black font-medium px-6 py-2 text-sm tracking-wide">
            LAUNCH BUILDER
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-8 lg:px-16 pt-32 pb-40 overflow-hidden">
        {/* Hero Logo Mask - Only in Hero Section */}

<div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Central Whirlwind Effect */}
          <div className="absolute top-[30%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {/* Multiple rotating rings for whirlwind effect */}
            <div className="relative w-[800px] h-[800px]">
              {/* Outer whirlwind ring */}
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 animate-spin" style={{ animationDuration: '20s' }}>
                <div className="absolute top-0 left-1/2 w-4 h-4 bg-cyan-400/60 rounded-full transform -translate-x-1/2 -translate-y-2 blur-sm"></div>
                <div className="absolute top-1/4 right-0 w-3 h-3 bg-purple-400/50 rounded-full transform translate-x-1 -translate-y-1/2 blur-sm"></div>
                <div className="absolute bottom-1/4 left-0 w-2 h-2 bg-pink-400/40 rounded-full transform -translate-x-1 translate-y-1/2 blur-sm"></div>
              </div>

              {/* Middle whirlwind ring */}
              <div className="absolute inset-20 rounded-full border-2 border-purple-400/25 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
                <div className="absolute top-0 left-1/2 w-3 h-3 bg-purple-400/70 rounded-full transform -translate-x-1/2 -translate-y-1 blur-sm"></div>
                <div className="absolute right-0 top-1/2 w-4 h-4 bg-cyan-400/50 rounded-full transform translate-x-2 -translate-y-1/2 blur-sm"></div>
                <div className="absolute bottom-0 left-1/3 w-2 h-2 bg-pink-400/60 rounded-full transform translate-y-1 blur-sm"></div>
              </div>

              {/* Inner whirlwind ring */}
              <div className="absolute inset-40 rounded-full border border-pink-400/30 animate-spin" style={{ animationDuration: '10s' }}>
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-pink-400/80 rounded-full transform -translate-x-1/2 blur-sm"></div>
                <div className="absolute right-1/4 bottom-0 w-3 h-3 bg-cyan-400/60 rounded-full transform translate-y-1 blur-sm"></div>
              </div>

              {/* Central energy core */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse blur-md opacity-40"></div>
                <div className="absolute inset-2 w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse blur-sm opacity-60" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute inset-4 w-8 h-8 bg-white/20 rounded-full animate-pulse opacity-80" style={{ animationDelay: '1s' }}></div>
              </div>

              {/* Swirling energy trails */}
              <svg className="absolute inset-0 w-full h-full animate-spin pointer-events-none" style={{ animationDuration: '25s' }}>
                <defs>
                  <linearGradient id="trailGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(56, 189, 248, 0)" />
                    <stop offset="50%" stopColor="rgba(56, 189, 248, 0.6)" />
                    <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
                  </linearGradient>
                  <linearGradient id="trailGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(168, 85, 247, 0)" />
                    <stop offset="50%" stopColor="rgba(236, 72, 153, 0.6)" />
                    <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
                  </linearGradient>
                  <filter id="trailGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Spiral energy trails */}
                <path
                  d="M 400 200 Q 600 300, 400 400 Q 200 500, 400 600 Q 600 500, 400 400"
                  fill="none"
                  stroke="url(#trailGradient1)"
                  strokeWidth="3"
                  filter="url(#trailGlow)"
                  opacity="0.7"
                />
                <path
                  d="M 200 400 Q 300 200, 400 400 Q 500 600, 400 400 Q 300 200, 400 400"
                  fill="none"
                  stroke="url(#trailGradient2)"
                  strokeWidth="2"
                  filter="url(#trailGlow)"
                  opacity="0.5"
                />
              </svg>
            </div>
          </div>
          </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div
            className={`transition-all duration-2000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="text-center mb-16">

              <Badge className="mb-8 bg-cyan-500/10 text-cyan-300 border-cyan-500/20 px-6 py-2 text-sm font-light tracking-wider">
                <Layers className="w-4 h-4 mr-2" />
                DECENTRALIZED MOMENTUM INTELLIGENCE
              </Badge>

              <h1 className="text-6xl lg:text-8xl font-extralight mb-12 leading-tight tracking-tight">
                <span className="block text-white mb-4">EARLY SIGNALS FOR</span>
                <span className="block bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  WEB3 BUILDERS
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed font-light tracking-wide">
                Signiq provides federated momentum intelligence across
                GitHub, social media, onchain metrics, and community engagement.
                Spot emerging projects early with AI-powered traction analysis.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-black border-0 px-12 py-4 text-base font-medium tracking-wider rounded-none"
                >
                  START BUILDING
                  <ArrowRight className="w-5 h-5 ml-3" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-900 hover:border-cyan-500 px-12 py-4 text-base rounded-none bg-transparent font-light tracking-wider"
                >
                  <Eye className="w-5 h-5 mr-3" />
                  VIEW DEMO
                </Button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-16 text-gray-500 text-sm font-light tracking-wider">
              <div className="flex items-center space-x-3">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>PRIVACY FIRST</span>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="w-4 h-4 text-purple-400" />
                <span>FEDERATED</span>
              </div>
              <div className="flex items-center space-x-3">
                <Brain className="w-4 h-4 text-pink-400" />
                <span>AI POWERED</span>
              </div>
            </div>

          </div>
        </div>

        {/* Floating Feature Cards */}
        <div className="max-w-6xl mx-auto mt-32 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`bg-gray-950/50 border-gray-800/50 backdrop-blur-sm transition-all duration-700 hover:scale-105 hover:border-cyan-500/30 glow-effect ${
                  activeFeature === index
                    ? "ring-1 ring-cyan-500/30 shadow-2xl shadow-cyan-500/10"
                    : ""
                }`}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  e.currentTarget.style.setProperty("--x", `${x}%`);
                  e.currentTarget.style.setProperty("--y", `${y}%`);
                }}
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-12 h-12 mx-auto mb-6 bg-gradient-to-r ${feature.gradient} rounded-sm flex items-center justify-center`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-light mb-3 tracking-wide text-gray-100">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm font-light leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-8 lg:px-16 py-24 border-t border-gray-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-10 h-10 mx-auto mb-6 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl font-extralight bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent mb-3 tracking-wider">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-xs font-light tracking-widest uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Screenshots */}
      <section id="platform" className="relative z-10 px-8 lg:px-16 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl lg:text-6xl font-extralight mb-8 tracking-tight">
              <span className="text-white">BUILDER</span>
              <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent ml-4">
                INTELLIGENCE
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto font-light tracking-wide">
              Federated momentum analysis with privacy-preserving signal
              processing and AI-powered insights
            </p>
          </div>

          <div className="relative">
            {/* Main Screenshot Display */}
            <div className="relative bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-none p-12 backdrop-blur-sm border border-gray-800/30">
              <div className="flex flex-col lg:flex-row items-center gap-16">
                <div className="lg:w-1/2 space-y-8">
                  <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 text-xs font-light tracking-widest">
                    {screenshots[currentScreenshot].title.toUpperCase()}
                  </Badge>
                  <h3 className="text-3xl font-light text-white tracking-wide">
                    {screenshots[currentScreenshot].title}
                  </h3>
                  <p className="text-lg text-gray-300 leading-relaxed font-light">
                    {screenshots[currentScreenshot].description}
                  </p>
                  <div className="space-y-4">
                    {screenshots[currentScreenshot].features.map(
                      (feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4"
                        >
                          <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                          <span className="text-gray-300 text-sm font-light tracking-wide">
                            {feature}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                  <div className="flex items-center space-x-6 pt-8">
                    <Button
                      onClick={prevScreenshot}
                      variant="outline"
                      size="sm"
                      className="border-gray-700 text-gray-300 hover:bg-gray-900 hover:border-cyan-500 bg-transparent rounded-none w-10 h-10 p-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex space-x-3">
                      {screenshots.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentScreenshot(index)}
                          className={`w-1 h-1 rounded-full transition-all duration-300 ${
                            index === currentScreenshot
                              ? "bg-cyan-400 w-8"
                              : "bg-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <Button
                      onClick={nextScreenshot}
                      variant="outline"
                      size="sm"
                      className="border-gray-700 text-gray-300 hover:bg-gray-900 hover:border-cyan-500 bg-transparent rounded-none w-10 h-10 p-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="lg:w-1/2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-none blur-xl"></div>
                    <img
                      src={
                        screenshots[currentScreenshot].image ||
                        "/placeholder.svg"
                      }
                      alt={screenshots[currentScreenshot].title}
                      className="relative rounded-none shadow-2xl border border-gray-700/50 w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Screenshot Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              {screenshots.map((screenshot, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentScreenshot(index)}
                  className={`relative group transition-all duration-500 ${
                    index === currentScreenshot
                      ? "ring-1 ring-cyan-500/30 scale-105"
                      : "hover:scale-102 opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="relative overflow-hidden rounded-none">
                    <img
                      src={screenshot.image || "/placeholder.svg"}
                      alt={screenshot.title}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <h4 className="text-white text-xs font-light truncate tracking-wide">
                        {screenshot.title}
                      </h4>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Case Study Section */}
      <section className="relative z-10 px-8 lg:px-16 py-32 border-t border-gray-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl lg:text-6xl font-extralight mb-8 tracking-tight">
              <span className="text-white">CASE</span>
              <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent ml-4">
                STUDY
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto font-light tracking-wide">
              See how Signiq analyzes real-world projects with multi-modal
              signal intelligence
            </p>
          </div>

          <div className="relative bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-none p-12 backdrop-blur-sm border border-gray-800/30">
            <div className="flex flex-col lg:flex-row items-start gap-16">
              <div className="lg:w-1/2 space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-500 rounded-sm flex items-center justify-center">
                    <span className="text-black font-bold">F</span>
                  </div>
                  <h3 className="text-3xl font-light tracking-wide">
                    Farcaster
                  </h3>
                </div>

                <p className="text-gray-300 leading-relaxed font-light">
                  A decentralized social protocol with rising developer and user
                  activity. Signiq detected significant momentum across
                  GitHub, Twitter, and onchain metrics.
                </p>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 font-light">
                        GitHub Velocity
                      </span>
                      <span className="text-cyan-400 font-light">+32%</span>
                    </div>
                    <div className="w-full bg-gray-900 rounded-none h-1">
                      <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1 rounded-none w-[32%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 font-light">
                        Twitter Mentions
                      </span>
                      <span className="text-purple-400 font-light">18K</span>
                    </div>
                    <div className="w-full bg-gray-900 rounded-none h-1">
                      <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-1 rounded-none w-[65%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 font-light">
                        Onchain Growth
                      </span>
                      <span className="text-emerald-400 font-light">12x</span>
                    </div>
                    <div className="w-full bg-gray-900 rounded-none h-1">
                      <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-1 rounded-none w-[85%]"></div>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-light text-white">
                      Final Score
                    </span>
                    <span className="text-2xl font-light bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                      87.2/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span className="text-gray-400">Trend: Bullish</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-gray-400">Confidence: 0.88</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2 space-y-8">
                <div className="bg-gray-950/70 border border-gray-800/50 p-6 backdrop-blur-sm">
                  <h4 className="text-lg font-light mb-4 text-cyan-300">
                    AI Narrative
                  </h4>
                  <p className="text-gray-300 font-light leading-relaxed italic">
                    &quot;Farcaster shows breakout momentum across GitHub and onchain
                    signals. While Twitter sentiment remains positive, community
                    discord has slightly fragmented. AI flags early-stage
                    bullish consolidation with moderate long-term volatility
                    risks.&quot;
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-light text-white">
                    Signal Alignment
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-950/50 border border-gray-800/30 p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Github className="w-4 h-4 text-cyan-400" />
                        <span className="text-gray-300 text-sm font-light">
                          GitHub
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                        <span className="text-gray-400 text-xs">
                          32% velocity increase
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-950/50 border border-gray-800/30 p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-300 text-sm font-light">
                          Twitter
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                        <span className="text-gray-400 text-xs">
                          18K mentions, 0.63 sentiment
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-950/50 border border-gray-800/30 p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Coins className="w-4 h-4 text-emerald-400" />
                        <span className="text-gray-300 text-sm font-light">
                          Onchain
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                        <span className="text-gray-400 text-xs">
                          12x txn increase, 300K+ signers
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-950/50 border border-gray-800/30 p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Users className="w-4 h-4 text-pink-400" />
                        <span className="text-gray-300 text-sm font-light">
                          Community
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-pink-400 rounded-full"></div>
                        <span className="text-gray-400 text-xs">
                          Slight fragmentation detected
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section
        id="roadmap"
        className="relative z-10 px-8 lg:px-16 py-32 border-t border-gray-800/30"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl lg:text-6xl font-extralight mb-8 tracking-tight">
              <span className="text-white">DEVELOPMENT</span>
              <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent ml-4">
                ROADMAP
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto font-light tracking-wide">
              Our strategic path to building the decentralized momentum
              intelligence platform
            </p>
          </div>

          {/* Desktop Timeline */}
          <div className="hidden lg:block relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-[1px] bg-gradient-to-b from-cyan-500/30 via-purple-500/30 to-pink-500/30"></div>

            {/* Timeline Nodes */}
            {roadmapPhases.map((phase, index) => (
              <div key={index} className="relative mb-32 last:mb-0">
                {/* Timeline Node */}
                <div
                  className={`absolute left-1/2 top-12 transform -translate-x-1/2 w-6 h-6 rounded-full border-2 transition-all duration-500 ${
                    activeRoadmapPhase === index
                      ? "border-cyan-400 scale-125 shadow-lg shadow-cyan-500/20"
                      : "border-gray-600"
                  }`}
                >
                  <div
                    className={`absolute inset-1 rounded-full transition-all duration-500 ${
                      activeRoadmapPhase === index
                        ? "bg-gradient-to-r from-cyan-400 to-purple-400"
                        : "bg-gray-800"
                    }`}
                  ></div>
                </div>

                {/* Content */}
                <div
                  className={`flex ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  {/* Quarter */}
                  <div
                    className={`w-1/2 ${
                      index % 2 === 0 ? "pr-16 text-right" : "pl-16"
                    }`}
                  >
                    <div className="mb-2">
                      <Badge
                        className={`
                          ${
                            activeRoadmapPhase === index
                              ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                              : "bg-gray-800/50 text-gray-400 border-gray-700"
                          } 
                          px-4 py-1 text-xs font-light tracking-widest transition-all duration-500
                        `}
                      >
                        <Calendar className="w-3 h-3 mr-2" />
                        {phase.quarter}
                      </Badge>
                    </div>
                    <h3
                      className={`text-2xl font-light mb-3 tracking-wide transition-all duration-500 ${
                        activeRoadmapPhase === index
                          ? "text-white"
                          : "text-gray-500"
                      }`}
                    >
                      {phase.title}
                    </h3>
                  </div>

                  {/* Milestones */}
                  <div
                    className={`w-1/2 ${
                      index % 2 === 0 ? "pl-16" : "pr-16 text-right"
                    }`}
                  >
                    <div
                      className={`
                        w-12 h-12 mb-6 rounded-sm flex items-center justify-center transition-all duration-500
                        ${index % 2 === 0 ? "ml-0" : "ml-auto"}
                        ${
                          activeRoadmapPhase === index
                            ? `bg-gradient-to-r ${phase.gradient}`
                            : "bg-gray-800"
                        }
                      `}
                    >
                      {phase.icon}
                    </div>
                    <ul className="space-y-3">
                      {phase.milestones.map((milestone, i) => (
                        <li
                          key={i}
                          className={`flex items-start space-x-3 transition-all duration-500 ${
                            index % 2 === 1
                              ? "flex-row-reverse space-x-reverse"
                              : ""
                          }`}
                        >
                          <div
                            className={`w-1 h-1 mt-2 rounded-full transition-all duration-500 ${
                              activeRoadmapPhase === index
                                ? "bg-cyan-400"
                                : "bg-gray-600"
                            }`}
                          ></div>
                          <span
                            className={`text-sm font-light tracking-wide transition-all duration-500 ${
                              activeRoadmapPhase === index
                                ? "text-gray-300"
                                : "text-gray-500"
                            }`}
                          >
                            {milestone}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Timeline */}
          <div className="lg:hidden space-y-16">
            {roadmapPhases.map((phase, index) => (
              <div
                key={index}
                className={`relative border-l-2 pl-8 transition-all duration-500 ${
                  activeRoadmapPhase === index
                    ? "border-cyan-400"
                    : "border-gray-700"
                }`}
              >
                {/* Timeline Node */}
                <div
                  className={`absolute left-0 top-0 transform -translate-x-1/2 w-4 h-4 rounded-full transition-all duration-500 ${
                    activeRoadmapPhase === index
                      ? "bg-gradient-to-r from-cyan-400 to-purple-400"
                      : "bg-gray-700"
                  }`}
                ></div>

                <div className="mb-2">
                  <Badge
                    className={`
                      ${
                        activeRoadmapPhase === index
                          ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                          : "bg-gray-800/50 text-gray-400 border-gray-700"
                      } 
                      px-4 py-1 text-xs font-light tracking-widest transition-all duration-500
                    `}
                  >
                    <Calendar className="w-3 h-3 mr-2" />
                    {phase.quarter}
                  </Badge>
                </div>

                <h3
                  className={`text-2xl font-light mb-4 tracking-wide transition-all duration-500 ${
                    activeRoadmapPhase === index
                      ? "text-white"
                      : "text-gray-500"
                  }`}
                >
                  {phase.title}
                </h3>

                <div
                  className={`
                    w-12 h-12 mb-6 rounded-sm flex items-center justify-center transition-all duration-500
                    ${
                      activeRoadmapPhase === index
                        ? `bg-gradient-to-r ${phase.gradient}`
                        : "bg-gray-800"
                    }
                  `}
                >
                  {phase.icon}
                </div>

                <ul className="space-y-3">
                  {phase.milestones.map((milestone, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <div
                        className={`w-1 h-1 mt-2 rounded-full transition-all duration-500 ${
                          activeRoadmapPhase === index
                            ? "bg-cyan-400"
                            : "bg-gray-600"
                        }`}
                      ></div>
                      <span
                        className={`text-sm font-light tracking-wide transition-all duration-500 ${
                          activeRoadmapPhase === index
                            ? "text-gray-300"
                            : "text-gray-500"
                        }`}
                      >
                        {milestone}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Timeline Navigation */}
          <div className="flex justify-center mt-16 space-x-3">
            {roadmapPhases.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveRoadmapPhase(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === activeRoadmapPhase
                    ? "bg-cyan-400 w-8"
                    : "bg-gray-600 hover:bg-gray-500"
                }`}
                aria-label={`View ${roadmapPhases[index].quarter} roadmap`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Tokenomics Section */}
      <section
        id="tokenomics"
        className="relative z-10 px-8 lg:px-16 py-32 border-t border-gray-800/30"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl lg:text-6xl font-extralight mb-8 tracking-tight">
              <span className="text-white">$UMKR</span>
              <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent ml-4">
                TOKENOMICS
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto font-light tracking-wide">
              The native token powering incentives, governance, and access in
              the Signiq ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
            {/* Token Utility */}
            <div className="space-y-8">
              <h3 className="text-3xl font-light text-white tracking-wide mb-8">
                Token Utility
              </h3>

              <div className="relative">
                {tokenUtilities.map((utility, index) => (
                  <div
                    key={index}
                    className={`
                      absolute inset-0 bg-gray-950/50 border border-gray-800/50 backdrop-blur-sm p-8 transition-all duration-500
                      ${
                        activeTokenUtility === index
                          ? "opacity-100 z-10"
                          : "opacity-0 z-0"
                      }
                    `}
                  >
                    <div className="flex items-start space-x-6">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${utility.gradient} rounded-sm flex items-center justify-center flex-shrink-0`}
                      >
                        {utility.icon}
                      </div>
                      <div>
                        <h4 className="text-xl font-light text-white mb-4">
                          {utility.title}
                        </h4>
                        <p className="text-gray-400 font-light leading-relaxed">
                          {utility.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Placeholder to maintain height */}
                <div className="bg-transparent border border-transparent p-8 opacity-0 pointer-events-none">
                  <div className="flex items-start space-x-6">
                    <div className="w-12 h-12 rounded-sm flex-shrink-0"></div>
                    <div>
                      <h4 className="text-xl font-light mb-4">Placeholder</h4>
                      <p className="text-gray-400 font-light leading-relaxed">
                        This is a placeholder to maintain the height of the
                        container. This text is approximately the same length as
                        the longest utility description to ensure consistent
                        height.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Utility Navigation */}
              <div className="flex space-x-3">
                {tokenUtilities.map((utility, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTokenUtility(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === activeTokenUtility
                        ? "bg-cyan-400 w-8"
                        : "bg-gray-600 hover:bg-gray-500"
                    }`}
                    aria-label={`View ${utility.title} utility`}
                  />
                ))}
              </div>

              {/* Vesting Schedule */}
              <div className="bg-gray-950/50 border border-gray-800/50 backdrop-blur-sm p-8 mt-8">
                <h4 className="text-xl font-light text-white mb-6">
                  Vesting Schedule
                </h4>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Users2 className="w-4 h-4 text-cyan-400" />
                        <span className="text-gray-300 font-light">
                          Team/Advisors
                        </span>
                      </div>
                      <span className="text-gray-400 font-light">
                        12-month cliff, 3-year linear vest
                      </span>
                    </div>
                    <div className="w-full bg-gray-900 rounded-none h-1">
                      <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1 rounded-none w-[25%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Wallet className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-300 font-light">
                          Investors
                        </span>
                      </div>
                      <span className="text-gray-400 font-light">
                        6-month cliff, 2-year linear vest
                      </span>
                    </div>
                    <div className="w-full bg-gray-900 rounded-none h-1">
                      <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-1 rounded-none w-[50%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Vote className="w-4 h-4 text-emerald-400" />
                        <span className="text-gray-300 font-light">
                          Builder DAO
                        </span>
                      </div>
                      <span className="text-gray-400 font-light">
                        Participation & voting thresholds
                      </span>
                    </div>
                    <div className="w-full bg-gray-900 rounded-none h-1">
                      <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-1 rounded-none w-[75%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Token Allocation */}
            <div className="space-y-8">
              <h3 className="text-3xl font-light text-white tracking-wide mb-8">
                Token Allocation
              </h3>

              <div className="bg-gray-950/50 border border-gray-800/50 backdrop-blur-sm p-8">
                {/* Allocation Chart */}
                <div className="relative w-full aspect-square mb-8">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <defs>
                      <filter
                        id="glow"
                        x="-20%"
                        y="-20%"
                        width="140%"
                        height="140%"
                      >
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite
                          in="SourceGraphic"
                          in2="blur"
                          operator="over"
                        />
                      </filter>
                    </defs>

                    {/* Pie Chart Segments */}
                    {
                      tokenAllocation.reduce(
                        (
                          acc: {
                            paths: React.ReactNode[];
                            totalPercentage: number;
                          } = {
                            paths: [],
                            totalPercentage: 0,
                          },
                          segment,
                          i
                        ) => {
                          const startAngle = (acc.totalPercentage / 100) * 360;
                          const endAngle =
                            ((acc.totalPercentage + segment.percentage) / 100) *
                            360;

                          // Convert angles to radians and calculate points
                          const startRad = ((startAngle - 90) * Math.PI) / 180;
                          const endRad = ((endAngle - 90) * Math.PI) / 180;

                          const x1 = 50 + 40 * Math.cos(startRad);
                          const y1 = 50 + 40 * Math.sin(startRad);
                          const x2 = 50 + 40 * Math.cos(endRad);
                          const y2 = 50 + 40 * Math.sin(endRad);

                          // Determine if the arc should be drawn as a large arc
                          const largeArcFlag = segment.percentage > 50 ? 1 : 0;

                          // Create the SVG path for the segment
                          const path = `
                        M 50 50
                        L ${x1} ${y1}
                        A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}
                        Z
                      `;

                          acc.paths.push(
                            <path
                              key={i}
                              d={path}
                              className={`${segment.color} hover:opacity-90 transition-opacity cursor-pointer`}
                              filter="url(#glow)"
                            />
                          ) as React.ReactNode;

                          return {
                            paths: acc.paths,
                            totalPercentage:
                              acc.totalPercentage + segment.percentage,
                          };
                        },
                        { paths: [], totalPercentage: 0 }
                      ).paths
                    }

                    {/* Center Circle */}
                    <circle cx="50" cy="50" r="25" className="fill-gray-950" />
                    <text
                      x="50"
                      y="50"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-white text-3xl font-light"
                    >
                      $UMKR
                    </text>
                  </svg>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tokenAllocation.map((segment, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className={`w-4 h-4 ${segment.color}`}></div>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-gray-300 font-light text-sm">
                          {segment.category}
                        </span>
                        <span className="text-gray-400 font-light text-sm">
                          {segment.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Incentive Model */}
              <div className="bg-gray-950/50 border border-gray-800/50 backdrop-blur-sm p-8">
                <h4 className="text-xl font-light text-white mb-6">
                  Incentive Equilibrium Model
                </h4>
                <div className="space-y-4">
                  <p className="text-gray-400 font-light leading-relaxed">
                    The $UMKR token is designed to create a balanced ecosystem
                    where builders, validators, and signal contributors are
                    incentivized to participate in the network.
                  </p>

                  <div className="bg-gray-900/50 border border-gray-800/50 p-4 font-mono text-sm text-gray-300">
                    <div className="mb-2">
                      U<sub>i</sub>(t) = α<sub>i</sub> · A(t) + β<sub>i</sub> ·
                      R(t) - γ<sub>i</sub> · S(t)
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>
                        U<sub>i</sub>(t) = net utility of agent i at time t
                      </div>
                      <div>A(t) = analytics access value</div>
                      <div>R(t) = reward from contribution</div>
                      <div>S(t) = staking cost or risk</div>
                      <div>
                        α<sub>i</sub>, β<sub>i</sub>, γ<sub>i</sub> = agent
                        preference weights
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-400 font-light leading-relaxed">
                    A Nash equilibrium is reached when dU<sub>i</sub>/dt = 0,
                    implying stable staking and signal flow over time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Deployment Strategy */}
          <div className="bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-none p-12 backdrop-blur-sm border border-gray-800/30">
            <div className="flex flex-col lg:flex-row items-start gap-16">
              <div className="lg:w-1/2 space-y-8">
                <h3 className="text-3xl font-light text-white tracking-wide">
                  Deployment Strategy
                </h3>
                <p className="text-gray-300 leading-relaxed font-light">
                  Signiq targets a multi-stage deployment with progressive
                  decentralization, launching first on the Solana ecosystem due
                  to its high throughput, low fees, and strong on-chain activity
                  signals.
                </p>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-light text-cyan-300 mb-4">
                      Why Solana?
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-3">
                        <div className="w-1 h-1 mt-2 bg-cyan-400 rounded-full"></div>
                        <span className="text-gray-300 text-sm font-light">
                          Fast, low-latency block finality (400ms)
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-1 h-1 mt-2 bg-cyan-400 rounded-full"></div>
                        <span className="text-gray-300 text-sm font-light">
                          Rich project activity on-chain — ideal for momentum
                          signal ingestion
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-1 h-1 mt-2 bg-cyan-400 rounded-full"></div>
                        <span className="text-gray-300 text-sm font-light">
                          Active builder community (Hackathons, xNFTs, Realms)
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xl font-light text-purple-300 mb-4">
                      Modular Architecture on Solana
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-3">
                        <div className="w-1 h-1 mt-2 bg-purple-400 rounded-full"></div>
                        <span className="text-gray-300 text-sm font-light">
                          Core Protocol: Program to anchor on-chain momentum
                          proofs (commitments)
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-1 h-1 mt-2 bg-purple-400 rounded-full"></div>
                        <span className="text-gray-300 text-sm font-light">
                          Oracle Relays: Fetch GitHub/Twitter/Discord
                          data→hash→write to Solana for transparency
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-1 h-1 mt-2 bg-purple-400 rounded-full"></div>
                        <span className="text-gray-300 text-sm font-light">
                          AI Service Layer: Off-chain RAG insight layer
                          triggered via cron txns
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-1 h-1 mt-2 bg-purple-400 rounded-full"></div>
                        <span className="text-gray-300 text-sm font-light">
                          Token Access Guard: Anchor-based token-gated access to
                          dashboards features
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2 space-y-8">
                <h3 className="text-3xl font-light text-white tracking-wide">
                  Future-Proofing
                </h3>

                <div>
                  <h4 className="text-xl font-light text-emerald-300 mb-4">
                    zk-Sync & ZK Future Proofing
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <div className="w-1 h-1 mt-2 bg-emerald-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm font-light">
                        ZK-Proof of Signal Alignment
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-1 h-1 mt-2 bg-emerald-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm font-light">
                        ZK-anonymity for builders requesting private forecasts
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-light text-pink-300 mb-4">
                    Privacy Compliance (Regulatory Readiness)
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <div className="w-1 h-1 mt-2 bg-pink-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm font-light">
                        No user PII stored
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-1 h-1 mt-2 bg-pink-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm font-light">
                        Federated inference possible (via edge LLM)
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-1 h-1 mt-2 bg-pink-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm font-light">
                        TEE containers under roadmap
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-1 h-1 mt-2 bg-pink-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm font-light">
                        ZK-RAG Verification in research phase
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-950/70 border border-gray-800/50 p-6 backdrop-blur-sm">
                  <h4 className="text-lg font-light mb-4 text-cyan-300">
                    Investor Note
                  </h4>
                  <p className="text-gray-300 font-light leading-relaxed">
                    Signiq is positioned at the intersection of AI, Web3,
                    and developer tooling—three rapidly growing markets. Our
                    federated architecture and multi-modal signal approach
                    creates a defensible moat with network effects that
                    strengthen as more builders join the ecosystem.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Partners */}
      <section
        id="ecosystem"
        className="relative z-10 px-8 lg:px-16 py-32 border-t border-gray-800/30"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl lg:text-6xl font-extralight mb-8 tracking-tight">
              <span className="text-white">SIGNAL</span>
              <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent ml-4">
                ECOSYSTEM
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto font-light tracking-wide">
              Multi-modal intelligence across the most important Web3 platforms
              and protocols
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {ecosystems.map((ecosystem, index) => (
              <div
                key={index}
                className="group relative bg-gray-950/30 border border-gray-800/30 rounded-none p-6 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-500 hover:scale-105"
              >
                <div className="text-center">
                  <div
                    className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-r ${ecosystem.gradient} rounded-none flex items-center justify-center text-xl font-light text-black`}
                  >
                    {ecosystem.logo}
                  </div>
                  <h3 className="text-white font-light mb-2 group-hover:text-cyan-300 transition-colors text-sm tracking-wide">
                    {ecosystem.name}
                  </h3>
                  <p className="text-gray-500 text-xs font-light tracking-wide">
                    {ecosystem.description}
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/2 to-purple-500/2 rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>

          <div className="text-center mt-20">
            <p className="text-gray-500 mb-8 font-light tracking-wide">
              FEDERATED ACROSS 15+ SIGNAL SOURCES
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-600 font-light tracking-widest">
              <span className="px-4 py-2 bg-gray-900/50 rounded-none border border-gray-800/30">
                GITHUB
              </span>
              <span className="px-4 py-2 bg-gray-900/50 rounded-none border border-gray-800/30">
                TWITTER
              </span>
              <span className="px-4 py-2 bg-gray-900/50 rounded-none border border-gray-800/30">
                FARCASTER
              </span>
              <span className="px-4 py-2 bg-gray-900/50 rounded-none border border-gray-800/30">
                DISCORD
              </span>
              <span className="px-4 py-2 bg-gray-900/50 rounded-none border border-gray-800/30">
                TELEGRAM
              </span>
              <span className="px-4 py-2 bg-gray-900/50 rounded-none border border-gray-800/30">
                REDDIT
              </span>
              <span className="px-4 py-2 bg-gray-900/50 rounded-none border border-gray-800/30">
                +9 MORE
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section id="features" className="relative z-10 px-8 lg:px-16 py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl lg:text-6xl font-extralight mb-8 tracking-tight">
              <span className="text-white">FEDERATED</span>
              <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent ml-4">
                INTELLIGENCE
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto font-light tracking-wide">
              Privacy-preserving momentum analysis with RAG-powered insights and
              anomaly detection
            </p>
          </div>

          <div className="space-y-32">
            {/* Code Momentum */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-sm flex items-center justify-center">
                    <Github className="w-5 h-5 text-black" />
                  </div>
                  <h3 className="text-2xl font-light tracking-wide">
                    CODE MOMENTUM
                  </h3>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed font-light">
                  Track repository velocity, contributor activity, and code
                  quality metrics. Federated analysis preserves privacy while
                  providing deep insights into project development momentum.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                    <span className="text-gray-300 font-light tracking-wide">
                      Repository velocity tracking
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300 font-light tracking-wide">
                      Contributor momentum analysis
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                    <span className="text-gray-300 font-light tracking-wide">
                      Early signal detection
                    </span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-none p-8 backdrop-blur-sm border border-gray-800/30">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 font-light tracking-wide">
                        MOMENTUM SCORE
                      </span>
                      <span className="text-cyan-400 font-light">8.7/10</span>
                    </div>
                    <div className="w-full bg-gray-900 rounded-none h-1">
                      <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1 rounded-none w-[87%]"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-light text-cyan-400 mb-1">
                          +32%
                        </div>
                        <div className="text-gray-500 text-xs font-light tracking-widest">
                          VELOCITY
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-light text-blue-400 mb-1">
                          156
                        </div>
                        <div className="text-gray-500 text-xs font-light tracking-widest">
                          BUILDERS
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Signal Intelligence */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="lg:order-2 space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-sm flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-black" />
                  </div>
                  <h3 className="text-2xl font-light tracking-wide">
                    SIGNAL INTELLIGENCE
                  </h3>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed font-light">
                  Multi-modal traction analysis combining social media, onchain
                  metrics, and community engagement. Detect emerging trends
                  before they become obvious to the market.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                    <span className="text-gray-300 font-light tracking-wide">
                      Cross-platform correlation
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-1 h-1 bg-pink-400 rounded-full"></div>
                    <span className="text-gray-300 font-light tracking-wide">
                      Anomaly detection system
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                    <span className="text-gray-300 font-light tracking-wide">
                      Time-series momentum scoring
                    </span>
                  </div>
                </div>
              </div>
              <div className="lg:order-1 relative">
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-none p-8 backdrop-blur-sm border border-gray-800/30">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 font-light tracking-wide">
                        TRACTION SCORE
                      </span>
                      <span className="text-purple-400 font-light">9.1/10</span>
                    </div>
                    <div className="w-full bg-gray-900 rounded-none h-1">
                      <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-1 rounded-none w-[91%]"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-light text-purple-400 mb-1">
                          +18%
                        </div>
                        <div className="text-gray-500 text-xs font-light tracking-widest">
                          SOCIAL
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-light text-pink-400 mb-1">
                          +45%
                        </div>
                        <div className="text-gray-500 text-xs font-light tracking-widest">
                          ONCHAIN
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-sm flex items-center justify-center">
                    <Brain className="w-5 h-5 text-black" />
                  </div>
                  <h3 className="text-2xl font-light tracking-wide">
                    AI INSIGHTS
                  </h3>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed font-light">
                  RAG-powered narrative generation using Gemini Pro and Groq
                  LLaMA3. Transform raw metrics into actionable insights with
                  forecasting and risk assessment capabilities.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                    <span className="text-gray-300 font-light tracking-wide">
                      RAG-based insight generation
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-1 h-1 bg-teal-400 rounded-full"></div>
                    <span className="text-gray-300 font-light tracking-wide">
                      Trend forecasting & risk analysis
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300 font-light tracking-wide">
                      Natural language narratives
                    </span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-none p-8 backdrop-blur-sm border border-gray-800/30">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 font-light tracking-wide">
                        AI CONFIDENCE
                      </span>
                      <span className="text-emerald-400 font-light">87.2%</span>
                    </div>
                    <div className="w-full bg-gray-900 rounded-none h-1">
                      <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-1 rounded-none w-[87%]"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-light text-emerald-400 mb-1">
                          BULLISH
                        </div>
                        <div className="text-gray-500 text-xs font-light tracking-widest">
                          OUTLOOK
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-light text-teal-400 mb-1">
                          LOW
                        </div>
                        <div className="text-gray-500 text-xs font-light tracking-widest">
                          RISK
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-8 lg:px-16 py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Dynamic line decorations */}
          <div className="absolute top-0 left-1/4 w-[1px] h-16 bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"></div>
          <div className="absolute top-0 right-1/4 w-[1px] h-24 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent"></div>
          <div className="absolute bottom-0 left-1/3 w-[1px] h-20 bg-gradient-to-t from-transparent via-pink-500/30 to-transparent"></div>
          <div className="absolute bottom-0 right-1/3 w-[1px] h-12 bg-gradient-to-t from-transparent via-cyan-500/30 to-transparent"></div>

          <div className="bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-none p-16 backdrop-blur-sm border border-gray-800/30 relative overflow-hidden">
            {/* Animated corner accents */}
            <div className="absolute top-0 left-0 w-16 h-[1px] bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
            <div className="absolute top-0 left-0 h-16 w-[1px] bg-gradient-to-b from-cyan-500/50 to-transparent"></div>
            <div className="absolute top-0 right-0 w-16 h-[1px] bg-gradient-to-l from-purple-500/50 to-transparent"></div>
            <div className="absolute top-0 right-0 h-16 w-[1px] bg-gradient-to-b from-purple-500/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-16 h-[1px] bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 h-16 w-[1px] bg-gradient-to-t from-cyan-500/50 to-transparent"></div>
            <div className="absolute bottom-0 right-0 w-16 h-[1px] bg-gradient-to-l from-purple-500/50 to-transparent"></div>
            <div className="absolute bottom-0 right-0 h-16 w-[1px] bg-gradient-to-t from-purple-500/50 to-transparent"></div>

            <h2 className="text-4xl lg:text-6xl font-extralight mb-8 tracking-tight">
              <span className="text-white">JOIN THE</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                BUILDER NETWORK
              </span>
            </h2>
            <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
              Connect your project to the decentralized momentum intelligence
              network. Get early traction signals and AI-powered insights while
              preserving privacy and maintaining control.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-black border-0 px-12 py-4 text-base font-medium tracking-wider rounded-none relative overflow-hidden group"
              >
                {/* Button glow effect */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-300/20 to-purple-300/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500"></span>
                <Zap className="w-5 h-5 mr-3 relative z-10" />
                <span className="relative z-10">LAUNCH BUILDER</span>
                <ArrowRight className="w-5 h-5 ml-3 relative z-10" />
              </Button>
              <div className="flex items-center space-x-3 text-gray-500 text-sm font-light tracking-wide">
                <Star className="w-4 h-4 text-cyan-400" />
                <span>TRUSTED BY 1,000+ WEB3 BUILDERS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/30 px-8 lg:px-16 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-8 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-black" />
              </div>
              <span className="text-lg font-light tracking-wider text-cyan-100">
                Signiq
              </span>
            </div>
            <div className="flex items-center space-x-12 text-gray-500 text-xs font-light tracking-widest">
              <a href="#" className="hover:text-cyan-300 transition-colors">
                WHITEPAPER
              </a>
              <a href="#" className="hover:text-cyan-300 transition-colors">
                PRIVACY
              </a>
              <a href="#" className="hover:text-cyan-300 transition-colors">
                BUILDER API
              </a>
              <a href="#" className="hover:text-cyan-300 transition-colors">
                SUPPORT
              </a>
              <span>© 2025 Signiq PROTOCOL</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
