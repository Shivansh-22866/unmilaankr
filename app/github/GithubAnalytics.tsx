"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  Search,
  Star,
  GitFork,
  AlertCircle,
  GitPullRequest,
  Tag,
  Users,
  Activity,
  TrendingUp,
  Calendar,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GitHubMetricsViz } from "@/app/components/GithubMetricsViz";
import { RepoHealthScore } from "@/app/components/RepoHealthScore";
import { ParticleSystem } from "@/app/components/ParticleSystem";
import { GestureInterface } from "@/app/components/GestureInterface";
import { generateGitHubInsight } from "@/lib/ai/githubInsights";
import type { GitHubMetrics } from "@/types/agent";

export default function GitHubAnalytics() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<GitHubMetrics | null>(null);
  const [commitActivity, setCommitActivity] = useState<number[]>([]);
  const [issueActivity, setIssueActivity] = useState({
    opened: 0,
    closed: 0,
    comments: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [repoInfo, setRepoInfo] = useState<{
    owner: string;
    repo: string;
  } | null>(null);
  const [insight, setInsight] = useState<{
    summary: string;
    suggestions: string[];
  }>({
    summary: "",
    suggestions: [],
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    // Get the GitHub URL from search parameters
    const urlParam = searchParams.get("url");
    if (urlParam) {
      setRepoUrl(decodeURIComponent(urlParam));
      // Auto-trigger analysis when URL is provided
      handleAnalyzeWithUrl(decodeURIComponent(urlParam));
    }
  }, [searchParams]);

  const handleAnalyzeWithUrl = async (url: string) => {
    if (!url.trim()) {
      setError("Please enter a valid GitHub repository URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/github-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url }),
      });

      const data = await response.json();

      if (data.success) {
        setMetrics(data.metrics);
        setCommitActivity(data.commitActivity || []);
        setIssueActivity(
          data.issueActivity || { opened: 0, closed: 0, comments: 0 }
        );
        setRepoInfo(data.repoInfo);
        const insight = await generateGitHubInsight(data.metrics);
        setInsight(insight);
      } else {
        setError(data.error || "Failed to fetch repository metrics");
      }
    } catch (err) {
      console.error(err);
      setError(
        "Failed to analyze repository. Please check the URL and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    await handleAnalyzeWithUrl(repoUrl);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden dark">
      {/* Particle System Background */}
      <ParticleSystem />

      {/* Dynamic Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,255,255,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.1),transparent_50%)]" />

      {/* Animated Grid */}
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"
        animate={{
          backgroundPosition: ["0px 0px", "50px 50px"],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      <GestureInterface>
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-8">
              <motion.div
                className="relative"
                animate={{
                  rotateY: [0, 360],
                }}
                transition={{
                  duration: 10,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full blur-2xl opacity-50 animate-pulse" />
                <div className="relative p-6 bg-gradient-to-br from-cyan-500 via-purple-600 to-pink-600 rounded-full">
                  <Github className="h-16 w-16 text-white" />
                </div>
              </motion.div>
            </div>

            <motion.h1
              className="text-8xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 font-mono"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              GITHUB.AI
            </motion.h1>

            <motion.p
              className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              Advanced Repository Intelligence • Real-time Metrics Analysis •
              Developer Insights
            </motion.p>
          </motion.div>

          {/* Search Interface */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-12"
          >
            <Card className="bg-black/60 backdrop-blur-md border border-cyan-500/30 shadow-2xl">
              <CardHeader className="border-b border-cyan-500/20">
                <CardTitle className="text-2xl text-white font-mono flex items-center">
                  <Search className="h-6 w-6 mr-3 text-cyan-400" />
                  REPOSITORY ANALYZER
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Enter GitHub repository URL (e.g., https://github.com/owner/repo)"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      className="bg-black/40 border-cyan-500/30 text-white placeholder-gray-400 text-lg py-6 font-mono"
                      onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                    />
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={loading}
                    size="lg"
                    className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white px-8 py-6 rounded-xl font-mono text-lg"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                          }}
                        >
                          <Activity className="h-5 w-5 mr-2" />
                        </motion.div>
                        ANALYZING...
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5 mr-2" />
                        ANALYZE
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <Alert className="border-red-500/50 bg-red-500/10 backdrop-blur-md">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300 font-mono">
                  {error}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Results */}
          <AnimatePresence>
            {metrics && repoInfo && (
              <motion.div
                key={"results"}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="space-y-8"
              >
                {/* Repository Info Header */}
                <Card className="bg-black/60 backdrop-blur-md border border-purple-500/30 shadow-2xl">
                  <CardHeader className="border-b border-purple-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Github className="h-8 w-8 text-purple-400" />
                        <div>
                          <CardTitle className="text-3xl text-white font-mono">
                            {repoInfo.owner}/{repoInfo.repo}
                          </CardTitle>
                          <p className="text-gray-400 text-lg">
                            Repository Analysis Complete
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-green-500/50 text-green-400 bg-green-500/10 px-4 py-2"
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        ACTIVE
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>

                {/* Main Metrics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Health Score */}
                  <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 shadow-2xl">
                    <CardHeader className="border-b border-green-500/20">
                      <CardTitle className="text-xl text-white font-mono flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                        HEALTH SCORE
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <RepoHealthScore metrics={metrics} />
                    </CardContent>
                  </Card>

                  {/* Key Metrics */}
                  <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      {
                        icon: Star,
                        label: "Stars",
                        value: metrics.stars,
                        color: "text-yellow-400",
                        bgColor: "from-yellow-500/20 to-orange-500/20",
                        borderColor: "border-yellow-500/30",
                      },
                      {
                        icon: GitFork,
                        label: "Forks",
                        value: metrics.forks,
                        color: "text-green-400",
                        bgColor: "from-green-500/20 to-emerald-500/20",
                        borderColor: "border-green-500/30",
                      },
                      {
                        icon: AlertCircle,
                        label: "Issues",
                        value: metrics.issues,
                        color: "text-red-400",
                        bgColor: "from-red-500/20 to-pink-500/20",
                        borderColor: "border-red-500/30",
                      },
                      {
                        icon: GitPullRequest,
                        label: "Pull Requests",
                        value: metrics.pullRequests,
                        color: "text-blue-400",
                        bgColor: "from-blue-500/20 to-cyan-500/20",
                        borderColor: "border-blue-500/30",
                      },
                      {
                        icon: Users,
                        label: "Contributors",
                        value: metrics.contributors,
                        color: "text-purple-400",
                        bgColor: "from-purple-500/20 to-pink-500/20",
                        borderColor: "border-purple-500/30",
                      },
                      {
                        icon: Tag,
                        label: "Releases",
                        value: metrics.releases,
                        color: "text-cyan-400",
                        bgColor: "from-cyan-500/20 to-blue-500/20",
                        borderColor: "border-cyan-500/30",
                      },
                      {
                        icon: Code,
                        label: "Commits",
                        value: metrics.commits,
                        color: "text-gray-400",
                        bgColor: "from-gray-500/20 to-slate-500/20",
                        borderColor: "border-gray-500/30",
                      },
                      {
                        icon: Calendar,
                        label: "Velocity",
                        value: Number.parseFloat(metrics.velocity.toFixed(2)),
                        color: "text-orange-400",
                        bgColor: "from-orange-500/20 to-red-500/20",
                        borderColor: "border-orange-500/30",
                        suffix: "/day",
                      },
                    ].map((metric, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.5 }}
                      >
                        <Card
                          className={`bg-black/60 backdrop-blur-md border ${metric.borderColor} shadow-xl`}
                        >
                          <CardContent className="p-6">
                            <div
                              className={`p-3 rounded-lg bg-gradient-to-br ${metric.bgColor} mb-4`}
                            >
                              <metric.icon
                                className={`h-6 w-6 ${metric.color}`}
                              />
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-400 uppercase tracking-wider">
                                {metric.label}
                              </p>
                              <div className="flex items-baseline space-x-1">
                                <span
                                  className={`text-2xl font-bold ${metric.color} font-mono`}
                                >
                                  {formatNumber(metric.value)}
                                </span>
                                {metric.suffix && (
                                  <span className="text-sm text-gray-400">
                                    {metric.suffix}
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Visualization */}
                <Card className="bg-black/60 backdrop-blur-md border border-cyan-500/30 shadow-2xl">
                  <CardHeader className="border-b border-cyan-500/20">
                    <CardTitle className="text-xl text-white font-mono flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-cyan-400" />
                      REPOSITORY ANALYTICS VISUALIZATION
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-96">
                      <GitHubMetricsViz
                        metrics={metrics}
                        commitActivity={commitActivity}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Card className="bg-black/60 backdrop-blur-md border border-blue-500/30 shadow-2xl">
                    <CardHeader className="border-b border-blue-500/20">
                      <CardTitle className="text-lg text-white font-mono">
                        ISSUE ACTIVITY
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Opened (30d)</span>
                          <span className="text-green-400 font-mono">
                            {issueActivity.opened}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Closed (30d)</span>
                          <span className="text-blue-400 font-mono">
                            {issueActivity.closed}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Comments</span>
                          <span className="text-purple-400 font-mono">
                            {issueActivity.comments}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 shadow-2xl">
                    <CardHeader className="border-b border-green-500/20">
                      <CardTitle className="text-lg text-white font-mono">
                        DEVELOPMENT ACTIVITY
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Daily Velocity</span>
                          <span className="text-cyan-400 font-mono">
                            {metrics.velocity.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Commits</span>
                          <span className="text-green-400 font-mono">
                            {formatNumber(metrics.commits)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">
                            Active Contributors
                          </span>
                          <span className="text-purple-400 font-mono">
                            {metrics.contributors}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/60 backdrop-blur-md border border-purple-500/30 shadow-2xl">
                    <CardHeader className="border-b border-purple-500/20">
                      <CardTitle className="text-lg text-white font-mono">
                        COMMUNITY ENGAGEMENT
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Stars</span>
                          <span className="text-yellow-400 font-mono">
                            {formatNumber(metrics.stars)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Forks</span>
                          <span className="text-green-400 font-mono">
                            {formatNumber(metrics.forks)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Fork Ratio</span>
                          <span className="text-blue-400 font-mono">
                            {metrics.stars > 0
                              ? ((metrics.forks / metrics.stars) * 100).toFixed(
                                  1
                                )
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
{insight && (
  <motion.div
    key="insight-card"
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
  >
    <Card className="bg-black/60 backdrop-blur-md border border-yellow-500/30 shadow-2xl mt-8">
      <CardHeader className="border-b border-yellow-500/20">
        <CardTitle className="text-lg text-white font-mono">💡 AI INSIGHTS</CardTitle>
      </CardHeader>
      <CardContent className="p-6 text-gray-300 font-mono space-y-4 text-sm">
        <div>
          <p className="text-yellow-400 font-semibold">📌 Summary</p>
          <p className="whitespace-pre-line">{insight.summary}</p>
        </div>


        <div>
          <p className="text-yellow-400 font-semibold">📊 Key Signals</p>
          <ul className="list-disc ml-5 space-y-1">
            {insight.suggestions.map((signal, i) => (
              <li key={i}>{signal}</li>
            ))}
          </ul>
        </div>


      </CardContent>
    </Card>
  </motion.div>
)}

          </AnimatePresence>
        </div>
      </GestureInterface>
    </div>
  );
}
