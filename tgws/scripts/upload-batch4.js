const SANITY_TOKEN = `${process.env.SANITY_API_TOKEN}`;
const PROJECT_ID = 'r6ztl1oq';
const DATASET = 'production';
const API_VERSION = '2024-01-01';
const URL = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}?returnIds=true`;

function makeBlock(text) {
  return text.split('\n\n').filter(p => p.trim()).map(p => ({
    _type: 'block', children: [{ _type: 'span', text: p.trim() }], style: 'normal'
  }));
}
function makeHeading(text, level) {
  return { _type: 'block', style: level, children: [{ _type: 'span', text: text }] };
}
function makeListItem(text) {
  return { _type: 'block', style: 'normal', listItem: 'bullet', children: [{ _type: 'span', text: text }] };
}
function makeNumberedItem(text) {
  return { _type: 'block', style: 'normal', listItem: 'number', children: [{ _type: 'span', text: text }] };
}
function makeFAQBlock(q, a) {
  return [makeHeading(q, 'h3'), ...makeBlock(a)];
}
async function createPost(post) {
  const mutations = [{ create: post }];
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SANITY_TOKEN}` },
    body: JSON.stringify({ mutations })
  });
  const data = await res.json();
  if (data.error) { console.error(`FAILED: ${post.title.en}`, data.error.message); return null; }
  const id = data.results?.[0]?.id;
  console.log(`OK: ${post.title.en} → ${id}`);
  return id;
}

