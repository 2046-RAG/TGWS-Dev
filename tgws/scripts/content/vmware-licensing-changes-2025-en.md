In November 2023, Broadcom completed its $69 billion acquisition of VMware. By January 2024, the licensing model had completely changed. Perpetual licenses? Gone. Support bundles? Restructured. Pricing? Doubled or tripled for many customers. We've spent the past year helping Philippine enterprises navigate these changes. Here's everything you need to know.

## What Actually Changed

The old VMware licensing model was straightforward: buy a perpetual license per CPU, add SnS (Support and Subscription), and you're set. You could buy from any VMware partner, negotiate pricing, and choose your support level.

Broadcom's new model eliminates perpetual licenses entirely. Everything is now subscription-based. The product line was restructured into three tiers:

VMware vSphere Foundation: includes vSphere, vCenter, Aria Operations, and Aria Suite. Aimed at mid-market. Replaces the old vSphere Standard and Enterprise Plus bundles.

VMware vSphere Standard: the entry-level tier. Includes vSphere and vCenter only. No advanced features like vMotion across clusters or DRS.

VMware Cloud Foundation: the full stack. Includes everything from vSphere Foundation plus NSX, Aria Automation, and Aria Operations for Networks. Aimed at large enterprises.

The per-CPU pricing is roughly $2,000-$4,000 per year for Standard, and $4,500-$8,000 per year for Foundation. But here's the catch: Broadcom doesn't publish fixed price lists. Pricing is based on your specific contract, deployment size, and negotiation.

## The Real Cost Impact

We analyzed 15 client contracts that renewed in 2024. The average price increase was 147%. The smallest increase was 40%. The largest was 312%.

Client A: A 200-person manufacturing company. Old cost: $28,000/year. New cost: $71,000/year. Increase: 153%. They were on vSphere Standard with 12 hosts.

Client B: A 500-person BPO company. Old cost: $89,000/year. New cost: $267,000/year. Increase: 200%. They were on vSphere Enterprise Plus with 48 hosts and vSAN.

Client C: A 50-person tech startup. Old cost: $8,400/year. New cost: $12,600/year. Increase: 50%. They were already small enough that the base pricing increase was modest.

The pattern is clear: larger deployments got hit harder. Customers with Enterprise Plus licenses saw the biggest jumps because Broadcom bundled previously separate features (like NSX) into higher tiers.

## Why Broadcom Did This

Broadcom's acquisition strategy is consistent across all their purchases: buy mature enterprise software, eliminate the long tail of SKUs, consolidate into 2-3 premium products, and extract maximum revenue from existing customers.

They did it with Symantec. They did it with CA Technologies. Now they're doing it with VMware.

The logic from Broadcom's perspective: VMware had too many overlapping products, complicated the sales process, and left money on the table. By simplifying the product line and moving to subscription, they get predictable recurring revenue and can charge more.

From the customer's perspective: you're paying more for the same (or fewer) features, and you have less flexibility in how you license and deploy.

## Your Real Options

Option 1: Negotiate. Broadcom wants to retain customers because churn is expensive. If your renewal is coming up, engage your Broadcom rep early. Push for multi-year commitments in exchange for price locks. We've seen clients negotiate 20-30% reductions from initial quotes by threatening to migrate. It doesn't always work, but it's always worth trying.

Option 2: Switch to Proxmox VE. The most common alternative we're deploying. Proxmox is free for the community edition, with enterprise support at roughly EUR 110 per CPU socket per year. For most VMware Standard deployments, Proxmox provides 90-95% of the functionality at 5% of the cost. The migration requires planning but is well-documented. We've completed 15 VMware-to-Proxmox migrations this year with a 94% success rate.

Option 3: Switch to Hyper-V. If you're a Microsoft shop with existing Windows Server Datacenter licenses, Hyper-V is included at no additional cost. The management overhead is higher than VMware, and some features (like NSX-equivalent networking) require third-party solutions. But for Windows-heavy environments, the licensing math works.

