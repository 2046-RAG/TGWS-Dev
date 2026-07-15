#!/usr/bin/env node
/**
 * Generate SVG architecture diagrams for TechGuru blog articles.
 * Outputs 10 SVG files to public/images/blog/
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'public', 'images', 'blog');

// Brand colors
const CYAN = '#00D4FF';
const PURPLE = '#7B61FF';
const DARK = '#18181B';
const GRAY = '#71717A';
const LIGHT_GRAY = '#F4F4F5';
const WHITE = '#FFFFFF';

const W = 800;
const H = 450;

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function svgWrap(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <style>
    text { font-family: 'Helvetica Neue', Arial, sans-serif; }
    .title { font-size: 20px; font-weight: 700; fill: ${DARK}; }
    .subtitle { font-size: 12px; fill: ${GRAY}; }
    .node-text { font-size: 13px; font-weight: 600; fill: ${DARK}; }
    .node-sub { font-size: 10px; fill: ${GRAY}; }
    .label { font-size: 11px; font-weight: 600; fill: ${GRAY}; }
    .copyright { font-size: 10px; fill: ${GRAY}; }
    .connector { stroke: ${GRAY}; stroke-width: 1.5; fill: none; }
    .connector-cyan { stroke: ${CYAN}; stroke-width: 2; fill: none; }
    .connector-purple { stroke: ${PURPLE}; stroke-width: 2; fill: none; }
    .connector-dashed { stroke: ${GRAY}; stroke-width: 1.5; fill: none; stroke-dasharray: 6,3; }
    .arrowhead { fill: ${GRAY}; }
    .arrowhead-cyan { fill: ${CYAN}; }
    .arrowhead-purple { fill: ${PURPLE}; }
  </style>
  <defs>
    <marker id="arrowGray" viewBox="0 0 10 6" refX="9" refY="3" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,3 L0,6 Z" class="arrowhead"/>
    </marker>
    <marker id="arrowCyan" viewBox="0 0 10 6" refX="9" refY="3" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,3 L0,6 Z" class="arrowhead-cyan"/>
    </marker>
    <marker id="arrowPurple" viewBox="0 0 10 6" refX="9" refY="3" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,3 L0,6 Z" class="arrowhead-purple"/>
    </marker>
  </defs>
  <rect width="${W}" height="${H}" fill="${WHITE}" rx="8"/>
  ${inner}
  <text x="${W/2}" y="${H - 12}" text-anchor="middle" class="copyright">© TechGuru</text>
</svg>`;
}

function rect(x, y, w, h, fill = WHITE, stroke = '#E4E4E7', rx = 8) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" rx="${rx}"/>`;
}

function rectAccent(x, y, w, h, fill = CYAN, rx = 8) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="${rx}"/>`;
}

function text(x, y, content, cls = 'node-text', anchor = 'middle') {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${content}</text>`;
}

function arrow(x1, y1, x2, y2, marker = 'arrowGray', cls = 'connector') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" marker-end="url(#${marker})"/>`;
}

function dashedArrow(x1, y1, x2, y2, marker = 'arrowGray') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="connector-dashed" marker-end="url(#${marker})"/>`;
}

function cloud(x, y, w, h) {
  // Simple cloud shape using overlapping circles
  const cx = x + w/2, cy = y + h/2;
  return `<g>
    <ellipse cx="${cx-10}" cy="${cy}" rx="${w*0.35}" ry="${h*0.35}" fill="${LIGHT_GRAY}" stroke="#D4D4D8" stroke-width="1.5"/>
    <ellipse cx="${cx+12}" cy="${cy-5}" rx="${w*0.28}" ry="${h*0.3}" fill="${LIGHT_GRAY}" stroke="#D4D4D8" stroke-width="1.5"/>
    <ellipse cx="${cx}" cy="${cy+5}" rx="${w*0.3}" ry="${h*0.25}" fill="${LIGHT_GRAY}" stroke="#D4D4D8" stroke-width="1.5"/>
  </g>`;
}

function diamond(x, y, size) {
  const cx = x, cy = y;
  return `<polygon points="${cx},${cy-size} ${cx+size},${cy} ${cx},${cy+size} ${cx-size},${cy}" fill="${LIGHT_GRAY}" stroke="${PURPLE}" stroke-width="1.5"/>`;
}

// --- Diagram 1: HCI Architecture ---
function hciArchitecture() {
  return svgWrap(`
    <text x="${W/2}" y="35" text-anchor="middle" class="title">HCI Hyperconverged Architecture</text>
    <text x="${W/2}" y="52" text-anchor="middle" class="subtitle">Compute + Storage + Network Converged</text>

    <!-- Main container -->
    ${rect(150, 75, 500, 310, '#FAFAFA', '#D4D4D8', 12)}
    <text x="400" y="100" text-anchor="middle" class="label">HCI APPLIANCE CLUSTER</text>

    <!-- Compute -->
    ${rect(185, 120, 135, 100, WHITE, CYAN)}
    <text x="252" y="148" class="node-text">Compute</text>
    <text x="252" y="165" class="node-sub">vCPU / Memory</text>
    <text x="252" y="180" class="node-sub">VMs / Containers</text>

    <!-- Storage -->
    ${rect(332, 120, 135, 100, WHITE, CYAN)}
    <text x="400" y="148" class="node-text">Storage</text>
    <text x="400" y="165" class="node-sub">Distributed FS</text>
    <text x="400" y="180" class="node-sub">Data Services</text>

    <!-- Network -->
    ${rect(480, 120, 135, 100, WHITE, CYAN)}
    <text x="547" y="148" class="node-text">Network</text>
    <text x="547" y="165" class="node-sub">Virtual Switch</text>
    <text x="547" y="180" class="node-sub">Overlay / VLAN</text>

    <!-- Arrows between pillars -->
    ${arrow(320, 170, 332, 170, 'arrowCyan', 'connector-cyan')}
    ${arrow(467, 170, 480, 170, 'arrowCyan', 'connector-cyan')}

    <!-- Management Layer -->
    ${rect(200, 250, 180, 60, PURPLE + '15', PURPLE)}
    <text x="290" y="278" class="node-text">Centralized Mgmt</text>
    <text x="290" y="293" class="node-sub">Single Pane of Glass</text>

    <!-- Scale-Out Layer -->
    ${rect(420, 250, 180, 60, CYAN + '15', CYAN)}
    <text x="510" y="278" class="node-text">Scale-Out Nodes</text>
    <text x="510" y="293" class="node-sub">Add Nodes as Needed</text>

    <!-- Connectors down -->
    ${arrow(290, 220, 290, 250, 'arrowPurple', 'connector-purple')}
    ${arrow(400, 220, 400, 250, 'arrowCyan', 'connector-cyan')}
    ${arrow(510, 220, 510, 250, 'arrowCyan', 'connector-cyan')}

    <!-- Bottom boxes -->
    ${rect(185, 330, 135, 45, WHITE, '#D4D4D8')}
    <text x="252" y="358" class="node-text">App 1</text>
    ${rect(332, 330, 135, 45, WHITE, '#D4D4D8')}
    <text x="400" y="358" class="node-text">App 2</text>
    ${rect(480, 330, 135, 45, WHITE, '#D4D4D8')}
    <text x="547" y="358" class="node-text">App 3</text>

    ${arrow(252, 310, 252, 330, 'arrowGray')}
    ${arrow(400, 310, 400, 330, 'arrowGray')}
    ${arrow(547, 310, 547, 330, 'arrowGray')}
  `);
}

// --- Diagram 2: Zero Trust ---
function zeroTrust() {
  return svgWrap(`
    <text x="${W/2}" y="35" text-anchor="middle" class="title">Zero Trust Network Architecture</text>
    <text x="${W/2}" y="52" text-anchor="middle" class="subtitle">Never Trust, Always Verify</text>

    <!-- User -->
    ${rect(50, 170, 100, 80, LIGHT_GRAY, '#D4D4D8')}
    <text x="100" y="205" class="node-text">User</text>
    <text x="100" y="220" class="node-sub">Device</text>

    <!-- Step 1: Identity -->
    ${rect(200, 100, 120, 70, CYAN + '20', CYAN)}
    <text x="260" y="130" class="node-text">Identity</text>
    <text x="260" y="145" class="node-sub">MFA / SSO</text>

    <!-- Step 2: Device -->
    ${rect(370, 100, 120, 70, PURPLE + '20', PURPLE)}
    <text x="430" y="130" class="node-text">Device</text>
    <text x="430" y="145" class="node-sub">Health Check</text>

    <!-- Step 3: App Access -->
    ${rect(540, 100, 120, 70, CYAN + '20', CYAN)}
    <text x="600" y="130" class="node-text">App Access</text>
    <text x="600" y="145" class="node-sub">Micro-Seg</text>

    <!-- Step 4: Data Protection -->
    ${rect(690, 170, 100, 80, PURPLE + '20', PURPLE)}
    <text x="740" y="205" class="node-text">Data</text>
    <text x="740" y="220" class="node-sub">Protect</text>

    <!-- Arrows flow -->
    ${arrow(150, 210, 200, 145, 'arrowCyan', 'connector-cyan')}
    ${arrow(320, 135, 370, 135, 'arrowPurple', 'connector-purple')}
    ${arrow(490, 135, 540, 135, 'arrowCyan', 'connector-cyan')}
    ${arrow(660, 135, 690, 195, 'arrowPurple', 'connector-purple')}

    <!-- Policy Engine -->
    ${rect(280, 210, 240, 60, '#FAFAFA', DARK)}
    <text x="400" y="238" class="node-text">Policy Decision Point</text>
    <text x="400" y="253" class="node-sub">Continuous Evaluation</text>

    <!-- Arrows to policy -->
    ${dashedArrow(260, 170, 370, 210, 'arrowGray')}
    ${dashedArrow(430, 170, 430, 210, 'arrowGray')}

    <!-- Bottom: Resources -->
    ${rect(100, 320, 150, 50, WHITE, CYAN)}
    <text x="175" y="350" class="node-text">Cloud Apps</text>

    ${rect(300, 320, 150, 50, WHITE, CYAN)}
    <text x="375" y="350" class="node-text">On-Prem Apps</text>

    ${rect(500, 320, 150, 50, WHITE, CYAN)}
    <text x="575" y="350" class="node-text">Data Stores</text>

    ${arrow(340, 270, 175, 320, 'arrowCyan', 'connector-cyan')}
    ${arrow(400, 270, 375, 320, 'arrowCyan', 'connector-cyan')}
    ${arrow(460, 270, 575, 320, 'arrowCyan', 'connector-cyan')}

    <!-- Log box -->
    ${rect(620, 290, 140, 80, LIGHT_GRAY, '#D4D4D8')}
    <text x="690" y="320" class="node-text">SIEM / Log</text>
    <text x="690" y="335" class="node-sub">Analytics</text>
    <text x="690" y="350" class="node-sub">Audit Trail</text>
  `);
}

// --- Diagram 3: FortiGate Deployment ---
function fortigateDeployment() {
  return svgWrap(`
    <text x="${W/2}" y="35" text-anchor="middle" class="title">FortiGate Firewall Deployment</text>
    <text x="${W/2}" y="52" text-anchor="middle" class="subtitle">Internet → FortiGate → DMZ → Internal</text>

    <!-- Internet Cloud -->
    ${cloud(50, 150, 120, 100)}
    <text x="110" y="205" text-anchor="middle" class="node-text">Internet</text>

    <!-- FortiGate -->
    ${rect(230, 130, 130, 140, CYAN + '15', CYAN)}
    <text x="295" y="165" class="node-text">FortiGate</text>
    <text x="295" y="182" class="node-sub">NGFW</text>
    <text x="295" y="197" class="node-sub">IPS / AV</text>
    <text x="295" y="212" class="node-sub">SSL Inspect</text>
    <text x="295" y="227" class="node-sub">VPN</text>

    <!-- DMZ -->
    ${rect(420, 100, 150, 80, PURPLE + '15', PURPLE)}
    <text x="495" y="130" class="node-text">DMZ</text>
    <text x="495" y="148" class="node-sub">Web Servers</text>
    <text x="495" y="163" class="node-sub">Mail Gateway</text>

    <!-- Internal Network -->
    ${rect(640, 100, 140, 80, WHITE, DARK)}
    <text x="710" y="130" class="node-text">Internal LAN</text>
    <text x="710" y="148" class="node-sub">Users</text>
    <text x="710" y="163" class="node-sub">Applications</text>

    <!-- Servers -->
    ${rect(640, 210, 140, 60, WHITE, DARK)}
    <text x="710" y="238" class="node-text">Servers</text>
    <text x="710" y="253" class="node-sub">DB / ERP</text>

    <!-- Arrows -->
    ${arrow(170, 200, 230, 200, 'arrowCyan', 'connector-cyan')}
    ${arrow(360, 175, 420, 145, 'arrowPurple', 'connector-purple')}
    ${arrow(360, 200, 640, 145, 'arrowCyan', 'connector-cyan')}
    ${arrow(640, 240, 710, 210, 'arrowGray')}

    <!-- Zones label -->
    <text x="295" y="120" text-anchor="middle" class="label">Zone: Untrusted</text>
    <text x="495" y="90" text-anchor="middle" class="label">Zone: DMZ</text>
    <text x="710" y="90" text-anchor="middle" class="label">Zone: Trusted</text>

    <!-- Security policies -->
    ${rect(250, 310, 100, 40, '#FEF3C7', '#F59E0B')}
    <text x="300" y="335" text-anchor="middle" class="node-sub" style="fill:#92400E">IPS Scan</text>

    ${rect(370, 310, 100, 40, '#FEF3C7', '#F59E0B')}
    <text x="420" y="335" text-anchor="middle" class="node-sub" style="fill:#92400E">App Control</text>

    ${rect(490, 310, 100, 40, '#FEF3C7', '#F59E0B')}
    <text x="540" y="335" text-anchor="middle" class="node-sub" style="fill:#92400E">Web Filter</text>

    ${arrow(295, 270, 295, 310, 'arrowGray')}
    ${arrow(420, 270, 420, 310, 'arrowGray')}
    ${arrow(540, 270, 540, 310, 'arrowGray')}

    <text x="420" y="295" text-anchor="middle" class="label">Security Profiles</text>
  `);
}

// --- Diagram 4: Disaster Recovery ---
function disasterRecovery() {
  return svgWrap(`
    <text x="${W/2}" y="35" text-anchor="middle" class="title">Disaster Recovery Architecture</text>
    <text x="${W/2}" y="52" text-anchor="middle" class="subtitle">Primary → Replicate → DR Site</text>

    <!-- Primary Site -->
    ${rect(50, 80, 220, 240, WHITE, CYAN, 12)}
    <text x="160" y="105" text-anchor="middle" class="label" style="fill:${CYAN}">PRIMARY SITE</text>

    ${rect(75, 120, 170, 40, CYAN + '15', CYAN)}
    <text x="160" y="145" class="node-text">App Servers</text>

    ${rect(75, 175, 170, 40, WHITE, '#D4D4D8')}
    <text x="160" y="200" class="node-text">Database</text>

    ${rect(75, 230, 170, 40, WHITE, '#D4D4D8')}
    <text x="160" y="255" class="node-text">Storage</text>

    <!-- Replication arrows -->
    ${arrow(270, 140, 370, 140, 'arrowCyan', 'connector-cyan')}
    ${arrow(270, 195, 370, 195, 'arrowPurple', 'connector-purple')}
    ${arrow(270, 250, 370, 250, 'arrowCyan', 'connector-cyan')}

    <!-- Replication labels -->
    <text x="320" y="132" text-anchor="middle" class="label">Async</text>
    <text x="320" y="187" text-anchor="middle" class="label">Sync</text>
    <text x="320" y="242" text-anchor="middle" class="label">Async</text>

    <!-- DR Site -->
    ${rect(370, 80, 220, 240, WHITE, PURPLE, 12)}
    <text x="480" y="105" text-anchor="middle" class="label" style="fill:${PURPLE}">DR SITE</text>

    ${rect(395, 120, 170, 40, PURPLE + '15', PURPLE)}
    <text x="480" y="145" class="node-text">Standby Servers</text>

    ${rect(395, 175, 170, 40, WHITE, '#D4D4D8')}
    <text x="480" y="200" class="node-text">Replica DB</text>

    ${rect(395, 230, 170, 40, WHITE, '#D4D4D8')}
    <text x="480" y="255" class="node-text">Backup Storage</text>

    <!-- Monitoring -->
    ${rect(650, 130, 130, 80, LIGHT_GRAY, '#D4D4D8')}
    <text x="715" y="160" class="node-text">Monitoring</text>
    <text x="715" y="175" class="node-sub">Failover</text>
    <text x="715" y="190" class="node-sub">Alerting</text>

    ${dashedArrow(590, 170, 650, 170, 'arrowGray')}

    <!-- Failover -->
    ${rect(150, 350, 200, 50, CYAN + '15', CYAN)}
    <text x="250" y="380" class="node-text">RTO: &lt; 1 Hour</text>

    ${rect(400, 350, 200, 50, PURPLE + '15', PURPLE)}
    <text x="500" y="380" class="node-text">RPO: &lt; 15 Minutes</text>

    ${arrow(480, 320, 250, 350, 'arrowGray')}
    ${arrow(480, 320, 500, 350, 'arrowGray')}
  `);
}

// --- Diagram 5: SD-WAN ---
function sdwanArchitecture() {
  return svgWrap(`
    <text x="${W/2}" y="35" text-anchor="middle" class="title">SD-WAN Multi-Site Architecture</text>
    <text x="${W/2}" y="52" text-anchor="middle" class="subtitle">HQ → SD-WAN Fabric → Branches</text>

    <!-- HQ -->
    ${rect(320, 75, 160, 70, CYAN + '15', CYAN)}
    <text x="400" y="105" class="node-text">Headquarters</text>
    <text x="400" y="120" class="node-sub">Data Center</text>

    <!-- SD-WAN overlay -->
    ${rect(150, 175, 500, 60, PURPLE + '10', PURPLE, 12)}
    <text x="400" y="200" text-anchor="middle" class="node-text" style="fill:${PURPLE}">SD-WAN Overlay Network</text>
    <text x="400" y="218" text-anchor="middle" class="node-sub">MPLS / Internet / LTE</text>

    <!-- Branch 1 -->
    ${rect(60, 290, 140, 60, WHITE, CYAN)}
    <text x="130" y="318" class="node-text">Branch 1</text>
    <text x="130" y="333" class="node-sub">Manila</text>

    <!-- Branch 2 -->
    ${rect(240, 290, 140, 60, WHITE, CYAN)}
    <text x="310" y="318" class="node-text">Branch 2</text>
    <text x="310" y="333" class="node-sub">Cebu</text>

    <!-- Branch 3 -->
    ${rect(420, 290, 140, 60, WHITE, CYAN)}
    <text x="490" y="318" class="node-text">Branch 3</text>
    <text x="490" y="333" class="node-sub">Davao</text>

    <!-- Cloud Apps -->
    ${rect(600, 290, 140, 60, WHITE, PURPLE)}
    <text x="670" y="318" class="node-text">Cloud / SaaS</text>
    <text x="670" y="333" class="node-sub">Azure / AWS</text>

    <!-- Arrows -->
    ${arrow(400, 145, 400, 175, 'arrowCyan', 'connector-cyan')}
    ${arrow(300, 235, 130, 290, 'arrowGray')}
    ${arrow(350, 235, 310, 290, 'arrowGray')}
    ${arrow(450, 235, 490, 290, 'arrowGray')}
    ${arrow(520, 235, 670, 290, 'arrowPurple', 'connector-purple')}

    <!-- WAN links -->
    <text x="130" y="275" text-anchor="middle" class="label">Internet</text>
    <text x="310" y="275" text-anchor="middle" class="label">MPLS</text>
    <text x="490" y="275" text-anchor="middle" class="label">Internet</text>
    <text x="640" y="275" text-anchor="middle" class="label">Direct</text>

    <!-- Features -->
    ${rect(180, 380, 120, 35, '#ECFDF5', '#10B981')}
    <text x="240" y="403" text-anchor="middle" class="node-sub" style="fill:#065F46">App-Aware Routing</text>

    ${rect(320, 380, 120, 35, '#ECFDF5', '#10B981')}
    <text x="380" y="403" text-anchor="middle" class="node-sub" style="fill:#065F46">Zero-Touch Provision</text>

    ${rect(460, 380, 120, 35, '#ECFDF5', '#10B981')}
    <text x="520" y="403" text-anchor="middle" class="node-sub" style="fill:#065F46">Centralized Control</text>
  `);
}

// --- Diagram 6: AI Adoption ---
function aiAdoption() {
  return svgWrap(`
    <text x="${W/2}" y="35" text-anchor="middle" class="title">AI Adoption Roadmap</text>
    <text x="${W/2}" y="52" text-anchor="middle" class="subtitle">From Foundation to Autonomous Agents</text>

    <!-- Phase 1: Foundation -->
    ${rect(50, 100, 140, 90, CYAN + '15', CYAN)}
    <text x="120" y="130" class="node-text">AI Foundation</text>
    <text x="120" y="148" class="node-sub">Data Readiness</text>
    <text x="120" y="163" class="node-sub">Infrastructure</text>
    <text x="120" y="178" class="node-sub">Governance</text>

    <!-- Phase 2: Use Cases -->
    ${rect(240, 80, 180, 130, WHITE, DARK)}
    <text x="330" y="105" text-anchor="middle" class="label">USE CASES</text>

    ${rect(255, 115, 70, 40, CYAN + '15', CYAN)}
    <text x="290" y="140" text-anchor="middle" class="node-sub">AIGC</text>

    ${rect(335, 115, 70, 40, PURPLE + '15', PURPLE)}
    <text x="370" y="140" text-anchor="middle" class="node-sub">AI Coding</text>

    ${rect(255, 165, 70, 40, '#FEF3C7', '#F59E0B')}
    <text x="290" y="190" text-anchor="middle" class="node-sub" style="fill:#92400E">Legacy Modern</text>

    ${rect(335, 165, 70, 40, '#ECFDF5', '#10B981')}
    <text x="370" y="190" text-anchor="middle" class="node-sub" style="fill:#065F46">Analytics</text>

    <!-- Phase 3: Agent -->
    ${rect(490, 100, 140, 90, PURPLE + '15', PURPLE)}
    <text x="560" y="130" class="node-text">AI Agents</text>
    <text x="560" y="148" class="node-sub">Autonomous</text>
    <text x="560" y="163" class="node-sub">Multi-Step</text>
    <text x="560" y="178" class="node-sub">Tool-Using</text>

    <!-- Phase 4: Transformation -->
    ${rect(680, 100, 90, 90, DARK, DARK)}
    <text x="725" y="135" text-anchor="middle" class="node-text" style="fill:${WHITE}">Biz</text>
    <text x="725" y="152" text-anchor="middle" class="node-text" style="fill:${WHITE}">Transform</text>

    <!-- Arrows -->
    ${arrow(190, 145, 240, 145, 'arrowCyan', 'connector-cyan')}
    ${arrow(420, 145, 490, 145, 'arrowPurple', 'connector-purple')}
    ${arrow(630, 145, 680, 145, 'arrowGray')}

    <!-- Bottom timeline -->
    ${rect(80, 280, 640, 3, LIGHT_GRAY, LIGHT_GRAY, 2)}

    <circle cx="120" cy="281" r="6" fill="${CYAN}"/>
    <text x="120" y="305" text-anchor="middle" class="label">Month 1-3</text>

    <circle cx="330" cy="281" r="6" fill="${DARK}"/>
    <text x="330" y="305" text-anchor="middle" class="label">Month 4-9</text>

    <circle cx="560" cy="281" r="6" fill="${PURPLE}"/>
    <text x="560" y="305" text-anchor="middle" class="label">Month 10-15</text>

    <circle cx="725" cy="281" r="6" fill="${DARK}"/>
    <text x="725" y="305" text-anchor="middle" class="label">Month 16+</text>

    <!-- ROI -->
    ${rect(150, 340, 500, 45, LIGHT_GRAY, '#D4D4D8', 8)}
    <text x="400" y="368" text-anchor="middle" class="node-sub" style="fill:${DARK}">Expected ROI: 3-5x within 18 months with proper governance & change management</text>
  `);
}

// --- Diagram 7: EDR/XDR ---
function edrXdr() {
  return svgWrap(`
    <text x="${W/2}" y="35" text-anchor="middle" class="title">Endpoint Security Architecture</text>
    <text x="${W/2}" y="52" text-anchor="middle" class="subtitle">EDR → XDR → MDR Layered Defense</text>

    <!-- Layer 1: EDR -->
    ${rect(80, 80, 200, 250, CYAN + '10', CYAN, 12)}
    <text x="180" y="108" text-anchor="middle" class="label" style="fill:${CYAN}">EDR LAYER</text>

    ${rect(100, 120, 160, 35, WHITE, '#D4D4D8')}
    <text x="180" y="143" class="node-sub">Endpoint Detection</text>

    ${rect(100, 165, 160, 35, WHITE, '#D4D4D8')}
    <text x="180" y="188" class="node-sub">Real-time Monitoring</text>

    ${rect(100, 210, 160, 35, WHITE, '#D4D4D8')}
    <text x="180" y="233" class="node-sub">Threat Containment</text>

    ${rect(100, 255, 160, 35, WHITE, '#D4D4D8')}
    <text x="180" y="278" class="node-sub">Forensics</text>

    <!-- Layer 2: XDR -->
    ${rect(320, 80, 200, 250, PURPLE + '10', PURPLE, 12)}
    <text x="420" y="108" text-anchor="middle" class="label" style="fill:${PURPLE}">XDR LAYER</text>

    ${rect(340, 120, 160, 35, WHITE, '#D4D4D8')}
    <text x="420" y="143" class="node-sub">Cross-Layer Correlation</text>

    ${rect(340, 165, 160, 35, WHITE, '#D4D4D8')}
    <text x="420" y="188" class="node-sub">Network + Endpoint</text>

    ${rect(340, 210, 160, 35, WHITE, '#D4D4D8')}
    <text x="420" y="233" class="node-sub">Cloud Workload</text>

    ${rect(340, 255, 160, 35, WHITE, '#D4D4D8')}
    <text x="420" y="278" class="node-sub">Identity Context</text>

    <!-- Layer 3: MDR -->
    ${rect(560, 80, 200, 250, DARK + '10', DARK, 12)}
    <text x="660" y="108" text-anchor="middle" class="label" style="fill:${DARK}">MDR LAYER</text>

    ${rect(580, 120, 160, 35, WHITE, '#D4D4D8')}
    <text x="660" y="143" class="node-sub">24/7 SOC Monitoring</text>

    ${rect(580, 165, 160, 35, WHITE, '#D4D4D8')}
    <text x="660" y="188" class="node-sub">Expert Analysis</text>

    ${rect(580, 210, 160, 35, WHITE, '#D4D4D8')}
    <text x="660" y="233" class="node-sub">Incident Response</text>

    ${rect(580, 255, 160, 35, WHITE, '#D4D4D8')}
    <text x="660" y="278" class="node-sub">Threat Hunting</text>

    <!-- Connectors -->
    ${arrow(280, 205, 320, 205, 'arrowCyan', 'connector-cyan')}
    ${arrow(520, 205, 560, 205, 'arrowPurple', 'connector-purple')}

    <!-- Bottom -->
    ${rect(150, 355, 500, 40, LIGHT_GRAY, '#D4D4D8', 8)}
    <text x="400" y="380" text-anchor="middle" class="node-sub" style="fill:${DARK}">Each layer adds depth: EDR (endpoints) → XDR (cross-domain) → MDR (human expertise)</text>
  `);
}

// --- Diagram 8: Cloud Migration 6R ---
function cloudMigration() {
  return svgWrap(`
    <text x="${W/2}" y="35" text-anchor="middle" class="title">Cloud Migration 6R Strategy</text>
    <text x="${W/2}" y="52" text-anchor="middle" class="subtitle">AWS Migration Framework</text>

    <!-- Source -->
    ${rect(30, 100, 120, 60, LIGHT_GRAY, '#D4D4D8')}
    <text x="90" y="128" class="node-text">On-Prem</text>
    <text x="90" y="143" class="node-sub">Workloads</text>

    <!-- 6 Strategies -->
    ${rect(200, 75, 105, 55, CYAN + '15', CYAN)}
    <text x="252" y="100" class="node-text">Rehost</text>
    <text x="252" y="115" class="node-sub">Lift & Shift</text>

    ${rect(315, 75, 105, 55, PURPLE + '15', PURPLE)}
    <text x="367" y="100" class="node-text">Replatform</text>
    <text x="367" y="115" class="node-sub">Optimize</text>

    ${rect(430, 75, 105, 55, '#ECFDF5', '#10B981')}
    <text x="482" y="100" class="node-text" style="fill:#065F46">Refactor</text>
    <text x="482" y="115" class="node-sub" style="fill:#065F46">Re-architect</text>

    ${rect(200, 150, 105, 55, '#FEF3C7', '#F59E0B')}
    <text x="252" y="175" class="node-text" style="fill:#92400E">Retire</text>
    <text x="252" y="190" class="node-sub" style="fill:#92400E">Decommission</text>

    ${rect(315, 150, 105, 55, LIGHT_GRAY, '#D4D4D8')}
    <text x="367" y="175" class="node-text">Retain</text>
    <text x="367" y="190" class="node-sub">Keep On-Prem</text>

    ${rect(430, 150, 105, 55, WHITE, DARK)}
    <text x="482" y="175" class="node-text">Repurchase</text>
    <text x="482" y="190" class="node-sub">SaaS Replace</text>

    <!-- Arrows from source -->
    ${arrow(150, 115, 200, 100, 'arrowGray')}
    ${arrow(150, 125, 200, 125, 'arrowGray')}
    ${arrow(150, 135, 200, 175, 'arrowGray')}

    <!-- Target: Cloud -->
    ${rect(590, 95, 180, 130, CYAN + '10', CYAN, 12)}
    <text x="680" y="125" text-anchor="middle" class="node-text">Cloud</text>
    <text x="680" y="145" text-anchor="middle" class="node-sub">AWS / Azure</text>
    <text x="680" y="165" text-anchor="middle" class="node-sub">Managed Services</text>
    <text x="680" y="185" text-anchor="middle" class="node-sub">Scalable Infra</text>

    <!-- Arrows to cloud -->
    ${arrow(305, 100, 590, 120, 'arrowCyan', 'connector-cyan')}
    ${arrow(420, 100, 590, 130, 'arrowPurple', 'connector-purple')}
    ${arrow(535, 100, 590, 140, 'arrowCyan', 'connector-cyan')}

    <!-- Bottom: Decision factors -->
    ${rect(100, 280, 600, 60, LIGHT_GRAY, '#D4D4D8', 8)}
    <text x="400" y="305" text-anchor="middle" class="label">Decision Factors</text>
    <text x="400" y="322" text-anchor="middle" class="node-sub" style="fill:${DARK}">Business Value • Technical Complexity • Cost • Timeline • Risk</text>

    <!-- Effort arrows -->
    <text x="252" y="240" text-anchor="middle" class="label">Low Effort</text>
    <text x="482" y="240" text-anchor="middle" class="label">High Value</text>
  `);
}

// --- Diagram 9: Hybrid Cloud ---
function hybridCloud() {
  return svgWrap(`
    <text x="${W/2}" y="35" text-anchor="middle" class="title">Hybrid Cloud Architecture</text>
    <text x="${W/2}" y="52" text-anchor="middle" class="subtitle">On-Premises + AWS / Azure Connected</text>

    <!-- On-Prem -->
    ${rect(40, 80, 300, 230, WHITE, CYAN, 12)}
    <text x="190" y="105" text-anchor="middle" class="label" style="fill:${CYAN}">ON-PREMISES</text>

    ${rect(60, 120, 120, 50, CYAN + '15', CYAN)}
    <text x="120" y="150" class="node-text">VMware</text>

    ${rect(200, 120, 120, 50, WHITE, '#D4D4D8')}
    <text x="260" y="150" class="node-text">SAN Storage</text>

    ${rect(60, 190, 120, 50, WHITE, '#D4D4D8')}
    <text x="120" y="220" class="node-text">Legacy Apps</text>

    ${rect(200, 190, 120, 50, WHITE, '#D4D4D8')}
    <text x="260" y="220" class="node-text">Databases</text>

    <!-- Connection -->
    ${rect(370, 130, 60, 60, PURPLE + '20', PURPLE)}
    <text x="400" y="158" text-anchor="middle" class="node-text" style="font-size:11px">VPN</text>
    <text x="400" y="173" text-anchor="middle" class="node-sub">/ ExpressRoute</text>

    ${arrow(340, 160, 370, 160, 'arrowPurple', 'connector-purple')}
    ${arrow(430, 160, 460, 160, 'arrowPurple', 'connector-purple')}

    <!-- Cloud -->
    ${rect(460, 80, 310, 230, WHITE, PURPLE, 12)}
    <text x="615" y="105" text-anchor="middle" class="label" style="fill:${PURPLE}">CLOUD (AWS / Azure)</text>

    ${rect(480, 120, 130, 50, PURPLE + '15', PURPLE)}
    <text x="545" y="150" class="node-text">Compute</text>

    ${rect(630, 120, 120, 50, WHITE, '#D4D4D8')}
    <text x="690" y="150" class="node-text">S3 / Blob</text>

    ${rect(480, 190, 130, 50, WHITE, '#D4D4D8')}
    <text x="545" y="220" class="node-text">Containers</text>

    ${rect(630, 190, 120, 50, WHITE, '#D4D4D8')}
    <text x="690" y="220" class="node-text">Managed DB</text>

    <!-- Bottom: Use Cases -->
    ${rect(80, 340, 200, 45, LIGHT_GRAY, '#D4D4D8')}
    <text x="180" y="368" text-anchor="middle" class="node-sub" style="fill:${DARK}">Data Residency • Low Latency</text>

    ${rect(310, 340, 180, 45, LIGHT_GRAY, '#D4D4D8')}
    <text x="400" y="368" text-anchor="middle" class="node-sub" style="fill:${DARK}">Burst Capacity • Dev/Test</text>

    ${rect(520, 340, 200, 45, LIGHT_GRAY, '#D4D4D8')}
    <text x="620" y="368" text-anchor="middle" class="node-sub" style="fill:${DARK}">Disaster Recovery • SaaS</text>
  `);
}

// --- Diagram 10: Network Segmentation ---
function networkSegmentation() {
  return svgWrap(`
    <text x="${W/2}" y="35" text-anchor="middle" class="title">Network Segmentation Architecture</text>
    <text x="${W/2}" y="52" text-anchor="middle" class="subtitle">Micro-Segmentation by Security Zone</text>

    <!-- Firewall center -->
    ${rect(340, 80, 120, 50, CYAN + '15', CYAN)}
    <text x="400" y="110" class="node-text">Firewall</text>

    <!-- Office Zone -->
    ${rect(50, 160, 160, 110, CYAN + '10', CYAN, 10)}
    <text x="130" y="185" text-anchor="middle" class="label" style="fill:${CYAN}">OFFICE ZONE</text>
    ${rect(65, 195, 130, 30, WHITE, '#D4D4D8')}
    <text x="130" y="215" text-anchor="middle" class="node-sub">User Workstations</text>
    ${rect(65, 230, 130, 30, WHITE, '#D4D4D8')}
    <text x="130" y="250" text-anchor="middle" class="node-sub">Printers / VoIP</text>

    <!-- Server Zone -->
    ${rect(260, 160, 160, 110, PURPLE + '10', PURPLE, 10)}
    <text x="340" y="185" text-anchor="middle" class="label" style="fill:${PURPLE}">SERVER ZONE</text>
    <rect x="275" y="195" width="130" height="30" fill="${WHITE}" stroke="#D4D4D8" rx="4"/>
    <text x="340" y="215" text-anchor="middle" class="node-sub">App Servers</text>
    <rect x="275" y="230" width="130" height="30" fill="${WHITE}" stroke="#D4D4D8" rx="4"/>
    <text x="340" y="250" text-anchor="middle" class="node-sub">Database</text>

    <!-- DMZ -->
    ${rect(470, 160, 160, 110, '#FEF3C7', '#F59E0B', 10)}
    <text x="550" y="185" text-anchor="middle" class="label" style="fill:#92400E">DMZ</text>
    <rect x="485" y="195" width="130" height="30" fill="${WHITE}" stroke="#D4D4D8" rx="4"/>
    <text x="550" y="215" text-anchor="middle" class="node-sub">Web Servers</text>
    <rect x="485" y="230" width="130" height="30" fill="${WHITE}" stroke="#D4D4D8" rx="4"/>
    <text x="550" y="250" text-anchor="middle" class="node-sub">Mail Gateway</text>

    <!-- Guest Zone -->
    ${rect(660, 160, 120, 110, LIGHT_GRAY, '#D4D4D8', 10)}
    <text x="720" y="185" text-anchor="middle" class="label">GUEST ZONE</text>
    <rect x="675" y="195" width="90" height="30" fill="${WHITE}" stroke="#D4D4D8" rx="4"/>
    <text x="720" y="215" text-anchor="middle" class="node-sub">Wi-Fi Only</text>
    <rect x="675" y="230" width="90" height="30" fill="${WHITE}" stroke="#D4D4D8" rx="4"/>
    <text x="720" y="250" text-anchor="middle" class="node-sub">Internet Only</text>

    <!-- Arrows from firewall -->
    ${arrow(380, 130, 130, 160, 'arrowCyan', 'connector-cyan')}
    ${arrow(395, 130, 340, 160, 'arrowPurple', 'connector-purple')}
    ${arrow(410, 130, 550, 160, 'arrowGray')}
    ${arrow(440, 130, 720, 160, 'arrowGray')}

    <!-- Zone policies -->
    ${rect(100, 310, 600, 55, LIGHT_GRAY, '#D4D4D8', 8)}
    <text x="400" y="333" text-anchor="middle" class="label">Zone-Based Firewall Policies</text>
    <text x="400" y="350" text-anchor="middle" class="node-sub" style="fill:${DARK}">Office↔Server: Allow | Office↔DMZ: Allow (80/443) | Guest: Internet Only | Server↔DMZ: Restricted</text>
  `);
}

// --- Main ---
const diagrams = [
  { file: 'hci-architecture.svg', generate: hciArchitecture },
  { file: 'zero-trust.svg', generate: zeroTrust },
  { file: 'fortigate-deployment.svg', generate: fortigateDeployment },
  { file: 'disaster-recovery.svg', generate: disasterRecovery },
  { file: 'sdwan-architecture.svg', generate: sdwanArchitecture },
  { file: 'ai-adoption.svg', generate: aiAdoption },
  { file: 'edr-xdr.svg', generate: edrXdr },
  { file: 'cloud-migration.svg', generate: cloudMigration },
  { file: 'hybrid-cloud.svg', generate: hybridCloud },
  { file: 'network-segmentation.svg', generate: networkSegmentation },
];

ensureDir(OUTPUT_DIR);

let success = 0;
let failed = 0;

for (const { file, generate } of diagrams) {
  try {
    const svg = generate();
    const filePath = join(OUTPUT_DIR, file);
    writeFileSync(filePath, svg, 'utf-8');
    const size = Buffer.byteLength(svg, 'utf-8');
    console.log(`✅ ${file} (${(size / 1024).toFixed(1)} KB)`);
    success++;
  } catch (err) {
    console.error(`❌ ${file}: ${err.message}`);
    failed++;
  }
}

console.log(`\nDone: ${success} generated, ${failed} failed`);
console.log(`Output: ${OUTPUT_DIR}`);
