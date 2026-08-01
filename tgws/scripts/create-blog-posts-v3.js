const SANITY_API_TOKEN = `${process.env.SANITY_API_TOKEN}`;
const SANITY_PROJECT_ID = 'r6ztl1oq';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2024-01-01';

async function createBlogPost(post) {
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/${SANITY_API_VERSION}/data/mutate/${SANITY_DATASET}?returnIds=true`;
  
  const mutation = {
    mutations: [{
      create: {
        _type: 'post',
        title: post.title,
        titleZh: post.titleZh,
        slug: { current: post.slug },
        category: post.category,
        excerpt: post.excerpt,
        excerptZh: post.excerptZh,
        content: post.content,
        contentZh: post.contentZh,
        coverImage: post.coverImage,
        language: post.language,
        publishedAt: post.publishedAt
      }
    }]
  };
  
  console.log('Sending request to:', url);
  console.log('Mutation data:', JSON.stringify(mutation, null, 2));
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SANITY_API_TOKEN}`
    },
    body: JSON.stringify(mutation)
  });
  
  const result = await response.json();
  console.log('API Response:', JSON.stringify(result, null, 2));
  
  if (result.error) {
    throw new Error(result.error.message);
  }
  
  return result;
}

const blogPosts = [
  {
    title: {
      en: "FortiGate Deployment: Next-Gen Firewall Architecture",
      zh: "FortiGate部署：下一代防火墙架构"
    },
    titleZh: "FortiGate部署：下一代防火墙架构",
    slug: "fortigate-ngfw-deployment-architecture",
    category: "technical",
    excerpt: {
      en: "Learn how to design and deploy FortiGate next-gen firewall architecture for enterprise networks.",
      zh: "学习如何为企业网络设计和部署FortiGate下一代防火墙架构。"
    },
    excerptZh: "学习如何为企业网络设计和部署FortiGate下一代防火墙架构。",
    content: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Test content for FortiGate article"
          }
        ]
      }
    ],
    contentZh: [],
    coverImage: 'https://picsum.photos/seed/fortigate-ngfw-deployment-architecture/800/450',
    language: 'en',
    publishedAt: '2025-02-01T00:00:00Z'
  }
];

async function main() {
  console.log(`Starting to create ${blogPosts.length} blog posts...`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const post of blogPosts) {
    try {
      const result = await createBlogPost(post);
      console.log(`Created: ${post.title.en}`);
      successCount++;
    } catch (error) {
      console.error(`Failed to create ${post.title.en}:`, error.message);
      failCount++;
    }
  }
  
  console.log(`\nCompleted: ${successCount} successful, ${failCount} failed`);
  console.log(`Total posts created: ${successCount}`);
}

main().catch(console.error);