// ===== ARTICLE 23: Edge Computing =====
const article23 = {
  _type: 'post',
  title: { en: 'Edge Computing: Distributed Data Processing', zh: '边缘计算：分布式数据处理' },
  titleZh: '边缘计算：分布式数据处理',
  slug: { current: 'edge-computing-distributed-processing' },
  category: 'technical',
  excerpt: {
    en: 'Edge computing processes data closer to where it\'s generated, reducing latency and bandwidth costs. This guide covers edge architecture, use cases, and integration with central infrastructure.',
    zh: '边缘计算在数据生成的地方附近处理数据，减少延迟和带宽成本。本指南涵盖边缘架构、用例以及与中央基础设施的集成。'
  },
  excerptZh: '边缘计算在数据生成的地方附近处理数据，减少延迟和带宽成本。本指南涵盖边缘架构、用例以及与中央基础设施的集成。',
  coverImage: 'https://picsum.photos/seed/edge-computing-distributed-processing/800/450',
  language: 'en',
  publishedAt: '2025-02-08T00:00:00Z',
  content: [
    makeHeading('Edge Computing: Distributed Data Processing', 'h1'),
    ...makeBlock('A bottling plant in Cavite generates 2TB of sensor data per day. Their production line has 200 sensors checking bottle fill levels, cap tightness, and label placement. Every defect must be detected within 50 milliseconds — if a defective bottle reaches packaging, the entire batch gets rejected.'),
    ...makeBlock('Processing 2TB of sensor data through a central data center 30km away? The latency was 200ms. Defective bottles slipped through. They were losing $5,000/day in rejected batches.'),
    ...makeBlock('The fix: deploy edge computing nodes right on the factory floor. Each node processes sensor data locally in under 10ms. Defective bottles are rejected in real-time. The 2TB of daily data? Only 2GB of summary data gets sent to the central data center. The rest is processed and discarded at the edge.'),
    ...makeBlock('That\'s edge computing in action: process data where it\'s created, not where your data center happens to be.'),
    makeHeading('What is Edge Computing?', 'h2'),
    ...makeBlock('Edge computing moves computation and data storage closer to the sources of data — sensors, cameras, IoT devices, and end users. Instead of sending all data to a central cloud or data center for processing, you process it locally at the "edge" of the network.'),
    ...makeBlock('Think of it this way: centralized computing is like a factory that ships raw materials to one location, processes everything, and ships finished products back. Edge computing puts small processing stations at each source, doing initial processing on-site and only sending the important stuff to the factory.'),
    makeHeading('Why Edge Computing Matters', 'h2'),
    ...makeBlock('Three forces drive edge computing adoption:'),
    ...makeBlock('Latency: Some applications need responses in milliseconds, not seconds. Autonomous vehicles, industrial automation, and real-time monitoring can\'t wait for round-trips to a cloud data center.'),
    ...makeBlock('Bandwidth: Sending 2TB/day to the cloud costs money. Processing 2TB locally and sending 2GB of summaries saves 99% of bandwidth costs.'),
    ...makeBlock('Data sovereignty: Some data can\'t leave the premises (factory floor, hospital, retail store). Edge processing keeps sensitive data local.'),
    ...makeBlock('The numbers: Gartner predicts 75% of enterprise data will be processed at the edge by 2025. IDC estimates the edge infrastructure market will reach $274 billion by 2025. This isn\'t a niche — it\'s becoming the default architecture for IoT and real-time workloads.'),
    makeHeading('Edge Architecture Components', 'h2'),
    ...makeBlock('A typical edge computing setup has three layers:'),
    ...makeBlock('Layer 1: Edge Devices (Sensors, Cameras, IoT):'),
    makeListItem('Generate raw data (temperature, vibration, video, etc.).'),
    makeListItem('Minimal processing (filtering, aggregation).'),
    makeListItem('Connect to edge nodes via local network (Ethernet, Wi-Fi, 5G).'),
    ...makeBlock('Layer 2: Edge Nodes (Local Compute):'),
    makeListItem('Small form-factor servers (Intel NUC, Dell Edge, or industrial PCs).'),
    makeListItem('Process data in real-time (AI inference, analytics, control loops).'),
    makeListItem('Store short-term data locally (hours to days).'),
    makeListItem('Forward summary data to central infrastructure.'),
    ...makeBlock('Layer 3: Central Infrastructure (Data Center/Cloud):'),
    makeListItem('Long-term data storage and analysis.'),
    makeListItem('Model training (AI/ML models trained centrally, deployed to edge).'),
    makeListItem('Centralized management and monitoring.'),
    makeListItem('Business intelligence and reporting.'),
    makeHeading('Edge Use Cases', 'h2'),
    ...makeBlock('Manufacturing (Industry 4.0):'),
    makeListItem('Real-time quality inspection using computer vision.'),
    makeListItem('Predictive maintenance (detect equipment failure before it happens).'),
    makeListItem('Production line optimization (adjust parameters in real-time).'),
    ...makeBlock('Retail:'),
    makeListItem('In-store analytics (customer movement, heat maps).'),
    makeListItem('Smart checkout (automated payment, inventory tracking).'),
    makeListItem('Personalized promotions (real-time customer recognition).'),
    ...makeBlock('Healthcare:'),
    makeListItem('Patient monitoring (real-time vital signs processing).'),
    makeListItem('Medical imaging (local AI inference for diagnostics).'),
    makeListItem('Telemedicine (low-latency video processing).'),
    ...makeBlock('Telecommunications:'),
    makeListItem('5G edge computing (processing at cell towers).'),
    makeListItem('CDN acceleration (content caching at edge nodes).'),
    makeListItem('Network function virtualization (NFV at the edge).'),
    makeHeading('Edge vs Cloud vs On-Premises', 'h2'),
    ...makeBlock('When to use each:'),
    ...makeBlock('Edge: Latency <10ms required. Data can\'t leave premises. High data volume, low useful-data ratio (e.g., video feeds). Real-time control loops.'),
    ...makeBlock('Cloud: Latency >100ms acceptable. Scalable compute needed. Global access required. AI model training.'),
    ...makeBlock('On-premises: Latency <1ms required. Large data volumes that can\'t go to cloud. Regulatory data sovereignty. Legacy applications.'),
    ...makeBlock('Most enterprises use all three. The bottling plant sends sensor summaries to the cloud for long-term analytics, processes defects locally at the edge, and runs ERP on-premises.'),
    makeHeading('Edge Infrastructure Planning', 'h2'),
    ...makeBlock('Here\'s how we plan edge deployments:'),
    makeNumberedItem('Identify the use case. What problem are you solving? Real-time inspection? Remote monitoring? Customer analytics?'),
    makeNumberedItem('Determine latency requirements. How fast must processing happen? This determines edge vs cloud.'),
    makeNumberedItem('Estimate data volume. How much data per edge node? This determines compute and storage needs.'),
    makeNumberedItem('Plan connectivity. How do edge nodes connect to central infrastructure? Dedicated link, VPN, or cellular?'),
    makeNumberedItem('Design management. How do you manage 50 edge nodes across 12 locations? Centralized management is critical.'),
    ...makeBlock('For the bottling plant: 5 edge nodes (one per production line), each with Intel i7, 32GB RAM, 1TB SSD. Connected via factory Ethernet to central server. Total cost: $15,000 for hardware + $5,000 for AI software licenses.'),
    makeHeading('Edge Management Challenges', 'h2'),
    ...makeBlock('Edge computing introduces management challenges that centralized infrastructure doesn\'t have:'),
    makeListItem('Remote management: You can\'t physically visit every edge node. Use remote management tools (Intel AMT, Dell iDRAC, or cloud-based edge management platforms).'),
    makeListItem('Security: Edge nodes are physically accessible to unauthorized people. Use TPM chips, disk encryption, and disable unused ports.'),
    makeListItem('Updates: Pushing software updates to 50 edge nodes across 12 locations requires automation. Use Ansible, Puppet, or cloud-based patch management.'),
    makeListItem('Monitoring: Centralized monitoring is essential. If an edge node fails, you need to know immediately. Use Prometheus, Grafana, or cloud monitoring services.'),
    makeHeading('Best Practices', 'h2'),
    makeNumberedItem('Start with one use case. Don\'t deploy edge computing everywhere at once. Pick the highest-value use case, prove the ROI, then expand.'),
    makeNumberedItem('Standardize hardware. Use the same edge node model across all locations. Standardization simplifies management, spare parts, and troubleshooting.'),
    makeNumberedItem('Plan for offline operation. Edge nodes should continue processing even if the link to central infrastructure is down. Store and forward when connectivity returns.'),
    makeNumberedItem('Secure the edge. Physical security, disk encryption, TPM, remote wipe capability. Edge nodes are more vulnerable than data center servers.'),
    makeNumberedItem('Centralize management. One console to manage all edge nodes. Don\'t make your team SSH into 50 nodes manually.'),
    makeHeading('Conclusion', 'h2'),
    ...makeBlock('Edge computing isn\'t replacing centralized infrastructure — it\'s complementing it. For workloads that need low latency, local processing, or data sovereignty, edge is the right architecture. For everything else, cloud and on-premises remain the standard.'),
    ...makeBlock('Start with your highest-value use case. If you have sensors, cameras, or IoT devices generating data that needs real-time processing, edge computing will pay for itself in months. If you don\'t have that use case yet, wait — edge will come to you.'),
    makeHeading('FAQ', 'h2'),
    ...makeFAQBlock('Q: How much does an edge computing node cost?', 'A: Basic edge node (Intel NUC, 16GB RAM, 512GB SSD): $500-1,000. Industrial edge node (ruggedized, extended temperature): $2,000-5,000. AI-capable edge node (with GPU): $3,000-10,000.'),
    ...makeFAQBlock('Q: Do I need 5G for edge computing?', 'A: No. Most edge deployments use Ethernet or Wi-Fi. 5G is useful for mobile edge (vehicles, drones) or locations without wired connectivity. For fixed locations, wired connections are more reliable and cheaper.'),
    ...makeFAQBlock('Q: Can edge computing work with Nutanix HCI?', 'A: Yes. Nutanix offers edge-optimized configurations (NX Edge). For simpler needs, Nutanix Xi Edge extends the management plane to remote locations.'),
    ...makeFAQBlock('Q: How do I secure edge nodes that are physically exposed?', 'A: Use TPM for hardware-rooted security, full-disk encryption, secure boot, disable unused ports, and use remote management with certificate-based authentication. Physical security (locked enclosures) is also important.'),
  ]
};

