import { type NextRequest, NextResponse } from "next/server"
import { GitHubDataFetcher, parseGitHubRepo } from "@/lib/data/github"

export async function POST(request: NextRequest) {
  try {
    const { repoUrl } = await request.json()

    if (!repoUrl) {
      return NextResponse.json({ success: false, error: "Repository URL is required" }, { status: 400 })
    }

    // Parse the GitHub repository URL
    const repoInfo = parseGitHubRepo(repoUrl)
    if (!repoInfo) {
      return NextResponse.json({ success: false, error: "Invalid GitHub repository URL" }, { status: 400 })
    }

    // Initialize GitHub data fetcher
    const githubFetcher = new GitHubDataFetcher(process.env.GITHUB_TOKEN)

    // Fetch repository metrics
    const [metrics, commitActivity, issueActivity] = await Promise.all([
      githubFetcher.fetchRepoMetrics(repoInfo.owner, repoInfo.repo),
      githubFetcher.fetchCommitActivity(repoInfo.owner, repoInfo.repo, 30),
      githubFetcher.fetchIssueActivity(repoInfo.owner, repoInfo.repo),
    ])

    return NextResponse.json({
      success: true,
      metrics,
      commitActivity,
      issueActivity,
      repoInfo,
    })
  } catch (error) {
    console.error("Error fetching GitHub metrics:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch repository metrics" }, { status: 500 })
  }
}
