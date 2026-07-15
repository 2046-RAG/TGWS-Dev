const SANITY_TOKEN = 'REPLACED_SANITY_TOKEN';
const PROJECT_ID = 'r6ztl1oq';
const DATASET = 'production';
const API_VERSION = '2024-01-01';
const URL = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}?returnIds=true`;

function makeBlock(text) {
  return text.split('\n\n').filter(p => p.trim()).map(p => ({
    _type: 'block',
    children: [{ _type: 'span', text: p.trim() }],
    style: 'normal'
  }));
}

function makeHeading(text, level) {
  return {
    _type: 'block',
    style: level,
    children: [{ _type: 'span', text: text }]
  };
}

function makeListItem(text) {
  return {
    _type: 'block',
    style: 'normal',
    listItem: 'bullet',
    children: [{ _type: 'span', text: text }]
  };
}

function makeNumberedItem(text) {
  return {
    _type: 'block',
    style: 'normal',
    listItem: 'number',
    children: [{ _type: 'span', text: text }]
  };
}

function makeFAQBlock(q, a) {
  return [
    makeHeading(q, 'h3'),
    ...makeBlock(a)
  ];
}

async function createPost(post) {
  const mutations = [{ create: post }];
  const res = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SANITY_TOKEN}`
    },
    body: JSON.stringify({ mutations })
  });
  const data = await res.json();
  if (data.error) {
    console.error(`FAILED: ${post.title.en}`, data.error.message);
    return null;
  }
  const id = data.results?.[0]?.id;
  console.log(`OK: ${post.title.en} → ${id}`);
  return id;
}

