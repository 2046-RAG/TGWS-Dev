import https from 'https';

const PROJECT_ID = 'r6ztl1oq';
const DATASET = 'production';
const TOKEN = 'REPLACED_SANITY_TOKEN';

const updates = [
  {
    slug: 'ai-assisted-coding',
    description: "Your developers want to use AI coding tools but you're not sure how to start safely? We help enterprises adopt Copilot, Cursor, and Tongyi Lingma — starting with a department-level pilot, establishing code review and quality gates, then rolling out organization-wide. No AI expertise required on your team. We handle assessment, deployment, and training. Start with a free readiness assessment.",
    descriptionZh: "您的開發團隊想用AI編碼工具，但不確定如何安全地開始？我們協助企業導入Copilot、Cursor和通義靈碼——從部門試點開始，建立程式碼審查和品質門禁，再推廣至全組織。您的團隊無需AI專業知識。我們負責評估、部署和培訓。免費開始能力評估。",
    features: ["AI readiness assessment", "Tool deployment (Copilot, Cursor, Lingma)", "Team training workshops", "Code quality governance", "Organization-wide rollout"]
  },
  {
    slug: 'enterprise-legacy-system-ai-augmentation',
    description: "Add AI capabilities to ERP, CRM, OA and other legacy systems without modifying or with minimal source code changes. Through API proxy layers, plug-in AI modules, and model adaptation, give old systems intelligent prediction, process automation, and anomaly detection — achieving low-cost smart upgrades.",
    descriptionZh: "在不修改或極少修改原始碼的前提下，為ERP、CRM、OA等老舊業務系統疊加AI能力。透過API代理層、外掛式AI模組和模型適配，讓舊系統具備智慧預測、流程自動化、異常偵測等功能，實現低成本智能化升級。",
    features: ["ERP/CRM/OA AI enhancement", "API integration layer", "No core system changes", "Prediction & automation", "Gradual deployment"]
  },
  {
    slug: 'ai-agent-development',
    description: "Once your AI foundation is solid, we help you build autonomous agents that handle multi-step workflows — customer service triage, data analysis, approval routing. Deployed on Bailian or Volcengine, agents work across your systems so your team focuses on decisions, not tasks.",
    descriptionZh: "當您的AI基礎就緒，我們幫您構建自主代理，處理多步驟工作流程——客服分流、數據分析、審批路由。部署在百煉或火山引擎上，代理跨系統協作，讓您的團隊專注決策而非瑣事。",
    features: ["Customer service triage", "Data analysis workflows", "Approval routing automation", "Cross-system orchestration", "Bailian & Volcengine deployment"]
  }
];

async function sanityRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${PROJECT_ID}.api.sanity.io`,
      path: `/v2021-10-21${path}`,
      method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { resolve(data); } });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  for (const update of updates) {
    const query = `*[_type=="product" && slug.current=="${update.slug}"][0]._id`;
    const result = await sanityRequest('GET', `/data/query/${DATASET}?query=${encodeURIComponent(query)}`);
    
    if (!result.result) {
      console.log(`Product ${update.slug} not found, skipping`);
      continue;
    }

    const patchBody = {
      mutations: [{
        patch: {
          id: result.result,
          set: {
            description: update.description,
            descriptionZh: update.descriptionZh,
            features: update.features,
          }
        }
      }]
    };

    const updateResult = await sanityRequest('POST', '/data/mutate/production', patchBody);
    console.log(`Updated ${update.slug}: ${updateResult.transactionId}`);
  }
}

main().catch(console.error);
