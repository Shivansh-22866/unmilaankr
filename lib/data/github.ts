import { GitHubMetrics } from '@/types/agent';
import axios from 'axios';

interface GitHubRepoData {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  subscribers_count: number;
  created_at: string;
  updated_at: string;
}

interface GitHubCommit {
  commit: {
    author: {
      date: string;
    };
  };
}

interface GitHubContributor {
  login: string;
  contributions: number;
}

interface GitHubRelease {
  tag_name: string;
  published_at: string;
}

export class GitHubDataFetcher {
  private token?: string;
  private baseURL = 'https://api.github.com';

  constructor(token?: string) {
    this.token = token;
  }

  private getHeaders() {
    return {
      'Authorization': this.token ? `token ${this.token}` : undefined,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'momentum-tracker'
    };
  }

async fetchRepoMetrics(owner: string, repo: string): Promise<GitHubMetrics> {
  try {
    const headers = this.getHeaders();

    const repoResponse = await axios.get<GitHubRepoData>(
      `${this.baseURL}/repos/${owner}/${repo}`,
      { headers }
    );
    const repoData = repoResponse.data;

    console.log(repoData)

    const commitsResponse = await axios.get<GitHubCommit[]>(
      `${this.baseURL}/repos/${owner}/${repo}/commits?per_page=100`,
      { headers }
    );

    const contributorsResponse = await axios.get<GitHubContributor[]>(
      `${this.baseURL}/repos/${owner}/${repo}/contributors`,
      { headers }
    );

    const pullsResponse = await axios.get(
      `${this.baseURL}/repos/${owner}/${repo}/pulls?state=all&per_page=100`,
      { headers }
    );

    const releasesResponse = await axios.get<GitHubRelease[]>(
      `${this.baseURL}/repos/${owner}/${repo}/releases`,
      { headers }
    );

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCommits = commitsResponse.data.filter(commit =>
      new Date(commit.commit.author.date) > thirtyDaysAgo
    );

    const velocity = recentCommits.length / 30;

    // ✅ Log all the values that are used in score computation
    console.log(`[GitHub Metrics for ${owner}/${repo}]`);
    console.log('Stars:', repoData.stargazers_count);
    console.log('Forks:', repoData.forks_count);
    console.log('Open Issues:', repoData.open_issues_count);
    console.log('Commits:', commitsResponse.data.length);
    console.log('Recent Commits (30d):', recentCommits.length);
    console.log('Velocity (commits/day):', velocity);
    console.log('Contributors:', contributorsResponse.data.length);
    console.log('PRs:', pullsResponse.data.length);
    console.log('Releases:', releasesResponse.data.length);

    return {
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      commits: commitsResponse.data.length,
      contributors: contributorsResponse.data.length,
      issues: repoData.open_issues_count,
      pullRequests: pullsResponse.data.length,
      releases: releasesResponse.data.length,
      velocity
    };

  } catch (error: any) {
    console.error('❌ Error fetching GitHub data:', error.response?.status || error.message);
    return this.getDefaultMetrics();
  }
}


  async fetchCommitActivity(owner: string, repo: string, days: number = 30): Promise<number[]> {
    try {
      const headers = this.getHeaders();
      const response = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/stats/commit_activity`,
        { headers }
      );
      
      // GitHub returns weekly activity, we need to process it
      const weeklyData = response.data || [];
      return weeklyData.slice(-Math.ceil(days / 7)).map((week: any) => week.total);
    } catch (error) {
      console.error('Error fetching commit activity:', error);
      return new Array(Math.ceil(days / 7)).fill(0);
    }
  }

  async fetchIssueActivity(owner: string, repo: string): Promise<{
    opened: number;
    closed: number;
    comments: number;
  }> {
    try {
      const headers = this.getHeaders();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const [openedResponse, closedResponse] = await Promise.all([
        axios.get(
          `${this.baseURL}/repos/${owner}/${repo}/issues?state=open&since=${thirtyDaysAgo.toISOString()}`,
          { headers }
        ),
        axios.get(
          `${this.baseURL}/repos/${owner}/${repo}/issues?state=closed&since=${thirtyDaysAgo.toISOString()}`,
          { headers }
        )
      ]);
      
      // Count comments in recent issues
      let totalComments = 0;
      for (const issue of [...openedResponse.data, ...closedResponse.data]) {
        totalComments += issue.comments || 0;
      }
      
      return {
        opened: openedResponse.data.length,
        closed: closedResponse.data.length,
        comments: totalComments
      };
    } catch (error) {
      console.error('Error fetching issue activity:', error);
      return { opened: 0, closed: 0, comments: 0 };
    }
  }

  private getDefaultMetrics(): GitHubMetrics {
    return {
      stars: 0,
      forks: 0,
      commits: 0,
      contributors: 0,
      issues: 0,
      pullRequests: 0,
      releases: 0,
      velocity: 0
    };
  }
}

export function parseGitHubRepo(repoUrl: string): { owner: string; repo: string } | null {
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, '')
  };
}