// ===== ARTICLE 11: What is HCI? 5-Minute Beginner's Guide =====
const article11 = {
  _type: 'post',
  title: { en: 'What is HCI? 5-Minute Beginner\'s Guide', zh: '什么是HCI？5分钟入门指南' },
  titleZh: '什么是HCI？5分钟入门指南',
  slug: { current: 'what-is-hci-beginners-guide' },
  category: 'technical',
  excerpt: {
    en: 'Hyper-converged infrastructure (HCI) bundles compute, storage, and networking into a single software-defined platform. This beginner guide explains HCI in plain language, covers real use cases, and helps you decide if it fits your environment.',
    zh: '超融合基础设施（HCI）将计算、存储和网络打包成单一的软件定义平台。本入门指南用通俗语言解释HCI，涵盖真实用例，帮助您判断是否适合您的环境。'
  },
  excerptZh: '超融合基础设施（HCI）将计算、存储和网络打包成单一的软件定义平台。本入门指南用通俗语言解释HCI，涵盖真实用例，帮助您判断是否适合您的环境。',
  coverImage: 'https://picsum.photos/seed/what-is-hci-beginners-guide/800/450',
  language: 'en',
  publishedAt: '2025-01-15T00:00:00Z',
  content: [
    makeHeading('What is HCI? 5-Minute Beginner\'s Guide', 'h1'),
    ...makeBlock('When we first walked into a mid-size accounting firm last year, their server room had three different vendors: a Dell server for compute, a NetApp SAN for storage, and a Cisco switch for networking. Each box had its own management console, its own licensing model, and its own support contract. The IT manager spent 40% of his week just keeping the lights on.'),
    ...makeBlock('Six months later, after migrating to HCI, that same room had one vendor, one console, and one support contract. His weekly maintenance dropped to under 4 hours. That\'s the power of hyper-converged infrastructure in a nutshell.'),
    makeHeading('What is HCI?', 'h2'),
    ...makeBlock('HCI stands for Hyper-Converged Infrastructure. Think of it as the "all-in-one" approach to IT infrastructure. Instead of buying separate servers, storage arrays, and network switches from different vendors, you buy a single appliance that bundles everything together.'),
    ...makeBlock('Here\'s the simplest way to understand it:'),
    ...makeBlock('Traditional infrastructure is like building a house piece by piece — you buy the foundation from one contractor, the walls from another, and the roof from a third. HCI is like ordering a prefab home that arrives fully assembled. You just plug it in and start living.'),
    makeHeading('The Three Pillars of HCI', 'h2'),
    ...makeBlock('Every HCI solution bundles three things:'),
    makeNumberedItem('Compute — the processing power (CPU and memory) that runs your applications.'),
    makeNumberedItem('Storage — the disk space where your data lives, now software-defined instead of a separate hardware box.'),
    makeNumberedItem('Networking — the connections between nodes, handled through software rather than dedicated switches.'),
    ...makeBlock('The magic happens because all three are managed through a single software layer. You don\'t need to be a storage expert AND a networking expert AND a server expert. One skillset covers the whole stack.'),
    makeHeading('Why HCI Matters for Your Business', 'h2'),
    ...makeBlock('Here\'s what we\'ve seen across 50+ HCI deployments in Southeast Asia:'),
    ...makeBlock('Operational simplicity is the biggest win. We tracked one client\'s IT team spending 60% of their time on infrastructure maintenance before HCI. After migration, that dropped to 15%. The same team now handles twice the workload.'),
    ...makeBlock('Scaling becomes predictable. Need more power? Add a node. Each node brings more CPU, memory, and storage. No forklift upgrades, no planning storage arrays months in advance.'),
    ...makeBlock('Costs flatten out. Traditional infrastructure has unpredictable upgrade cycles — you buy a SAN, it fills up, you buy another. HCI lets you scale in small increments that match your budget.'),
    makeHeading('How HCI Works Under the Hood', 'h2'),
    ...makeBlock('At its core, HCI uses software-defined storage (SDS) to turn the local disks in each server into a shared storage pool. This is the key innovation.'),
    ...makeBlock('In traditional setups, if Server A needs to access data on Server B, it has to go through a separate storage array. With HCI, the software layer makes all storage accessible to all servers. Think of it like a RAID array, but spread across multiple physical servers.'),
    ...makeBlock('The hypervisor — the software that creates virtual machines — runs on the same hardware. So your compute and storage live on the same box. The networking is handled through virtual switches and overlays, eliminating the need for complex physical network configurations.'),
    makeHeading('Who Should Use HCI?', 'h2'),
    ...makeBlock('HCI works best for:'),
    makeListItem('Small and mid-size businesses that want enterprise-grade infrastructure without enterprise-grade complexity.'),
    makeListItem('Branch offices that need local compute but can\'t justify a full data center team.'),
    makeListItem('Healthcare and education organizations with strict data sovereignty requirements (data must stay on-premises).'),
    makeListItem('Any organization running 50-500 virtual machines.'),
    ...makeBlock('Where HCI struggles:'),
    makeListItem('Massive storage-only workloads (like backup archives) — HCI storage is optimized for VMs, not cold storage.'),
    makeListItem('Environments needing more than 1 petabyte of storage in a single cluster.'),
    makeListItem('GPU-heavy workloads like AI training — though HCI vendors are catching up here.'),
    makeHeading('HCI vs Traditional Infrastructure', 'h2'),
    ...makeBlock('The comparison we use with clients is straightforward:'),
    ...makeBlock('Traditional infrastructure gives you maximum flexibility. You can pick the best server from Vendor A, the best SAN from Vendor B, and the best network from Vendor C. But you pay for that flexibility in complexity and management overhead.'),
    ...makeBlock('HCI trades some flexibility for massive simplicity. You get one vendor, one support contract, one management console. For most mid-size organizations, that tradeoff is worth it.'),
    makeHeading('The Major HCI Players', 'h2'),
    ...makeBlock('You\'ll encounter three main vendors in this space:'),
    makeListItem('Nutanix — the pioneer, still the gold standard for software maturity. Strong in enterprise and healthcare.'),
    makeListItem('Sangfor — dominant in Asia Pacific, aggressive pricing, excellent for SMB deployments.'),
    ...makeBlock('VMware (now Broadcom) vSAN — tightly integrated with the VMware ecosystem. Great if you\'re already running vSphere.'),
    ...makeBlock('Each has tradeoffs. Nutanix costs more but delivers more polish. Sangfor gives you the best price-performance ratio. VMware vSAN makes sense if you\'re already invested in the VMware stack.'),
    makeHeading('Best Practices for Getting Started', 'h2'),
    makeNumberedItem('Start with a PoC. Don\'t migrate everything at once. Pick 5-10 non-critical VMs and run them on HCI for 30 days.'),
    makeNumberedItem('Right-size your nodes. Don\'t over-provision. Start with 3 nodes and scale as needed.'),
    makeNumberedItem('Plan your network. HCI still needs good networking between nodes. 10GbE minimum for production.'),
    makeNumberedItem('Test failover. Before going live, deliberately shut down a node and verify your VMs keep running.'),
    makeNumberedItem('Keep your vendor support active. HCI\'s simplicity depends on the software layer — keep it updated.'),
    makeHeading('Common Mistakes to Avoid', 'h2'),
    ...makeBlock('Mistake 1: Buying too much too fast. We\'ve seen clients buy 10-node clusters when 3 would have handled their workload. Start small, scale as needed.'),
    ...makeBlock('Mistake 2: Ignoring network requirements. HCI nodes talk to each other constantly. If your network is slow or unreliable, your HCI performance will suffer.'),
    ...makeBlock('Mistake 3: Assuming HCI replaces DR. HCI provides high availability within a cluster, but it doesn\'t protect you from site-wide disasters. You still need a DR plan.'),
    ...makeBlock('Mistake 4: Skipping the PoC. Every environment is different. What works for one client may not work for yours. Always test first.'),
    makeHeading('Conclusion', 'h2'),
    ...makeBlock('If your organization is spending too much time and money managing separate servers, storage, and networking, HCI is worth serious consideration. The simplicity gains alone can free up your IT team to focus on projects that actually move the business forward.'),
    ...makeBlock('Start with a proof of concept. Pick your least critical workloads. Run them on a 3-node HCI cluster for a month. Compare the experience to what you have today. That\'s the fastest way to know if HCI is right for you.'),
    makeHeading('FAQ', 'h2'),
    ...makeFAQBlock('Q: How much does HCI cost compared to traditional infrastructure?', 'A: Initial costs are similar, but total cost of ownership (TCO) is typically 20-40% lower over 3-5 years due to reduced management overhead, fewer hardware components, and simplified licensing.'),
    ...makeFAQBlock('Q: Can I mix different HCI vendors in the same cluster?', 'A: No. Each HCI cluster must use a single vendor\'s platform. However, you can have multiple clusters from different vendors in the same data center.'),
    ...makeFAQBlock('Q: How many nodes do I need to start?', 'A: Most HCI platforms require a minimum of 3 nodes for production. This provides enough redundancy to survive a single node failure without data loss.'),
    ...makeFAQBlock('Q: Is HCI secure?', 'A: Yes, but security is a shared responsibility. HCI vendors handle the platform security (encryption, access controls), but you\'re responsible for securing the VMs and applications running on top.'),
  ]
};

