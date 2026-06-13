export const NEWS_SOURCES = [
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/category/artificial-intelligence/',
    rssUrl: 'https://techcrunch.com/feed/',
    selectors: {
      article: 'article.post-block',
      title: 'h2 a',
      link: 'h2 a',
      summary: '.post-block__content',
      date: 'time'
    },
    category: 'tech-news'
  },
  {
    name: 'VentureBeat',
    url: 'https://venturebeat.com/category/ai/',
    rssUrl: 'https://venturebeat.com/feed/',
    selectors: {
      article: 'article',
      title: 'h2 a',
      link: 'h2 a',
      summary: '.article-content p',
      date: 'time'
    },
    category: 'tech-news'
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/ai-artificial-intelligence',
    rssUrl: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    selectors: {
      article: '.c-entry-box--compact',
      title: 'h2 a',
      link: 'h2 a',
      summary: '.c-entry-box--compact__excerpt',
      date: 'time'
    },
    category: 'tech-news'
  },
  {
    name: 'Wired',
    url: 'https://www.wired.com/tag/artificial-intelligence/',
    rssUrl: 'https://www.wired.com/feed/tag/ai/latest/rss',
    selectors: {
      article: '.summary-item',
      title: '.summary-item__hed a',
      link: '.summary-item__hed a',
      summary: '.summary-item__dek',
      date: 'time'
    },
    category: 'tech-news'
  },
  {
    name: 'MIT Technology Review',
    url: 'https://www.technologyreview.com/topic/artificial-intelligence/',
    rssUrl: 'https://www.technologyreview.com/feed/',
    selectors: {
      article: '.teaserItem',
      title: 'h3 a',
      link: 'h3 a',
      summary: '.teaserItem__excerpt',
      date: 'time'
    },
    category: 'research'
  },
  {
    name: 'Hacker News',
    url: 'https://news.ycombinator.com/',
    rssUrl: 'https://hnrss.org/frontpage',
    selectors: {
      article: '.athing',
      title: '.titleline a',
      link: '.titleline a',
      summary: '',
      date: '.age'
    },
    category: 'community'
  },
  {
    name: 'ArXiv AI',
    url: 'https://arxiv.org/list/cs.AI/recent',
    rssUrl: 'https://rss.arxiv.org/rss/cs.AI',
    selectors: {
      article: '.list-title',
      title: 'a',
      link: 'a',
      summary: '.mathjax',
      date: ''
    },
    category: 'research'
  },
  {
    name: 'ProductHunt',
    url: 'https://www.producthunt.com/topics/artificial-intelligence',
    rssUrl: '',
    selectors: {
      article: '[data-test="post-item"]',
      title: 'h3',
      link: 'a',
      summary: 'p',
      date: ''
    },
    category: 'products'
  }
];

export const AI_KEYWORDS = [
  'AI', 'artificial intelligence', 'machine learning', 'deep learning',
  'LLM', 'GPT', 'neural network', 'NLP', 'computer vision',
  'generative AI', 'transformer', 'diffusion', 'reinforcement learning',
  'AGI', 'OpenAI', 'Anthropic', 'Google DeepMind', 'Meta AI',
  'foundation model', 'fine-tuning', 'prompt engineering', 'RAG',
  'autonomous', 'robotics', 'multimodal', 'embedding'
];
