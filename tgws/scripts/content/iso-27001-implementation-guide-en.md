A fintech startup in BGC called us in January. They needed ISO 27001 certification by June to close a Series B deal with a Japanese investor. No documentation, no policies, no security team. We delivered certification in 5 months. Here's how — and what we'd do differently next time.

## What Is ISO 27001?

ISO 27001 is the international standard for information security management systems (ISMS). It defines a framework for managing sensitive company information — employee data, customer records, financial information, intellectual property — to keep it secure. Certification means an independent auditor has verified that your security controls meet the standard.

In the Philippines, ISO 27001 is increasingly required by regulators. The BSP requires financial institutions to implement information security management. The NPC references ISO 27001 as a benchmark for data protection. And international clients — especially Japanese, Korean, and European companies — often require ISO 27001 certification before doing business.

The standard has two parts: Annex A (93 controls in 4 themes) and the management system requirements (Clauses 4-10). Most people focus on the controls, but the management system is what auditors actually evaluate.

## The 8 Implementations: What We've Seen

Across our 8 implementations, we've seen:

A 50-person fintech startup: achieved certification in 5 months. They had nothing — no documentation, no security awareness, no incident response plan. The biggest challenge was building a security culture from scratch.

A 300-person BPO company: took 8 months. They had basic policies but no formal risk assessment. The BPO context meant they also needed to demonstrate PCI-DSS alignment.

A 1,200-person manufacturing company: took 11 months. Legacy IT systems, undocumented processes, and resistance from factory floor managers made this our most challenging engagement.

A 200-person healthcare provider: took 9 months. HIPAA requirements overlapped significantly with ISO 27001, which helped. But the healthcare-specific controls (access to patient data, medical device security) required extra effort.

A 50-person logistics company: took 6 months. Clean IT infrastructure, cooperative management, and a motivated security champion made this one of our smoothest implementations.

A 150-person law firm: took 10 months. Attorney privilege concerns complicated data classification. Partner buy-in was slow.

A 80-person e-commerce company: took 7 months. PCI-DSS compliance was already in place, which covered about 40% of ISO 27001 requirements.

A 400-person telecom company: took 12 months. Massive legacy systems, multiple office locations, and a merger in progress created complexity that extended the timeline.

Average timeline: 8.5 months. Average cost: PHP 2.5-4.5 million ($45,000-$81,000) including consulting, documentation, training, and certification audit fees.

## Step 1: Gap Assessment (Week 1-2)

Before doing anything else, assess where you are. We review the organization's existing documentation, interview key stakeholders, and evaluate current security controls against ISO 27001 requirements.

The output is a gap assessment report that maps your current state to each ISO 27001 clause and Annex A control. This tells you exactly what needs to be built, what needs to be modified, and what's already in place.

Common findings in Philippine organizations: no formal risk assessment process, incident response plans that haven't been tested, access control policies that exist on paper but aren't enforced, and security awareness training that happens once a year at best.

Cost: PHP 150,000-300,000 ($2,700-$5,400) for a thorough gap assessment.

## Step 2: Define Scope and Leadership Commitment (Week 2-3)

ISO 27001 requires top management commitment. This isn't just a checkbox — the certification body will interview your CEO or managing director. They need to understand what ISO 27001 is, why the organization is pursuing it, and what resources are allocated.

Define the scope: which business units, locations, and systems fall under the ISMS. Our advice: start narrow. A 200-person company might scope the IT department and customer-facing applications first, then expand after initial certification.

Get the scope document signed by top management. This is your formal commitment.

## Step 3: Risk Assessment (Week 3-6)

This is the core of ISO 27001. You need to identify information assets, identify threats to those assets, assess the likelihood and impact of each threat, and determine risk treatment options.

For a typical 200-person company, expect to identify 80-150 information assets, 200-300 threats, and produce a risk register with 40-60 risk treatment plans.

In the Philippines, common high-risk areas include: third-party data processing (outsourcing to other BPO companies), remote work security, physical security of offices (especially in shared buildings), and supply chain security (local vendors with weak security practices).

The risk assessment must be documented and updated at least annually. We recommend quarterly reviews for high-risk organizations.

## Step 4: Develop Policies and Procedures (Week 4-8)

ISO 27001 requires a set of mandatory documents. Here's the minimum:

Information Security Policy (top-level document, approved by management). Risk Assessment and Treatment Methodology. Statement of Applicability (explaining which Annex A controls are implemented and why). Access Control Policy. Cryptography Policy. Physical Security Policy. Operations Security Policy. Supplier Security Policy. Incident Management Policy. Business Continuity Policy.