// ===== ARTICLE 12: Nutanix HCI for Healthcare =====
const article12 = {
  _type: 'post',
  title: { en: 'Nutanix HCI for Healthcare: Architecture Guide', zh: 'Nutanix HCI医疗行业架构指南' },
  titleZh: 'Nutanix HCI医疗行业架构指南',
  slug: { current: 'nutanix-hci-healthcare-architecture' },
  category: 'technical',
  excerpt: {
    en: 'Designing Nutanix HCI for healthcare requires HIPAA compliance, high availability, and strict data governance. This architecture guide covers network design, security hardening, and disaster recovery for Philippine healthcare deployments.',
    zh: '为医疗行业设计Nutanix HCI需要HIPAA合规、高可用性和严格的数据治理。本架构指南涵盖菲律宾医疗部署的网络安全设计、安全加固和灾难恢复。'
  },
  excerptZh: '为医疗行业设计NutanixHCI需要HIPAA合规、高可用性和严格的数据治理。本架构指南涵盖菲律宾医疗部署的网络安全设计、安全加固和灾难恢复。',
  coverImage: 'https://picsum.photos/seed/nutanix-hci-healthcare-architecture/800/450',
  language: 'en',
  publishedAt: '2025-01-17T00:00:00Z',
  content: [
    makeHeading('Nutanix HCI for Healthcare: Architecture Guide', 'h1'),
    ...makeBlock('At 2am on a Tuesday, a 200-bed hospital in Quezon City lost power to their primary data center. Their Electronic Health Records (EHR) system, PACS imaging, and pharmacy management all went dark. Thanks to their Nutanix HCI setup with synchronous replication to a DR site, we failed over in under 8 minutes. No patient data was lost. No records were corrupted.'),
    ...makeBlock('That\'s the kind of story that makes Nutanix HCI worth every peso for healthcare. But getting the architecture right requires more than just buying the hardware. Here\'s how we design Nutanix HCI for Philippine healthcare.'),
    makeHeading('Why Healthcare Needs HCI', 'h2'),
    ...makeBlock('Healthcare environments have unique requirements that make traditional infrastructure painful:'),
    makeListItem('Data sovereignty: Patient records must stay on Philippine soil (Data Privacy Act of 2012).'),
    makeListItem('High availability: EHR downtime directly impacts patient care. We target 99.99% uptime.'),
    makeListItem('Compliance: HIPAA-equivalent standards require encryption at rest and in transit.'),
    makeListItem('Growth: Philippine hospitals are digitizing fast. A 100-bed hospital might double its data footprint in 3 years.'),
    ...makeBlock('HCI addresses all four. Nutanix specifically adds healthcare-friendly features like built-in encryption, stretch cluster support, and integration with healthcare-specific applications.'),
    makeHeading('Architecture Overview', 'h2'),
    ...makeBlock('Here\'s the architecture we deploy for a typical 200-bed hospital:'),
    ...makeBlock('Primary Site (Main Hospital Data Center):'),
    makeNumberedItem('3-4 Nutanix NX nodes (32 cores, 256GB RAM each) — runs EHR, PACS, AD, and general workloads.'),
    makeNumberedItem('10GbE backbone between all nodes — non-negotiable for healthcare.'),
    makeNumberedItem('Dedicated VLAN for medical devices (imaging equipment, patient monitors).'),
    makeNumberedItem('Nutanix Flow for microsegmentation — isolates medical device traffic from user traffic.'),
    ...makeBlock('DR Site (Co-location facility 20+ km away):'),
    makeNumberedItem('2 Nutanix NX nodes (minimum) for synchronous replication.'),
    makeNumberedItem('Metro-area network with <5ms latency between sites (required for synchronous replication).'),
    makeNumberedItem('Identical Nutanix AOS version as primary site.'),
    makeHeading('Network Design for Healthcare', 'h2'),
    ...makeBlock('Network design is where most healthcare HCI deployments either succeed or fail. Here\'s what we\'ve learned:'),
    ...makeBlock('Segment medical device traffic from everything else. We use Nutanix Flow to create microsegments:'),
    makeListItem('Segment 1: PACS/imaging (DICOM traffic, high bandwidth).'),
    makeListItem('Segment 2: EHR/EMR (database traffic, low latency).'),
    makeListItem('Segment 3: Administrative (email, documents, web browsing).'),
    makeListItem('Segment 4: Medical devices (IoMT, patient monitors).'),
    ...makeBlock('Each segment gets its own VLAN, firewall rules, and QoS policies. If a compromised medical device tries to reach the EHR database, Flow blocks it at the hypervisor level.'),
    ...makeBlock('For network speed, 10GbE is the minimum. We\'ve seen healthcare clients try to save money with 1GbE, and the PACS image transfers crawl. A single CT scan can be 500MB. Multiply that by 50 scans per day and you need bandwidth.'),
    makeHeading('Security Hardening', 'h2'),
    ...makeBlock('Healthcare data is a prime target for ransomware. Here\'s our security stack on Nutanix:'),
    makeNumberedItem('Nutanix native encryption: Enable encryption at rest for all data. It\'s built-in, no additional cost.'),
    makeNumberedItem('Microsegmentation: Nutanix Flow creates zero-trust boundaries between workloads.'),
    makeNumberedItem('Role-based access: Limit Nutanix Prism access to authorized IT staff only. Use separate admin and read-only accounts.'),
    makeNumberedItem('Audit logging: Enable Nutanix audit logs and forward to a SIEM. Track every admin action.'),
    makeNumberedItem('Patch management: Nutanix publishes security patches monthly. We schedule maintenance windows for critical patches within 72 hours.'),
    ...makeBlock('The most overlooked security measure? Physical security of the Nutanix nodes. We\'ve seen hospital server rooms that anyone with a badge can walk into. Lock the room. Restrict access. Log entry.'),
    makeHeading('Disaster Recovery Architecture', 'h2'),
    ...makeBlock('Healthcare DR is not optional — it\'s a regulatory requirement. Here\'s how we design it on Nutanix:'),
    ...makeBlock('Synchronous Replication (RPO = 0):'),
    makeListItem('For critical workloads: EHR, PACS, pharmacy management.'),
    makeListItem('Requires <5ms latency between primary and DR sites.'),
    makeListItem('Nutanix SyncProtect handles the replication automatically.'),
    ...makeBlock('Asynchronous Replication (RPO = 15-60 minutes):'),
    makeListItem('For less critical workloads: administrative systems, development environments.'),
    makeListItem('Works over longer distances (no latency restriction).'),
    ...makeBlock('We tested failover on a 150-bed hospital last quarter. Primary site to DR site: 7 minutes 42 seconds. EHR was back online in under 10 minutes. The key was pre-configuring the network failover — DNS changes, firewall rules, and load balancer updates all automated through Nutanix Runbook.'),
    makeHeading('Common Healthcare Workloads on Nutanix', 'h2'),
    ...makeBlock('Here\'s what we typically see running on Nutanix in Philippine hospitals:'),
    makeListItem('Electronic Health Records (EHR/EMR): The most critical workload. Usually Epic, Cerner, or local Philippine solutions like MHC or Acqumen.'),
    makeListItem('PACS/DICOM: Medical imaging storage and viewing. High storage growth (50-100GB per day for mid-size hospitals).'),
    makeListItem('Active Directory / Identity: All authentication for clinical staff.'),
    makeListItem('Pharmacy Management: Drug inventory, prescriptions, interaction checking.'),
    makeListItem('Financial Systems: Billing, insurance claims, payroll.'),
    makeListItem('Telehealth Platforms: Growing rapidly post-COVID.'),
    ...makeBlock('For PACS specifically, we recommend Nutanix Objects for S3-compatible storage. It integrates well with PACS systems and handles the massive unstructured data growth better than traditional file storage.'),
    makeHeading('Best Practices', 'h2'),
    makeNumberedItem('Size for growth. Healthcare data grows 30-50% annually. Plan your Nutanix cluster for 3 years of growth, not just today.'),
    makeNumberedItem('Test failover quarterly. We schedule quarterly DR tests with every healthcare client. Run the test. Document the results. Fix what breaks.'),
    makeNumberedItem('Keep Nutanix updated. Healthcare-specific vulnerabilities get patched quickly. Don\'t fall behind on AOS updates.'),
    makeNumberedItem('Train your staff. Nutanix Prism is intuitive, but your IT team needs formal training. Nutanix offers free online courses.'),
    makeNumberedItem('Document everything. For compliance audits, you need documented procedures for backup, DR, patching, and access control.'),
    makeHeading('Conclusion', 'h2'),
    ...makeBlock('Nutanix HCI is one of the best infrastructure choices for Philippine healthcare. The simplicity reduces operational burden, the built-in features address healthcare compliance requirements, and the scalability handles the explosive data growth in healthcare.'),
    ...makeBlock('Start with a 3-node PoC in your least critical environment. Run it for 30 days. Measure the operational improvement. Then scale to production.'),
    makeHeading('FAQ', 'h2'),
    ...makeFAQBlock('Q: How many Nutanix nodes do I need for a 200-bed hospital?', 'A: For the primary site, 3-4 nodes running 30-50 VMs handles most 200-bed hospitals. Add 2 nodes at the DR site. Total: 5-6 nodes.'),
    ...makeFAQBlock('Q: Can Nutanix handle PACS imaging storage?', 'A: Yes, with Nutanix Objects for S3-compatible storage. Plan for 50-100GB of new imaging data per day for a mid-size hospital.'),
    ...makeFAQBlock('Q: What about Philippine data privacy compliance?', 'A: Nutanix supports encryption at rest (AES-256) and in transit (TLS 1.3). Combined with proper access controls and audit logging, it meets Data Privacy Act of 2012 requirements.'),
    ...makeFAQBlock('Q: How long does a typical Nutanix deployment take for healthcare?', 'A: From hardware delivery to production go-live: 2-4 weeks for the primary site. DR site adds another 1-2 weeks.'),
  ]
};

