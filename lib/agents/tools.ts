import { MomentumData, ProjectConfig, AgentContext } from '@/types/agent';
import { GitHubDataFetcher, parseGitHubRepo } from '@/lib/data/github';
import { TwitterMetricsCalculator, extractTwitterHandle } from '@/lib/data/twitter-scraper';
import { OnchainDataFetcher, isValidEthereumAddress } from '@/lib/data/onchain';

export async function fetchMomentumData(
  project: ProjectConfig,
  _context: AgentContext
): Promise<MomentumData> {
  const timestamp = Date.now();

  const githubFetcher = new GitHubDataFetcher(process.env.GITHUB_TOKEN!);
  const twitterCalculator = new TwitterMetricsCalculator(false); // false = use Puppeteer
  const onchainFetcher = new OnchainDataFetcher(process.env.ETHERSCAN_API_KEY!);

  let github = {
    stars: 0, forks: 0, commits: 0, contributors: 0,
    issues: 0, pullRequests: 0, releases: 0, velocity: 0
  };

  let twitter = {
    mentions: 0, sentiment: 0, engagement: 0,
    followers: 0, retweets: 0, likes: 0, impressions: 0
  };

  let onchain = {
    transactions: 0, uniqueAddresses: 0, volume: 0,
    liquidity: 0, holders: 0, transferCount: 0
  };

  let communityMentions = 0;
  const interactionPatterns = {
    discordMessages: 0,
    telegramMessages: 0,
    redditPosts: 0,
    mediumPosts: 0,
    githubDiscussions: 0
  };

  // GitHub
  if (project.githubRepo) {
    const parsed = parseGitHubRepo(project.githubRepo);
    if (parsed) {
      github = await githubFetcher.fetchRepoMetrics(parsed.owner, parsed.repo);
    }
  }

  // Twitter
  if (project.twitterHandle) {
    const handle = extractTwitterHandle(project.twitterHandle);
    if (handle) {
      twitter = await twitterCalculator.calculateMetrics(handle, 100);
    }
  }

  // Onchain
  if (project.contractAddress && isValidEthereumAddress(project.contractAddress)) {
    onchain = await onchainFetcher.fetchTokenMetrics(project.contractAddress);
  }

  // // Community mentions (basic mock)
  // if (project.discord || project.telegram) {
  //   communityMentions += 20;
  //   interactionPatterns.discordMessages = 15;
  //   interactionPatterns.telegramMessages = 12;
  // }

  // // Discord (dynamically imported only on server)
  let discordMessageCount = 0;

  if (
    typeof window === 'undefined' &&
    project.discord &&
    project.discord.serverId &&
    project.discord.channelId
  ) {
    try {
      const mod = await import('@/lib/data/discord');
      const discordFetcher = new mod.DiscordDataFetcher();

      const discordData = await discordFetcher.fetchMessages(
        project.discord.serverId,
        project.discord.channelId,
        100
      );

      discordMessageCount = discordData.count;
      communityMentions += discordMessageCount;
      interactionPatterns.discordMessages = discordMessageCount;

      console.log('discordData', discordData)

      // Optional: use discordData.messages here if needed
    } catch (err) {
      console.error('Error fetching Discord messages:', err);
    }
  }

  return {
    timestamp,
    github,
    twitter,
    onchain,
    communityMentions,
    interactionPatterns
  };
}