Plus supporting procedures for each policy area. Total: typically 25-35 documents.

Our approach: we create policy templates customized to Philippine context (including NPC requirements, BSP guidelines, and local labor law implications), then work with the client to customize each one. This saves 40-60% of the time compared to writing from scratch.

## Step 5: Implement Controls (Week 6-16)

The Annex A controls are where the rubber meets the road. Key areas:

Access control: implement role-based access control (RBAC), multi-factor authentication, and privileged access management. Most Philippine organizations have basic AD authentication but lack formal access reviews.

Cryptography: implement encryption for data at rest and in transit. TLS 1.2+ for web traffic, AES-256 for stored data. Document your key management procedures.

Operations security: implement logging and monitoring, change management, malware protection, and backup/recovery. Most organizations have some of these but lack formal documentation.

Physical security: implement visitor management, clean desk policy, secure disposal of media, and environmental controls. Philippine offices often have lax physical security — visitors walk in unescorted, desks have sensitive documents visible.

Supplier security: assess and monitor third-party providers. In the Philippines, many organizations outsource to BPO providers, cloud services, and local vendors. Each needs a security assessment.

## Step 6: Security Awareness Training (Week 8-12)

ISO 27001 requires evidence that all employees receive security awareness training. We deliver a 4-hour training program covering: phishing awareness, password hygiene, data handling, incident reporting, and clean desk policy.

For Philippine organizations, we add specific modules on: social engineering targeting Filipino workers (pretexting, vishing), mobile security (many workers use personal devices), and remote work security (VPN usage, home network security).

Training must be documented. Attendance records, training materials, and quiz results (we include a 20-question assessment) must be retained.

## Step 7: Internal Audit (Week 14-16)

Before the certification audit, you must conduct an internal audit. This verifies that your ISMS is functioning as designed and that controls are operating effectively.

We train the client's internal audit team (usually 2-3 people) on ISO 27001 audit methodology. The internal audit covers all clauses and a representative sample of Annex A controls. Non-conformities are documented and corrective actions implemented.

Timeline: typically 2 weeks for a 200-person organization. Budget 1 week for planning, 1 week for fieldwork, and 1 week for reporting and corrective actions.

## Step 8: Management Review (Week 16-17)

Top management must review the ISMS at least annually. The review covers: risk assessment results, audit findings, performance metrics, and resource needs.

This is a formal meeting with documented minutes. The certification body will review these minutes during the audit.

## Step 9: Certification Audit (Week 18-20)

The certification audit has two stages:

Stage 1 (Documentation review): The auditor reviews your documentation, risk assessment, and policies. This is usually a 1-2 day remote audit. The auditor identifies any documentation gaps that need to be fixed before Stage 2.

Stage 2 (Implementation audit): The auditor visits your office, interviews staff, and verifies that controls are actually implemented. This is typically 2-5 days depending on organization size. They will sample-test controls, review records, and interview employees at all levels.

If non-conformities are found, you get a period (usually 60-90 days) to fix them. After fixing, the auditor verifies the corrections.

Certification body cost: PHP 500,000-1,000,000 ($9,000-$18,000) for a 200-person organization. This includes Stage 1, Stage 2, and the certificate.

## Common Mistakes

Mistake 1: Treating ISO 27001 as a documentation exercise. The policies and procedures are important, but auditors look for evidence of implementation. Having a backup policy but no backup logs is a non-conformity.

Mistake 2: Skipping the risk assessment. Some organizations try to implement controls without doing a risk assessment first. This results in controls that don't address actual risks. Always start with risk.

Mistake 3: Underestimating the timeline. ISO 27001 is a 6-12 month project, not a 2-month documentation sprint. Trying to rush leads to poor-quality documentation and unimplemented controls.

Mistake 4: Not involving top management. If the CEO doesn't understand ISO 27001, the certification body will notice. Leadership commitment is evaluated throughout the audit process.

Mistake 5: Neglecting continuous improvement. ISO 27001 requires ongoing monitoring, internal audits, and management reviews. Getting certified is the beginning, not the end.

## Cost Summary for Philippine Organizations