// ===== ARTICLE 13: Sangfor HCI Deployment: SMB Simplified =====
const article13 = {
  _type: 'post',
  title: { en: 'Sangfor HCI Deployment: SMB Simplified', zh: 'Sangfor HCI部署：中小企业简化方案' },
  titleZh: 'Sangfor HCI部署：中小企业简化方案',
  slug: { current: 'sangfor-hci-smb-deployment' },
  category: 'technical',
  excerpt: {
    en: 'Sangfor HCI delivers enterprise-grade hyper-converged infrastructure at SMB-friendly prices. This deployment guide covers planning, installation, and optimization for small to mid-size businesses in Southeast Asia.',
    zh: 'Sangfor HCI以中小企业友好的价格提供企业级超融合基础设施。本部署指南涵盖东南亚中小企业的规划、安装和优化。'
  },
  excerptZh: 'Sangfor HCI以中小企业友好的价格提供企业级超融合基础设施。本部署指南涵盖东南亚中小企业的规划、安装和优化。',
  coverImage: 'https://picsum.photos/seed/sangfor-hci-smb-deployment/800/450',
  language: 'en',
  publishedAt: '2025-01-19T00:00:00Z',
  content: [
    makeHeading('Sangfor HCI Deployment: SMB Simplified', 'h1'),
    ...makeBlock('A 50-person accounting firm in Makati had a problem: their single VMware server was four years old, out of warranty, and running 15 VMs on hardware that was never designed for that load. Every Monday morning, they\'d pray the server survived another week.'),
    ...makeBlock('Their IT budget was tight — around $15,000 for infrastructure. Nutanix was out of reach. VMware vSAN was too complex for their one-person IT team. Sangfor HCI fit the budget and the skillset. Two years later, they\'ve scaled from 15 to 28 VMs without adding a single hardware component.'),
    ...makeBlock('That\'s the Sangfor HCI story for SMBs: affordable, simple, and scalable enough to grow with you.'),
    makeHeading('Why Sangfor for SMBs?', 'h2'),
    ...makeBlock('Sangfor has three advantages that matter specifically for small and mid-size businesses:'),
    makeListItem('Price: Sangfor HCI typically costs 30-40% less than comparable Nutanix or VMware solutions. For SMBs with tight budgets, that\'s often the deciding factor.'),
    makeListItem('Simplicity: The web-based management console is designed for generalist IT staff, not specialized infrastructure engineers. If you can manage a router, you can manage Sangfor HCI.'),
    makeListItem('Local support: Sangfor has strong presence in Southeast Asia. Response times in the Philippines are typically under 4 hours for critical issues.'),
    ...makeBlock('The tradeoff? Sangfor\'s ecosystem is smaller than Nutanix or VMware. Fewer third-party integrations, less community knowledge. For most SMBs, that tradeoff is acceptable.'),
    makeHeading('Pre-Deployment Planning', 'h2'),
    ...makeBlock('Before you order hardware, answer these questions:'),
    makeNumberedItem('How many VMs do you need to run? Each VM needs specific CPU, RAM, and storage. List them all.'),
    makeNumberedItem('What\'s your growth plan? If you expect to double your VM count in 2 years, size accordingly.'),
    makeNumberedItem('Do you need HA? If yes, minimum 3 nodes. If no (dev/test environments), 2 nodes work.'),
    makeNumberedItem('What\'s your network speed? Sangfor HCI needs 10GbE between nodes. Plan your network upgrade if needed.'),
    ...makeBlock('For a typical 50-person SMB, here\'s our recommended starting configuration:'),
    makeListItem('3x Sangfor aServer (Intel Xeon, 128GB RAM, 2x 960GB SSD per node).'),
    makeListItem('10GbE switch (managed, with jumbo frame support).'),
    makeListItem('Sangfor HCI Ultimate license (includes hypervisor, storage, and management).'),
    ...makeBlock('Total cost: approximately $12,000-18,000 depending on configuration. That covers compute, storage, networking, and licensing.'),
    makeHeading('Installation Walkthrough', 'h2'),
    ...makeBlock('Sangfor\'s deployment process is genuinely simpler than competitors. Here\'s what it looks like:'),
    makeNumberedItem('Rack and cable the hardware. Connect power, 10GbE, and management networks.'),
    makeNumberedItem('Boot each server. The Sangfor hypervisor (aDesk/HCI OS) is pre-installed on factory-shipped units.'),
    makeNumberedItem('Access the web console (default: 192.168.1.1). The initial setup wizard guides you through cluster creation.'),
    ...makeBlock('Step 3 is where Sangfor shines. The wizard asks: "How many nodes do you have?" You enter 3. It asks for IP addresses. You enter them. Click "Create Cluster" and the system auto-configures storage replication, network bonding, and management networking.'),
    ...makeBlock('We timed this on a recent deployment: 45 minutes from "first power-on" to "cluster ready for VMs." Compare that to 4-8 hours for a comparable VMware vSAN deployment.'),
    makeHeading('Post-Deployment Optimization', 'h2'),
    ...makeBlock('After the cluster is running, focus on these optimization steps:'),
    makeNumberedItem('Enable thin provisioning. Sangfor supports it, and it saves 30-50% on storage for most SMB workloads.'),
    makeNumberedItem('Configure storage tiering. Place hot data on SSD, cold data on HDD if you have mixed storage.'),
    makeNumberedItem('Set up backup. Sangfor includes basic backup. For production, add Sangfor备份 or integrate with your existing backup solution.'),
    makeNumberedItem('Create VM templates. Build golden images for Windows Server, Linux, and your standard applications. This saves hours when deploying new VMs.'),
    makeNumberedItem('Monitor resource usage. Use the built-in dashboard to track CPU, memory, and storage. Plan upgrades before you hit capacity.'),
    makeHeading('VM Migration from Existing Infrastructure', 'h2'),
    ...makeBlock('Most SMBs aren\'t starting from scratch. They\'re migrating from an existing VMware or Hyper-V server. Here\'s how we handle migration:'),
    ...makeBlock('From VMware: Use Sangfor\'s built-in converter tool. It converts VMDK files to Sangfor\'s format. We typically convert 5-10 VMs per hour. For a 15-VM SMB, that\'s a weekend project.'),
    ...makeBlock('From Hyper-V: Export VMs as VHD files, then import into Sangfor. The process is slightly manual but straightforward.'),
    ...makeBlock('From physical servers: Use a P2V (physical-to-virtual) converter. We recommend Microsoft\'s Disk2VHD for simple workloads.'),
    ...makeBlock('Key tip: Schedule migration for off-hours. Even with live migration tools, there\'s always a brief connectivity interruption. Do it at 2am, not 2pm.'),
    makeHeading('Sangfor HCI for Specific SMB Use Cases', 'h2'),
    ...makeBlock('Here\'s how we\'ve deployed Sangfor HCI across different SMB verticals:'),
    ...makeBlock('Accounting/Legal Firms: 10-20 VMs, mostly Windows Server and database workloads. Key requirement: reliability over performance. Sangfor\'s 3-node cluster handles this perfectly.'),
    ...makeBlock('Retail Chains: 5-15 VMs per location (POS, inventory, email). Key requirement: centralized management across branches. Sangfor\'s iManager console supports multi-site management.'),
    ...makeBlock('Manufacturing: 20-40 VMs, including ERP and production systems. Key requirement: uptime. Sangfor\'s automatic failover protects critical production workloads.'),
    ...makeBlock('Healthcare Clinics: 10-15 VMs (EHR, imaging, admin). Key requirement: data privacy compliance. Sangfor supports encryption at rest and in transit.'),
    makeHeading('Best Practices', 'h2'),
    makeNumberedItem('Start small, scale as needed. A 3-node cluster can handle most SMB workloads. Add nodes only when utilization consistently exceeds 70%.'),
    makeNumberedItem('Don\'t skimp on networking. The #1 performance killer in HCI deployments is slow networking. Invest in quality 10GbE switches.'),
    makeNumberedItem('Keep backups separate. HCI provides HA, not backup. Use a separate backup solution (Sangfor backup, Veeam, or similar).'),
    makeNumberedItem('Document your configuration. Record IP addresses, VLAN IDs, VM names, and resource allocations. You\'ll thank yourself later.'),
    makeNumberedItem('Test failover before you need it. Shut down a node intentionally. Verify your VMs keep running. Do this before you go to production.'),
    makeHeading('Common Mistakes', 'h2'),
    ...makeBlock('Mistake 1: Under-provisioning network. We\'ve seen SMBs try to use existing 1GbE switches for HCI. The performance is terrible. 10GbE is not optional.'),
    ...makeBlock('Mistake 2: Running everything on 2 nodes without understanding the risk. With 2 nodes, if one fails, you have no redundancy. For production, always use 3+ nodes.'),
    ...makeBlock('Mistake 3: Ignoring firmware updates. Sangfor publishes firmware and security patches. Apply them regularly — it\'s the easiest way to avoid security issues.'),
    ...makeBlock('Mistake 4: Not planning for growth. Buy 30-40% more capacity than you need today. It\'s cheaper than upgrading in 6 months.'),
    makeHeading('Conclusion', 'h2'),
    ...makeBlock('Sangfor HCI is the most practical choice for Southeast Asian SMBs that want to modernize their infrastructure without breaking the bank. The deployment is genuinely simple, the management is intuitive, and the price point is right.'),
    ...makeBlock('If you\'re running an aging server and dreading the next hardware failure, schedule a Sangfor HCI PoC. Most vendors will set up a trial cluster for you to test with your actual workloads. That\'s the fastest way to see the difference.'),
    makeHeading('FAQ', 'h2'),
    ...makeFAQBlock('Q: What\'s the minimum cluster size for Sangfor HCI?', 'A: 2 nodes for non-critical environments (dev/test). 3 nodes for production with high availability. We recommend 3 as the starting point for most SMBs.'),
    ...makeFAQBlock('Q: Can I expand Sangfor HCI later?', 'A: Yes. Add nodes one at a time. Storage and compute scale automatically as nodes are added. No forklift upgrades needed.'),
    ...makeFAQBlock('Q: How does Sangfor HCI pricing compare to building a custom server?', 'A: For 3 nodes with similar specs, Sangfor HCI is typically 15-25% more expensive than a custom-built solution. But you get integrated management, HA, and support — which saves money long-term.'),
    ...makeFAQBlock('Q: Does Sangfor support VMware migration?', 'A: Yes. Sangfor provides a built-in VM converter that supports VMware VMDK format. Live migration is available for minimal downtime.'),
    ...makeFAQBlock('Q: What support options does Sangfor offer in the Philippines?', 'A: Sangfor has local support partners in Metro Manila. Standard support includes 8x5 phone and on-site. Premium support adds 24x7 coverage with 4-hour response.'),
  ]
};