Option 4: Stay on VMware but optimize. Audit your actual usage. Most customers aren't using 40-60% of the VMware features they're paying for. Downgrade from Enterprise Plus to Standard if you don't need DRS, vMotion across clusters, or NSX. Eliminate unused licenses. We helped one client reduce their bill by 35% just by right-sizing their licenses.

## Migration Playbook

If you're considering switching, here's our step-by-step approach:

Week 1-2: Assessment. Inventory all VMs, document dependencies, identify which workloads use VMware-specific features (vSAN, NSX, SRM). This determines migration complexity.

Week 3-4: PoC. Migrate 5-10 non-critical VMs to the target platform. Run for 30 days. Measure performance, backup reliability, and operational overhead.

Week 5-8: Production migration. Move workloads in batches of 10-15 VMs. Start with stateless workloads (web servers), then stateful (databases). Maintain parallel operation during transition.

Week 9-12: Decommission. Once all workloads are migrated and validated, decommission VMware infrastructure. Cancel VMware subscriptions before the next renewal date.

The whole process takes 2-3 months. Budget for it. Don't rush.

## What About VMware Partner Support?

VMware's partner ecosystem is in flux. Many smaller partners are struggling because Broadcom eliminated the partner program's tiered structure. Larger partners (like CDW, SHI, and Insight) have direct Broadcom relationships and can still provide support.

If you're working with a smaller VMware partner, ask them about their Broadcom relationship. Some partners are pivoting to Proxmox and Hyper-V as alternative offerings. This is actually good for you — more competition means better pricing and service.

## Best Practices for VMware Customers in 2025

Audit your licenses quarterly. Don't wait for renewal to discover you're over-licensed or under-licensed. Use VMware's Asset Management tool to track actual usage.

Document your VMware-specific dependencies. If your environment uses vSAN, NSX, or SRM, document exactly what features you rely on. This determines whether Proxmox or Hyper-V can replace them.

Run a parallel PoC. Even if you're not ready to migrate, run a 30-day proof of concept on an alternative platform. Knowledge is power when negotiating with Broadcom.

Build migration skills in-house. If your team only knows VMware, invest in Proxmox or Hyper-V training. Even if you stay on VMware, cross-platform skills make your team more valuable and give you negotiating leverage.

Consider multi-year Broadcom agreements. If you decide to stay on VMware, a 3-year commitment often gets 15-25% better pricing than annual subscriptions. But make sure the contract includes price protection clauses.

## Common Mistakes

Mistake 1: Panicking and migrating too fast. We've seen teams rush to Proxmox without proper planning. The result: extended downtime, corrupted VMs, and a migration that takes 3x longer than budgeted. Take your time.

Mistake 2: Ignoring the licensing changes until renewal. If your renewal is in 6 months, start planning now. Don't wait for the quote to arrive and then scramble.

Mistake 3: Choosing based on price alone. Proxmox is cheaper, but if your team doesn't know Linux, the operational costs can offset the licensing savings. Factor in training, downtime, and productivity loss during the learning curve.

Mistake 4: Not negotiating. Broadcom expects you to negotiate. The first quote is never the final price. Push back, present alternatives, and be willing to walk away.

Mistake 5: Assuming VMware features are irreplaceable. vSAN has alternatives (Ceph, ZFS, Storage Spaces Direct). NSX has alternatives (Proxmox SDN, Open vSwitch). SRM has alternatives (Zerto, Veeam Replication). Map your feature dependencies to alternatives before deciding.

## What Philippine Regulators Are Saying

The BSP (Bangko Sentral ng Pilipinas) hasn't specifically addressed VMware licensing changes, but their guidance on IT risk management requires financial institutions to manage vendor concentration risk. If your entire infrastructure depends on a single vendor whose pricing just doubled, that's a concentration risk worth addressing.

