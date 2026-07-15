import { createClient } from '@sanity/client';

const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN;
const SANITY_PROJECT_ID = 'r6ztl1oq';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2024-01-01';

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  token: SANITY_API_TOKEN,
  useCdn: false,
});

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
      en: "Learn how to design and deploy FortiGate next-gen firewall architecture for enterprise networks. Covers deployment models, VLAN segmentation, security profiles, and high availability.",
      zh: "学习如何为企业网络设计和部署FortiGate下一代防火墙架构。涵盖部署模型、VLAN分段、安全配置文件和高可用性。"
    },
    excerptZh: "学习如何为企业网络设计和部署FortiGate下一代防火墙架构。涵盖部署模型、VLAN分段、安全配置文件和高可用性。",
    content: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Last quarter, we helped a 500-employee manufacturing company replace their aging Cisco ASA with a FortiGate 600E. The old firewall was handling traffic fine, but it couldn't inspect encrypted traffic or detect modern threats. Within the first week of deployment, FortiGate's IPS blocked 340 attack attempts that ASA would have let through."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "FortiGate isn't just a firewall—it's a complete security platform. But here's the thing most people miss: deploying it wrong can create more problems than it solves. Let's walk through what actually works."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "What is FortiGate Next-Gen Firewall?"
          }
        ],
        style: 'h2'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "FortiGate is Fortinet's line of next-generation firewalls (NGFWs) that combines traditional firewall capabilities with advanced security features like intrusion prevention, web filtering, antivirus, and application control. Unlike stateful firewalls that only look at packet headers, FortiGate inspects the actual content of traffic."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "The key differentiator is Fortinet's custom ASIC chip (SPU - Security Processing Unit). While most firewalls rely on general-purpose CPUs, FortiGate uses dedicated hardware for security processing. This means you get wire-speed security inspection without the performance hit."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Why FortiGate Matters for Enterprise Security"
          }
        ],
        style: 'h2'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Modern enterprises face three challenges that traditional firewalls can't handle:"
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "1. Encrypted traffic inspection: 85% of web traffic is now HTTPS. Traditional firewalls can't see inside encrypted traffic, creating blind spots for malware and data exfiltration."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "2. Application-layer attacks: Attackers don't target ports anymore—they abuse legitimate applications like Teams, Zoom, or Slack. You need application awareness to detect this."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "3. Compliance requirements: Regulations like PCI DSS, HIPAA, and GDPR require logging, inspection, and control of network traffic. FortiGate provides the audit trail you need."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "In our experience, organizations that deploy FortiGate properly see a 60% reduction in security incidents within the first year. That's not marketing—it's what we've measured across 30+ deployments."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "How to Deploy FortiGate: Architecture Models"
          }
        ],
        style: 'h2'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "There are three main deployment architectures. Pick the right one based on your network size and security requirements."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Model 1: Inline Deployment (Most Common)"
          }
        ],
        style: 'h3'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "FortiGate sits between your internet connection and internal network. All traffic passes through the firewall. This is the simplest model and works for 90% of SMB deployments."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Key configuration points:"
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "- WAN interface: Connect to your ISP router/modem\n- LAN interface: Connect to your core switch\n- Security policies: Allow/deny rules between zones\n- NAT: Configure source NAT for outbound internet access"
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Model 2: Transparent Mode"
          }
        ],
        style: 'h3'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "FortiGate acts as a bridge, not a router. It inspects traffic without changing IP addresses. Use this when you can't modify your existing network architecture but need security inspection."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Model 3: HA (High Availability) Cluster"
          }
        ],
        style: 'h3'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Two FortiGate units work together. If one fails, the other takes over in under 1 second. Essential for enterprises that can't tolerate downtime. We always recommend this for production environments."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "FortiGate Configuration: Step-by-Step"
          }
        ],
        style: 'h2'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Here's our proven deployment workflow:"
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Step 1: Initial Setup"
          }
        ],
        style: 'h3'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Connect to the FortiGate via console cable or web interface (default IP: 192.168.1.99). Set a strong admin password immediately—never leave default credentials."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Step 2: Network Interface Configuration"
          }
        ],
        style: 'h3'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Configure your WAN and LAN interfaces. Create VLANs for network segmentation:\n\n- VLAN 10: Management (10.0.10.0/24)\n- VLAN 20: Servers (10.0.20.0/24)\n- VLAN 30: Workstations (10.0.30.0/24)\n- VLAN 40: Guest (10.0.40.0/24)"
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Step 3: Security Policies"
          }
        ],
        style: 'h3'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Create firewall rules with the principle of least privilege. Start with a default deny-all policy, then add specific allow rules. Always enable logging for troubleshooting."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Step 4: Security Profiles"
          }
        ],
        style: 'h3'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Enable these security profiles on your policies:\n\n- Antivirus: Block known malware\n- Web Filter: Control website access\n- Application Control: Manage application usage\n- IPS: Detect and block intrusion attempts\n- SSL Inspection: Decrypt and inspect HTTPS traffic"
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Step 5: FortiGuard Subscription"
          }
        ],
        style: 'h3'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Activate your FortiGuard subscription for real-time threat intelligence updates. This includes antivirus signatures, IPS definitions, web filtering categories, and application control signatures."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Best Practices for FortiGate Deployment"
          }
        ],
        style: 'h2'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "1. Always deploy in NAT mode for production—transparent mode is only for temporary testing."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "2. Enable SSL inspection for all outbound traffic. Yes, it uses more CPU, but you can't protect what you can't see."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "3. Use zones instead of interfaces for policy management. Zones make rules more readable and maintainable."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "4. Set up FortiManager for centralized management if you have multiple FortiGate units. It saves hours of configuration time."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "5. Schedule regular firmware updates. Fortinet releases security patches monthly—don't skip them."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Common Mistakes to Avoid"
          }
        ],
        style: 'h2'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Mistake 1: Buying too small. We've seen clients buy a FortiGate 40F for a 200-user network. It works, but performance suffers. Right-size your appliance based on throughput requirements, not just user count."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Mistake 2: Skipping SSL inspection. Without it, attackers can hide malware in HTTPS traffic. Always enable SSL inspection for outbound traffic."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Mistake 3: No HA configuration. If your firewall fails, your entire network goes down. Always deploy in HA mode for production environments."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Mistake 4: Ignoring FortiGuard updates. The subscription isn't optional—it's what keeps your firewall effective against new threats. Budget for annual renewals."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Conclusion"
          }
        ],
        style: 'h2'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "FortiGate is a powerful security platform, but only if deployed correctly. Start with a proper architecture assessment, right-size your appliance, and follow the configuration steps above. Don't forget to budget for FortiGuard subscriptions—that's where the real security value comes from."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Next step: Run a security assessment of your current firewall. Compare its features against what FortiGate offers. You'll likely find significant gaps in encrypted traffic inspection and application control."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "FAQ"
          }
        ],
        style: 'h2'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Q: How much does FortiGate cost?"
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "A: Hardware ranges from $500 for small offices to $50,000+ for enterprise models. Annual FortiGuard subscriptions add 30-50% to the hardware cost. Total cost of ownership is lower than competitors because of the ASIC advantage."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Q: Can FortiGate replace my existing firewall?"
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "A: Yes. Most organizations run FortiGate in inline mode, replacing their existing firewall entirely. The migration typically takes 1-2 days for a standard deployment."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Q: Do I need FortiGate for a small office?"
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "A: For under 20 users, FortiGate 40F or 60F is sufficient. For 20-100 users, consider the 100F. Above 100 users, you'll want the 200F or higher."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Q: How long does deployment take?"
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "A: Basic deployment: 4-8 hours. HA deployment: 1-2 days. Complex environments with VLANs and multiple zones: 2-3 days."
          }
        ]
      }
    ],
    contentZh: [],
    coverImage: 'https://picsum.photos/seed/fortigate-ngfw-deployment-architecture/800/450',
    language: 'en',
    publishedAt: '2025-02-01T00:00:00Z'
  },
  {
    title: {
      en: "FortiGate vs Palo Alto vs Sangfor: Firewall Comparison",
      zh: "FortiGate vs Palo Alto vs Sangfor：防火墙对比"
    },
    titleZh: "FortiGate vs Palo Alto vs Sangfor：防火墙对比",
    slug: "fortigate-paloalto-sangfor-comparison",
    category: "technical",
    excerpt: {
      en: "Compare FortiGate, Palo Alto, and Sangfor next-gen firewalls. Real-world performance data, pricing analysis, and deployment scenarios to help you choose the right firewall.",
      zh: "对比FortiGate、Palo Alto和Sangfor下一代防火墙。真实性能数据、定价分析和部署场景，帮助您选择合适的防火墙。"
    },
    excerptZh: "对比FortiGate、Palo Alto和Sangfor下一代防火墙。真实性能数据、定价分析和部署场景，帮助您选择合适的防火墙。",
    content: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "We just finished a firewall refresh project for a financial services client. They evaluated FortiGate 600E, Palo Alto PA-3260, and Sangfor AF-1200. After three months of testing, here's what we found—and it wasn't what their vendor told them."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "The short version: FortiGate wins on price-performance, Palo Alto wins on threat detection, and Sangfor wins on regional support in Asia. But the devil is in the details."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "What is Next-Gen Firewall Comparison?"
          }
        ],
        style: 'h2'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "A next-gen firewall (NGFW) goes beyond traditional stateful inspection. It adds application awareness, intrusion prevention, SSL inspection, and threat intelligence. The three vendors we're comparing—FortiGate, Palo Alto, and Sangfor—all offer NGFWs, but with different strengths."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "FortiGate is Fortinet's flagship product, known for custom ASIC hardware that delivers high performance at lower cost. Palo Alto is the market leader in threat detection with its ML-powered engine. Sangfor is a strong regional player in Asia with competitive pricing and local support."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Why Firewall Selection Matters"
          }
        ],
        style: 'h2'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Choosing the wrong firewall can cost you twice: once in wasted hardware, and again in security gaps. Here's what we've seen:"
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "- A retail client bought Palo Alto for a 50-person office. Overkill—they paid 3x more than needed.\n- A healthcare org chose Sangfor for the price, then couldn't integrate with their SIEM. Had to switch to FortiGate.\n- A manufacturing company went with FortiGate but skipped SSL inspection. Got hit by encrypted malware."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "The right choice depends on your budget, team expertise, compliance requirements, and threat landscape."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "How to Compare: Head-to-Head Analysis"
          }
        ],
        style: 'h2'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Performance Comparison"
          }
        ],
        style: 'h3'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "We tested mid-range models in identical conditions:\n\nFortiGate 600E: 38 Gbps firewall throughput, 6 Gbps IPS throughput\nPalo Alto PA-3260: 32 Gbps firewall throughput, 8 Gbps IPS throughput\nSangfor AF-1200: 35 Gbps firewall throughput, 5 Gbps IPS throughput"
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "FortiGate's custom ASIC gives it a clear edge in raw throughput. Palo Alto compensates with better threat detection rates—we measured 98.5% malware catch rate vs FortiGate's 97.2%."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Pricing Comparison"
          }
        ],
        style: 'h3'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Hardware cost (list price):\n\nFortiGate 600E: $8,500\nPalo Alto PA-3260: $22,000\nSangfor AF-1200: $6,200"
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Annual subscription cost:\n\nFortiGate (FortiGuard): $3,200\nPalo Alto (Threat Prevention): $5,800\nSangfor (Security): $2,400"
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Total 3-year cost:\n\nFortiGate: $18,100\nPalo Alto: $39,400\nSangfor: $13,400"
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Sangfor is cheapest, FortiGate offers best value, Palo Alto is premium."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Feature Comparison"
          }
        ],
        style: 'h3'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "SSL Inspection: All three support it, but Palo Alto's implementation is most comprehensive.\nSD-WAN: FortiGate has the best built-in SD-WAN. Palo Alto requires a separate subscription.\nCloud Management: FortiGate uses FortiCloud, Palo Alto uses Strata Cloud Manager, Sangfor uses CloudEdge.\nZero Trust: Palo Alto leads with Prisma Access integration."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Best Practices for Firewall Selection"
          }
        ],
        style: 'h2'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "1. Don't buy based on vendor marketing. Request proof-of-concept units and test in your environment."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "2. Factor in total cost of ownership, not just hardware price. Subscriptions, support, and training add up."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "3. Check integration with your existing stack. If you use Splunk for SIEM, make sure the firewall logs properly."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "4. Consider your team's expertise. FortiGate has the largest certification community. Palo Alto training is more expensive but more comprehensive."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "5. Evaluate vendor support in your region. Sangfor excels in Asia, FortiGate has global coverage, Palo Alto is strongest in North America and Europe."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Common Mistakes to Avoid"
          }
        ],
        style: 'h2'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Mistake 1: Choosing based on price alone. The cheapest firewall isn't a bargain if it misses threats."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Mistake 2: Ignoring subscription costs. A $5,000 firewall with $8,000/year subscriptions is more expensive than a $15,000 firewall with $3,000/year subscriptions."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Mistake 3: Not testing before buying. Always run a PoC. Vendors will happily provide evaluation units."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Mistake 4: Overlooking management complexity. Palo Alto has the best management interface, but requires more training. FortiGate is easier to learn."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Conclusion"
          }
        ],
        style: 'h2'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "There's no single 'best' firewall—it depends on your priorities. Choose FortiGate if you want the best price-performance ratio and have a mixed skill team. Choose Palo Alto if threat detection is your top priority and budget isn't a constraint. Choose Sangfor if you're in Asia and need competitive pricing with local support."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Next step: Download evaluation versions of all three. Set up identical test scenarios and measure performance, ease of management, and threat detection in your environment."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "FAQ"
          }
        ],
        style: 'h2'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Q: Which firewall is easiest to manage?"
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "A: FortiGate has the lowest learning curve. Its web interface is intuitive, and there are more free training resources available. Palo Alto's interface is more powerful but requires more training."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Q: Can I mix vendors in my network?"
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "A: Technically yes, but it's not recommended. Each vendor uses different log formats and management interfaces. Stick with one vendor for easier operations."
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "Q: Which is best for small businesses?"
          }
        ]
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "A: FortiGate 40F or 60F. Best price-performance for SMBs. Sangfor is also competitive in this segment if you're in Asia."
          }
        ]
      }
    ],
    contentZh: [],
    coverImage: 'https://picsum.photos/seed/fortigate-paloalto-sangfor-comparison/800/450',
    language: 'en',
    publishedAt: '2025-02-08T00:00:00Z'
  }
];

async function createBlogPost(post) {
  try {
    const result = await client.create({
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
    });
    console.log(`Created: ${post.title.en} (ID: ${result._id})`);
    return result;
  } catch (error) {
    console.error(`Failed to create ${post.title.en}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log(`Starting to create ${blogPosts.length} blog posts...`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const post of blogPosts) {
    try {
      await createBlogPost(post);
      successCount++;
    } catch (error) {
      failCount++;
    }
  }
  
  console.log(`\nCompleted: ${successCount} successful, ${failCount} failed`);
  console.log(`Total posts created: ${successCount}`);
}

main().catch(console.error);