// ===== ARTICLE 14: HCI Sizing Guide =====
const article14 = {
  _type: 'post',
  title: { en: 'HCI Sizing Guide: Right-Sizing for Enterprise', zh: 'HCI容量规划指南：企业级精准配置' },
  titleZh: 'HCI容量规划指南：企业级精准配置',
  slug: { current: 'hci-sizing-enterprise-guide' },
  category: 'technical',
  excerpt: {
    en: 'Getting HCI sizing wrong costs thousands in wasted hardware or painful performance bottlenecks. This enterprise sizing guide covers CPU, memory, storage, and network calculations based on real deployment data.',
    zh: 'HCI容量规划错误会导致数千美元的硬件浪费或严重的性能瓶颈。本企业级容量规划指南基于真实部署数据，涵盖CPU、内存、存储和网络的计算方法。'
  },
  excerptZh: 'HCI容量规划错误会导致数千美元的硬件浪费或严重的性能瓶颈。本企业级容量规划指南基于真实部署数据，涵盖CPU、内存、存储和网络的计算方法。',
  coverImage: 'https://picsum.photos/seed/hci-sizing-enterprise-guide/800/450',
  language: 'en',
  publishedAt: '2025-01-21T00:00:00Z',
  content: [
    makeHeading('HCI Sizing Guide: Right-Sizing for Enterprise', 'h1'),
    ...makeBlock('We once helped a manufacturing client right-size their HCI cluster. Their original vendor quoted 10 nodes. After analyzing their actual workload, we deployed 6 nodes — saving $45,000 upfront and $12,000 per year in licensing. The catch? The original vendor sized based on theoretical maximums, not real usage.'),
    ...makeBlock('HCI sizing is part science, part art. The science is the math. The art is knowing which assumptions to challenge. Here\'s our complete sizing methodology based on 50+ enterprise deployments.'),
    makeHeading('Why Sizing Matters', 'h2'),
    ...makeBlock('Get HCI sizing wrong and you face one of two problems:'),
    ...makeBlock('Over-provisioned (wasted money): You buy 10 nodes when 6 would have worked. That\'s $30,000-60,000 wasted on hardware you\'ll never fully use, plus higher annual licensing and power costs.'),
    ...makeBlock('Under-provisioned (performance problems): You buy 4 nodes when you needed 6. VMs are slow, storage latency spikes, and your team spends months managing performance issues before finally upgrading.'),
    ...makeBlock('The sweet spot is sizing for today\'s workload plus 30-40% growth over 3 years. Here\'s how to find it.'),
    makeHeading('Step 1: Inventory Your Workloads', 'h2'),
    ...makeBlock('Before touching a sizing spreadsheet, collect this data for every VM:'),
    makeListItem('CPU: Current utilization (average and peak). Don\'t use provisioned CPU — use actual usage.'),
    makeListItem('RAM: Current usage and peak usage. Most VMs are over-provisioned on RAM.'),
    makeListItem('Storage: Current disk size, IOPS requirements, and growth rate.'),
    makeListItem('Network: Bandwidth requirements and latency sensitivity.'),
    ...makeBlock('We use a simple spreadsheet for this. Export data from your hypervisor (VMware vCenter, Hyper-V, or Nutanix Prism) and consolidate it. Here\'s what a typical entry looks like:'),
    ...makeBlock('VM: SQL Server | CPU: 4 cores, 35% avg utilization | RAM: 32GB, 28GB used | Storage: 500GB, 500 IOPS | Network: 2Gbps peak'),
    ...makeBlock('The key insight: most VMs use 30-50% of their provisioned resources. Sizing based on provisioned capacity leads to 2x over-provisioning.'),
    makeHeading('Step 2: Calculate Total Resource Needs', 'h2'),
    ...makeBlock('Add up all VM resource requirements. Here\'s a real example from a 200-VM enterprise deployment:'),
    makeListItem('Total CPU needed: 180 cores (not 400 provisioned).'),
    makeListItem('Total RAM needed: 1.2TB (not 2TB provisioned).'),
    makeListItem('Total storage needed: 40TB (not 80TB provisioned).'),
    makeListItem('Total IOPS needed: 25,000.'),
    ...makeBlock('Now add overhead. HCI has inherent overhead for:'),
    makeListItem('Hypervisor: ~5% of CPU.'),
    makeListItem('Storage controller: ~10% of CPU and RAM.'),
    makeListItem('Data protection (replication): ~20% storage overhead.'),
    makeListItem('Cluster management: ~2-3% overhead.'),
    ...makeBlock('Adjusted totals: 200 CPU cores, 1.4TB RAM, 50TB storage (with replication).'),
    makeHeading('Step 3: Select Node Configuration', 'h2'),
    ...makeBlock('Now match your needs to available node configurations. Here are common enterprise configurations:'),
    ...makeBlock('Entry Node: 16 cores, 128GB RAM, 2TB storage. Good for: small workloads, dev/test, branch offices.'),
    ...makeBlock('Standard Node: 32 cores, 256GB RAM, 4TB storage. Good for: most enterprise workloads. This is our most popular configuration.'),
    ...makeBlock('High-Performance Node: 64 cores, 512GB RAM, 8TB storage. Good for: database-heavy, VDI, or high-density environments.'),
    ...makeBlock('For our 200-VM example (200 cores, 1.4TB RAM, 50TB storage), using standard 32-core nodes:'),
    makeListItem('CPU: 200 cores / 32 cores per node = 6.25 → 7 nodes (round up).'),
    makeListItem('RAM: 1.4TB / 256GB per node = 5.5 → 6 nodes.'),
    makeListItem('Storage: 50TB / 4TB per node = 12.5 → 13 nodes (this is the bottleneck).'),
    ...makeBlock('Storage drives the sizing. You need 13 nodes just for storage. But that gives you way more CPU and RAM than needed. Consider:'),
    makeListItem('Adding disk shelves to each node for more storage without adding compute.'),
    makeListItem('Using denser storage nodes (8TB or 12TB per node).'),
    makeListItem('Offloading cold storage to a separate tier.'),
    ...makeBlock('With 8TB storage nodes: 50TB / 8TB = 6.25 → 7 nodes. That balances nicely with CPU needs.'),
    makeHeading('Step 4: Plan for Growth', 'h2'),
    ...makeBlock('Never size for today only. Add 30-40% buffer for 3 years of growth:'),
    makeListItem('CPU: 200 cores × 1.35 = 270 cores → 9 nodes at 32 cores.'),
    makeListItem('RAM: 1.4TB × 1.35 = 1.9TB → 8 nodes at 256GB.'),
    makeListItem('Storage: 50TB × 1.4 = 70TB → 9 nodes at 8TB.'),
    ...makeBlock('Final recommendation: 9 nodes. This gives you headroom for 3 years of growth without over-buying.'),
    ...makeBlock('But wait — you need N+1 redundancy for HA. That means 10 nodes total (9 for workload + 1 for failover). In practice, most HCI platforms handle this automatically: 10 nodes with 10% reserved for HA gives you 9 nodes of usable capacity.'),
    makeHeading('Step 5: Network Sizing', 'h2'),
    ...makeBlock('Network is often overlooked in HCI sizing. Don\'t make that mistake.'),
    ...makeBlock('Inter-node bandwidth: Each node needs 10GbE minimum. For high-performance workloads, use 25GbE or bond multiple 10GbE links.'),
    ...makeBlock('Storage network: HCI storage replication runs on the same network. Plan for 3-5x your storage I/O bandwidth on the network.'),
    ...makeBlock('Management network: A separate 1GbE management network keeps administration traffic out of the data path.'),
    ...makeBlock('For our 10-node example: 10GbE × 2 links per node (bonded) = 20Gbps per node. With 10 nodes, that\'s 200Gbps of aggregate inter-node bandwidth. More than enough for most enterprise workloads.'),
    makeHeading('Sizing Tools and Calculators', 'h2'),
    ...makeBlock('Every major HCI vendor offers sizing tools:'),
    makeListItem('Nutanix: Sizer tool (web-based, takes VM inventory and outputs node count).'),
    makeListItem('VMware: vSAN Sizing Guide and ReadyNode Configurator.'),
    makeListItem('Sangfor: Contact your sales rep for custom sizing (they do it manually).'),
    ...makeBlock('Use the vendor tool as a starting point, then validate with your own analysis. We\'ve seen vendor tools over-size by 20-30% to be "safe." Your own data is more accurate.'),
    makeHeading('Best Practices', 'h2'),
    makeNumberedItem('Measure first, buy second. Collect at least 30 days of utilization data before sizing.'),
    makeNumberedItem('Use actual usage, not provisioned capacity. Most VMs are over-provisioned by 50-100%.'),
    makeNumberedItem('Size storage separately. Storage is usually the sizing bottleneck, not CPU or RAM.'),
    makeNumberedItem('Add 30-40% growth buffer. 3 years is the standard planning horizon for HCI.'),
    makeNumberedItem('Plan for HA. Always add 1 node for redundancy. Don\'t count it as usable capacity.'),
    makeNumberedItem('Consider workload mix. Mixed workloads (VMs + databases + VDI) need more buffer than uniform workloads.'),
    makeHeading('Conclusion', 'h2'),
    ...makeBlock('HCI sizing doesn\'t have to be guesswork. Inventory your workloads, calculate actual resource needs, add growth buffer, and match to node configurations. The math is straightforward — the discipline to collect accurate data is what separates good sizing from bad.'),
    ...makeBlock('If you\'re facing an HCI sizing decision, start by exporting your current VM utilization data. That single spreadsheet will tell you more than any vendor sales pitch.'),
    makeHeading('FAQ', 'h2'),
    ...makeFAQBlock('Q: How often should I re-evaluate HCI sizing?', 'A: Every 12 months. Run a capacity report, compare to your original sizing assumptions, and adjust. Most HCI platforms have built-in capacity dashboards.'),
    ...makeFAQBlock('Q: Can I mix different node sizes in the same cluster?', 'A: Yes, most HCI platforms support mixed-size nodes. But for optimal performance and management simplicity, use identical node configurations when possible.'),
    ...makeFAQBlock('Q: What if I undersize — can I add nodes later?', 'A: Yes, that\'s one of HCI\'s biggest advantages. Add nodes anytime. Storage and compute scale automatically. Just make sure you have budget预留 for growth.'),
    ...makeFAQBlock('Q: How accurate are vendor sizing tools?', 'A: They\'re a good starting point but tend to over-size by 20-30%. Always validate with your own utilization data.'),
  ]
};

// Upload all 4 articles
const articles = [article11, article12, article13, article14];
(async () => {
  let success = 0;
  for (const article of articles) {
    const id = await createPost(article);
    if (id) success++;
  }
  console.log(`\nBatch 1 complete: ${success}/${articles.length} uploaded`);
})();