// ===== ARTICLE 24: Data Center Consolidation =====
const article24 = {
  _type: 'post',
  title: { en: 'Data Center Consolidation: Hub-Spoke Migration', zh: '数据中心整合：Hub-Spoke迁移策略' },
  titleZh: '数据中心整合：Hub-Spoke迁移策略',
  slug: { current: 'data-center-consolidation-hub-spoke' },
  category: 'technical',
  excerpt: {
    en: 'Data center consolidation reduces costs by merging multiple facilities into fewer, larger sites. This guide covers the hub-spoke architecture, migration planning, and risk management for enterprise consolidation.',
    zh: '数据中心整合通过将多个设施合并为更少的大型站点来降低成本。本指南涵盖Hub-Spoke架构、迁移规划和企业整合的风险管理。'
  },
  excerptZh: '数据中心整合通过将多个设施合并为更少的大型站点来降低成本。本指南涵盖Hub-Spoke架构、迁移规划和企业整合的风险管理。',
  coverImage: 'https://picsum.photos/seed/data-center-consolidation-hub-spoke/800/450',
  language: 'en',
  publishedAt: '2025-02-10T00:00:00Z',
  content: [
    makeHeading('Data Center Consolidation: Hub-Spoke Migration', 'h1'),
    ...makeBlock('A Philippine bank had 8 data centers across the archipelago: Manila (2), Cebu (2), Davao (1), Clark (1), Iloilo (1), and Zamboanga (1). Each was independently managed, separately licensed, and differently configured. Total annual cost: $4.2 million.'),
    ...makeBlock('After consolidation to 3 data centers (Manila hub, Cebu hub, Clark backup), annual cost dropped to $2.1 million — a 50% reduction. But the real win wasn\'t cost. It was consistency: one configuration, one team, one set of processes across all sites.'),
    ...makeBlock('Data center consolidation is painful but transformative. Here\'s how to do it without breaking your business.'),
    makeHeading('What is Data Center Consolidation?', 'h2'),
    ...makeBlock('Data center consolidation is the process of merging multiple data centers into fewer, larger facilities. The goal: reduce costs, improve efficiency, and simplify operations by eliminating redundant infrastructure.'),
    ...makeBlock('The hub-spoke model is the most common consolidation architecture:'),
    makeListItem('Hub (1-2 sites): Large, centrally-located data centers that host most workloads. Full redundancy, enterprise-grade infrastructure.'),
    makeListItem('Spoke (2-4 sites): Smaller facilities that handle local workloads (branch office applications, local data processing) and serve as DR for the hub.'),
    ...makeBlock('Think of it like a airline hub: most flights connect through the hub, but smaller airports (spokes) serve local traffic and provide backup routing.'),
    makeHeading('Why Consolidate?', 'h2'),
    ...makeBlock('The business case for consolidation is compelling:'),
    makeListItem('Cost reduction: Fewer facilities = less power, cooling, rent, and staff. Typical savings: 30-50%.'),
    makeListItem('Operational efficiency: One team manages everything. One set of processes. One monitoring system.'),
    makeListItem('Better security: Fewer physical locations to secure. Concentrated security investment.'),
    makeListItem('Improved DR: Consolidated infrastructure is easier to replicate and protect.'),
    makeListItem('Scalability: Larger facilities can scale more efficiently than many small ones.'),
    ...makeBlock('The downside: migration risk. Moving workloads between data centers is complex, time-consuming, and can disrupt operations if not planned carefully.'),
    makeHeading('Hub-Spoke Architecture Design', 'h2'),
    ...makeBlock('Here\'s the architecture we designed for the bank:'),
    ...makeBlock('Hub Site (Manila):'),
    makeListItem('Primary data center: 200 racks, 500+ VMs, full redundancy (2N power, redundant cooling).'),
    makeListItem('Hosts: Core banking, EHR, ERP, and other mission-critical workloads.'),
    makeListItem('Network: 10Gbps backbone, redundant ISP connections, Direct Connect to AWS/Azure.'),
    ...makeBlock('Hub Site (Cebu):'),
    makeListItem('Regional hub: 80 racks, 200+ VMs, N+1 redundancy.'),
    makeListItem('Hosts: Regional workloads, Visayas-Mindanao operations, DR for Manila hub.'),
    makeListItem('Network: 10Gbps backbone, dedicated WAN link to Manila (latency <10ms).'),
    ...makeBlock('Spoke Sites (Clark, Iloilo):'),
    makeListItem('Local processing: 10-20 racks each, 20-50 VMs.'),
    makeListItem('Hosts: Branch office applications, local data processing, edge workloads.'),
    makeListItem('Network: 1Gbps WAN to nearest hub, local internet for cloud access.'),
    ...makeBlock('Key design principle: spokes should be self-sufficient for local operations. If the WAN link to the hub goes down, spoke sites continue running local applications.'),
    makeHeading('Migration Planning', 'h2'),
    ...makeBlock('Migration is the hardest part. Here\'s our 5-phase approach:'),
    makeNumberedItem('Discovery (4-6 weeks): Inventory all workloads across all data centers. Document dependencies, performance requirements, and compliance constraints. We use automated discovery tools (RVTools, Nutanix Xi, or Azure Migrate).'),
    makeNumberedItem('Design (4-6 weeks): Map workloads to the new architecture. Which workloads go to which hub? Which stay at spoke sites? What network changes are needed?'),
    makeNumberedItem('Pilot migration (4-8 weeks): Move 10-20 non-critical workloads first. Test performance, validate networking, verify backup/DR. Fix issues before the big migration.'),
    makeNumberedItem('Production migration (12-24 weeks): Move workloads in waves. Each wave = 10-20 VMs. Migrate during maintenance windows. Have rollback plans for every wave.'),
    ...makeBlock('Total timeline: 6-12 months for a multi-site consolidation.'),
    makeHeading('Migration Techniques', 'h2'),
    ...makeBlock('For VM-based workloads, we use these migration techniques:'),
    ...makeBlock('Live migration (minimal downtime):'),
    makeListItem('Nutanix: Xi Leap for cross-site migration.'),
    makeListItem('VMware: vSphere vMotion for same-site, SRM for cross-site.'),
    makeListItem('General: Veeam or Zerto for replication-based migration.'),
    ...makeBlock('Cold migration (planned downtime):'),
    makeListItem('Export VM, transfer to new site, import. Simple but requires downtime window.'),
    ...makeBlock('Application-level migration:'),
    makeListItem('Database replication (SQL Server Always On, MySQL replication).'),
    makeListItem('File sync (rsync, DFS Replication).'),
    makeListItem('DNS cut-over (update DNS to point to new location).'),
    ...makeBlock('The key: always migrate during maintenance windows. Always have a rollback plan. Always test before cutting over.'),
    makeHeading('Network Design for Consolidation', 'h2'),
    ...makeBlock('Network connectivity between hubs and spokes is critical:'),
    makeListItem('Hub-to-hub: 10Gbps dedicated WAN (MPLS or leased line). Latency <10ms.'),
    makeListItem('Hub-to-spoke: 1Gbps WAN. Latency <20ms.'),
    ...makeBlock('For the bank, we used PLDT Enterprise MPLS for hub-to-hub and Globe Business for hub-to-spoke. Redundant providers for each link.'),
    ...makeBlock('DNS planning is often overlooked. During migration, DNS TTL (time-to-live) must be set low (300 seconds) before cutover. This ensures quick failover if something goes wrong.'),
    makeHeading('Cost Analysis', 'h2'),
    ...makeBlock('Here\'s a real cost comparison for the bank consolidation:'),
    ...makeBlock('Before (8 data centers):'),
    makeListItem('Facilities: $1.8M/year (rent, power, cooling).'),
    makeListItem('Hardware: $1.2M/year (leases, refresh cycles).'),
    makeListItem('Staff: $800K/year (8 teams, 24 staff).'),
    makeListItem('Software: $400K/year (per-site licensing).'),
    makeListItem('Total: $4.2M/year.'),
    ...makeBlock('After (3 data centers):'),
    makeListItem('Facilities: $900K/year (3 sites, optimized power).'),
    makeListItem('Hardware: $600K/year (consolidated, newer hardware).'),
    makeListItem('Staff: $400K/year (1 team, 12 staff).'),
    makeListItem('Software: $200K/year (consolidated licensing).'),
    makeListItem('Total: $2.1M/year.'),
    ...makeBlock('Savings: $2.1M/year (50%). Migration cost: $800K (one-time). Payback period: 5.7 months.'),
    makeHeading('Risk Management', 'h2'),
    ...makeBlock('Consolidation carries real risks. Here\'s how we mitigate them:'),
    makeNumberedItem('Data loss: Use verified backup before every migration. Test restore at the destination before cutting over.'),
    makeNumberedItem('Downtime: Migrate during maintenance windows. Have rollback plans. Accept that some migration will extend into the window.'),
    makeNumberedItem('Performance degradation: Benchmark workloads before and after migration. If performance drops, investigate immediately.'),
    makeNumberedItem('Compliance gaps: Map regulatory requirements to the new architecture. Ensure data sovereignty and retention requirements are met.'),
    makeNumberedItem('Staff resistance: People fear change. Communicate early. Explain the benefits. Involve the team in planning.'),
    makeHeading('Best Practices', 'h2'),
    makeNumberedItem('Start with an assessment. You can\'t consolidate what you don\'t understand. Document every workload, every dependency, every compliance requirement.'),
    makeNumberedItem('Migrate in waves. Don\'t try to move everything at once. Start with non-critical workloads. Build confidence. Then tackle mission-critical systems.'),
    makeNumberedItem('Invest in network. The WAN between hubs and spokes is the backbone of your consolidated architecture. Don\'t skimp.'),
    makeNumberedItem('Plan for the long term. Design for 5 years of growth. It\'s cheaper to over-build during consolidation than to retrofit later.'),
    makeNumberedItem('Communicate constantly. Migration affects everyone. Keep stakeholders informed. Set expectations for downtime. Provide status updates.'),
    makeHeading('Conclusion', 'h2'),
    ...makeBlock('Data center consolidation delivers massive cost savings and operational improvements, but it requires careful planning and execution. The hub-spoke model provides the right balance of centralization and local resilience.'),
    ...makeBlock('Start with a comprehensive assessment. Design the target architecture. Migrate in waves. Test every step. The pain is temporary — the benefits compound for years.'),
    makeHeading('FAQ', 'h2'),
    ...makeFAQBlock('Q: How long does a multi-site consolidation take?', 'A: For 3-5 sites: 6-9 months. For 5-10 sites: 9-15 months. The timeline depends on workload complexity, compliance requirements, and available migration windows.'),
    ...makeFAQBlock('Q: Can I consolidate without downtime?', 'A: Most workloads can be migrated with minimal downtime (under 30 minutes) using live migration. Some workloads (legacy applications, databases) may require longer maintenance windows.'),
    ...makeFAQBlock('Q: What if consolidation doesn\'t meet cost targets?', 'A: Revisit the design. Common cost overruns: underestimating network costs, over-provisioning the hub site, or not retiring spoke sites completely. Adjust the architecture based on actual costs.'),
    ...makeFAQBlock('Q: Should I use cloud instead of consolidating?', 'A: Cloud is a form of consolidation — you\'re consolidating to a cloud provider\'s data center. Evaluate both options: on-premises consolidation vs cloud migration. For regulated industries with data sovereignty requirements, on-premises consolidation is often the better choice.'),
  ]
};

const articles = [article23, article24];
(async () => {
  let success = 0;
  for (const article of articles) {
    const id = await createPost(article);
    if (id) success++;
  }
  console.log(`\nBatch 4 complete: ${success}/${articles.length} uploaded`);
})();