Gap assessment: PHP 150,000-300,000 ($2,700-$5,400)
Consulting and documentation: PHP 800,000-1,500,000 ($14,400-$27,000)
Training: PHP 100,000-200,000 ($1,800-$3,600)
Internal audit: PHP 200,000-400,000 ($3,600-$7,200)
Certification audit: PHP 500,000-1,000,000 ($9,000-$18,000)
Tools and technology: PHP 300,000-600,000 ($5,400-$10,800)

Total: PHP 2,050,000-4,000,000 ($37,000-$72,000) for a 200-person organization.

Annual maintenance (recertification audit, internal audits, training): PHP 800,000-1,500,000 ($14,400-$27,000).

## Conclusion

ISO 27001 certification is achievable for Philippine organizations of any size. The key: start with a gap assessment, get leadership commitment, follow a structured implementation plan, and don't try to shortcut the process. Average timeline is 8-9 months, average cost is PHP 2.5-4.5 million. The investment pays for itself through reduced security incidents, improved customer trust, and access to international markets.

For the BGC fintech startup? They achieved certification in 5 months. The Series B deal closed. And their ISO 27001 certification became a competitive advantage in subsequent client negotiations.

## Common Philippine-Specific Challenges

Challenge 1: Language barriers. ISO 27001 documentation is typically in English, but Filipino employees may prefer Tagalog training materials. We create bilingual training materials and conduct sessions in Tagalog with English technical terms. This improves comprehension and retention.

Challenge 2: Remote work security. Many Philippine organizations shifted to remote work during the pandemic and never fully returned to the office. ISO 27001 requires controls for remote access — VPN, device management, home network security. We help clients implement conditional access policies that verify device health before granting access.

Challenge 3: Third-party risk. Philippine organizations frequently outsource to BPO providers, cloud services, and local vendors. ISO 27001 requires supplier security assessments. We help clients create vendor questionnaires, conduct on-site assessments for critical suppliers, and establish ongoing monitoring.

Challenge 4: Legacy systems. Many Philippine organizations run legacy applications on outdated infrastructure. These systems often can't support modern security controls (multi-factor authentication, encryption). We help clients implement compensating controls — network segmentation, application-level firewalls, and enhanced monitoring — to address risks that legacy systems can't mitigate directly.

Challenge 5: Cultural resistance. In some Philippine organizations, security is seen as an IT problem, not a business priority. We conduct executive briefings to explain the business case for ISO 27001 — reduced insurance premiums, client acquisition, regulatory compliance. This helps secure the leadership commitment that auditors evaluate.

## Maintaining ISO 27001 After Certification

Certification is the beginning, not the end. Here's what you need to do annually:

Surveillance audit: The certification body conducts a 1-day annual audit to verify ongoing compliance. Budget PHP 150,000-250,000 for this.

Internal audits: Conduct at least 2 internal audits per year. Cover all ISMS clauses and a rotating sample of Annex A controls.

Management review: Hold at least 2 management review meetings per year. Review risk assessment results, audit findings, performance metrics, and resource needs.

Risk reassessment: Update your risk assessment at least annually. Add new threats, remove obsolete ones, and recalculate risk scores.

Training: Conduct annual security awareness training for all employees. New hires must receive training within 30 days.

Incident review: After every security incident, conduct a post-incident review. Update controls and procedures based on lessons learned.

## FAQ

Q: How long is ISO 27001 certification valid?
A: 3 years. After that, you need a recertification audit. In between, there are annual surveillance audits (1 day each) to verify ongoing compliance.

Q: Can we implement ISO 27001 without external consultants?
A: Technically yes, but practically very difficult. Most organizations lack the internal expertise to implement ISO 27001 efficiently. External consultants accelerate the process and reduce the risk of non-conformities at audit. Budget for consulting if you want to achieve certification within 12 months.

Q: What happens if we fail the certification audit?
A: You receive a list of non-conformities and have 60-90 days to address them. After implementing corrective actions, the auditor verifies the fixes. If critical non-conformities remain, you may need a partial re-audit. The certification body charges additional fees for follow-up audits.

Q: Is ISO 27001 mandatory in the Philippines?
A: Not universally mandatory, but increasingly required by specific regulators. BSP requires it for financial institutions. NPC references it for data protection. Many international clients require it as a condition of doing business.

Q: How does ISO 27001 relate to other standards (PCI-DSS, SOC 2)?
A: ISO 27001 is a management system standard. PCI-DSS and SOC 2 are compliance frameworks. They overlap significantly — implementing ISO 27001 covers about 60-70% of PCI-DSS requirements. Organizations often pursue both ISO 27001 and PCI-DSS simultaneously for efficiency.