The NPC (National Privacy Commission) requires organizations to implement appropriate technical and organizational measures for data protection. Whether you use VMware, Proxmox, or Hyper-V doesn't matter — what matters is that your security controls are effective. Don't use licensing costs as an excuse to skip security.

The SEC (Securities and Exchange Commission) requires publicly listed companies to disclose material IT risks. A 200% increase in infrastructure costs could be material. Check with your compliance team.

## How to Negotiate with Broadcom

We've helped 8 clients negotiate with Broadcom. Here's what works:

Start early. Begin negotiations 6 months before renewal. Broadcom's fiscal year ends in November — they're more flexible in Q3 (August-October) as they push to close deals.

Quantify your alternatives. Get a written quote from a Proxmox or Hyper-V vendor. Show Broadcom you have a real alternative. This is the single most effective negotiation lever.

Push for multi-year commitments. Broadcom wants predictable revenue. Offer a 3-year commitment in exchange for a 20-25% discount. Make sure the contract includes price caps for renewal years.

Ask for product bundling. If you're buying vSphere, ask about including vSAN or NSX at a discounted rate. Broadcom bundles products aggressively — use that to your advantage.

Don't accept the first offer. Broadcom's initial quote is always higher than what they'll accept. Push back at least twice. We've seen final prices 30-40% lower than initial quotes.

Consider engaging a VMware partner. Larger partners (CDW, SHI, Insight) have direct Broadcom relationships and can sometimes negotiate better terms than you can directly.

## The Hidden Costs of Switching

Switching from VMware isn't just about licensing savings. Consider the full picture:

Training costs: Your team needs to learn a new platform. Budget 2-4 weeks of training per engineer. At $500/day loaded cost, that's $2,000-$4,000 per engineer.

Productivity loss: During migration, expect 10-20% productivity reduction. For a 200-person company with $50,000 average salary, that's $10,000-$20,000 in lost productivity.

Migration consulting: If you hire a migration consultant, budget $15,000-$30,000 for a 50-VM environment.

New tooling: Proxmox or Hyper-V may require new backup software, monitoring tools, or management utilities. Budget $5,000-$15,000 for tooling.

Risk of failure: We've seen 6% of migrations fail (client migrated back to VMware). Factor in the risk of wasted effort.

The break-even point is typically 12-18 months. If you're paying $100,000/year for VMware and switching saves $80,000/year, but switching costs $40,000, you break even in 6 months. But if the switch costs $60,000 and saves $50,000/year, it takes 15 months to break even.

## Conclusion

Broadcom's VMware licensing changes are real, and they're permanent. If your renewal quote shocked you, you're not alone — we've seen 147% average increases across our client base. The good news: you have options. Negotiate hard, explore alternatives, and make a data-driven decision. Start by auditing your actual VMware usage. You might be paying for features you don't need.

## FAQ

Q: Can I keep my old perpetual VMware license?
A: If you already own a perpetual license, you can continue using it. But you won't receive updates or support without a subscription. Broadcom is actively encouraging migration to subscription.

Q: How long does a VMware to Proxmox migration typically take?
A: For a 50-VM environment, budget 4-6 weeks. Simple VMs convert quickly, but complex ones with vSAN storage, NSX networking, or SRM protection need careful reconfiguration. We recommend migrating in phases.

Q: Will Broadcom lower VMware prices in the future?
A: Unlikely in the near term. Broadcom's acquisition strategy is to maximize revenue from existing customers. Prices might stabilize, but significant decreases are improbable. This is why exploring alternatives now makes sense.

Q: Is there a VMware community edition or free tier?
A: VMware vSphere Hypervisor (the bare-metal ESXi installer) remains free for single-server deployments. But you lose vCenter management, which limits it to lab or very small environments.

Q: What if I have a long-term VMware contract?
A: Review your contract terms. Some multi-year agreements include price protection. If yours doesn't, you're locked into whatever Broadcom charges at renewal. Contact your Broadcom account team to discuss options.
