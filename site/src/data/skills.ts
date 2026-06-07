export type Badge = 'verified' | 'source' | 'preview';

export const BADGES: Record<Badge, { label: string; cls: string; tip: string }> = {
  verified: {
    label: '✅ verified',
    cls: 'text-ok border-ok/30 bg-ok/10',
    tip: 'Compiles on Daml SDK 3.4.11 and/or confirmed by building a real app against it.',
  },
  source: {
    label: '🔎 source-verified',
    cls: 'text-warn border-warn/30 bg-warn/10',
    tip: 'Identifiers checked against Splice / npm source; not yet run on a live registry/wallet.',
  },
  preview: {
    label: '🧪 preview',
    cls: 'text-preview border-preview/30 bg-preview/10',
    tip: 'Corroborated across official docs + whitepaper but pre-MainNet; not run against a live env.',
  },
};

export interface Skill {
  name: string;
  blurb: string;
  badge: Badge;
}

export interface Track {
  title: string;
  skills: Skill[];
}

export const TRACKS: Track[] = [
  {
    title: 'Foundations',
    skills: [
      { name: 'canton-mental-models', badge: 'verified', blurb: 'Corrects the EVM-brain defaults — the foundation every other skill builds on. Now VM-agnostic (Daml + Zenith/Solidity).' },
    ],
  },
  {
    title: 'Daml modeling',
    skills: [
      { name: 'daml-language', badge: 'verified', blurb: 'Write Daml: templates, choices, interfaces, stdlib — and why contract keys are not supported on Canton 3.x.' },
      { name: 'daml-authorization-patterns', badge: 'verified', blurb: 'Signatory/observer/controller modeling and multi-party authority composition (incl. nested-exercise authority).' },
      { name: 'daml-testing', badge: 'verified', blurb: 'Daml Script suites: ledger assertions, submitMustFail for authorization, privacy via party-scoped query.' },
      { name: 'daml-contract-upgrades', badge: 'verified', blurb: 'Smart-contract upgrades: compatibility rules, package naming/selection — built & breaking-tested on real SDK.' },
    ],
  },
  {
    title: 'App integration',
    skills: [
      { name: 'canton-ledger-api', badge: 'verified', blurb: 'gRPC + JSON Ledger API, codegen bindings, command dedup, contract disclosure — with the v2 binding gotchas.' },
      { name: 'canton-app-architecture', badge: 'verified', blurb: 'Fully-mediated topology: backend, frontend, PQS read model, SDK selection, transcode codegen wiring.' },
      { name: 'canton-token-standard', badge: 'source', blurb: 'Token Standard (CIP-0056): transfers, Canton Coin / Amulet, Splice — verified against the splice source.' },
    ],
  },
  {
    title: 'Ops & lifecycle',
    skills: [
      { name: 'canton-deployment', badge: 'verified', blurb: 'LocalNet → DevNet, party & package management, CI/CD — plus the operational reality (LocalNet needs ~32 GB).' },
      { name: 'canton-production-ops', badge: 'verified', blurb: 'Error categories + retry logic, JWT/TLS/KMS hardening, idempotent commandId, monitoring.' },
      { name: 'canton-wallet-integration', badge: 'source', blurb: 'dApp SDK, Wallet SDK, external party signing, exchange integration — verified against @canton-network npm.' },
    ],
  },
  {
    title: 'EVM / Zenith',
    skills: [
      { name: 'canton-evm', badge: 'preview', blurb: 'EVM/Solidity on Canton via Zenith: external_call atomic composability, mandatory determinism, Daml interop.' },
    ],
  },
];

export const ALL_SKILLS = TRACKS.flatMap((t) => t.skills);
export const SKILL_COUNT = ALL_SKILLS.length;
export const REPO = 'TechnicallyKiller/Canton-Skills';
export const INSTALL = `npx skills add ${REPO}`;
