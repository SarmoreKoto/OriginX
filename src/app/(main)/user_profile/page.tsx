// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import Image from 'next/image';
// import { apiHandler } from '@/handler/api_handler';
// import { MetaApi } from '@/config/metaApi';

// interface UserProfile {
//   _id: string;
//   name: string;
//   email: string;
//   phone: string;
//   role: string;
//   status: string;
//   avatar?: string;
//   createdAt?: string;
//   updatedAt?: string;
//   bio?: string;
//   jobTitle?: string;
//   website?: string;
//   username?: string;
// }

// interface EditState {
//   name: string;
//   email: string;
//   phone: string;
//   bio: string;
//   jobTitle: string;
//   website: string;
//   username: string;
// }

// /* ─── Inline styles (no Tailwind required beyond utilities) ─── */
// const styles = `
//   @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

//   :root {
//     --cream: #faf8f4;
//     --cream-mid: #f3efe8;
//     --cream-border: #e8e2d9;
//     --ink: #1a1714;
//     --ink-mid: #3d3730;
//     --ink-muted: #8a8278;
//     --ink-faint: #b8b2a8;
//     --gold: #c49a3c;
//     --gold-light: #f5ecd7;
//     --emerald: #2d6a4f;
//     --emerald-light: #d8f3e8;
//     --rose: #9b2335;
//     --rose-light: #fde8eb;
//     --sapphire: #1e3a5f;
//     --sapphire-light: #ddeaf7;
//     --shadow-soft: 0 2px 16px rgba(26,23,20,0.06), 0 1px 4px rgba(26,23,20,0.04);
//     --shadow-card: 0 4px 32px rgba(26,23,20,0.08), 0 1px 6px rgba(26,23,20,0.05);
//     --shadow-lift: 0 12px 48px rgba(26,23,20,0.12), 0 2px 8px rgba(26,23,20,0.06);
//     --radius: 16px;
//     --radius-sm: 10px;
//   }

//   .profile-root * { box-sizing: border-box; }

//   .profile-root {
//     font-family: 'DM Sans', sans-serif;
//     background: var(--cream);
//     min-height: 100vh;
//     color: var(--ink);
//   }

//   /* ── Hero ── */
//   .hero {
//     position: relative;
//     height: 220px;
//     background: var(--ink);
//     overflow: hidden;
//   }
//   .hero-grid {
//     position: absolute;
//     inset: 0;
//     background-image:
//       linear-gradient(rgba(196,154,60,0.12) 1px, transparent 1px),
//       linear-gradient(90deg, rgba(196,154,60,0.12) 1px, transparent 1px);
//     background-size: 48px 48px;
//   }
//   .hero-glow {
//     position: absolute;
//     width: 500px; height: 500px;
//     border-radius: 50%;
//     background: radial-gradient(circle, rgba(196,154,60,0.18) 0%, transparent 70%);
//     top: -180px; left: -80px;
//   }
//   .hero-glow2 {
//     position: absolute;
//     width: 300px; height: 300px;
//     border-radius: 50%;
//     background: radial-gradient(circle, rgba(196,154,60,0.1) 0%, transparent 70%);
//     bottom: -120px; right: 10%;
//   }

//   /* ── Layout ── */
//   .page-container {
//     max-width: 1020px;
//     margin: 0 auto;
//     padding: 0 28px 60px;
//   }

//   /* ── Identity card ── */
//   .identity-card {
//     background: #fff;
//     border-radius: var(--radius);
//     box-shadow: var(--shadow-lift);
//     border: 1px solid var(--cream-border);
//     padding: 32px 36px 28px;
//     margin-top: -72px;
//     margin-bottom: 24px;
//     display: flex;
//     align-items: flex-end;
//     justify-content: space-between;
//     gap: 24px;
//   }
//   .identity-left { display: flex; align-items: flex-end; gap: 20px; }

//   /* Avatar */
//   .avatar-ring {
//     width: 96px; height: 96px;
//     border-radius: 50%;
//     padding: 3px;
//     background: linear-gradient(135deg, var(--gold), #e8c97a, var(--gold));
//     box-shadow: 0 4px 20px rgba(196,154,60,0.35);
//     flex-shrink: 0;
//   }
//   .avatar-inner {
//     width: 100%; height: 100%;
//     border-radius: 50%;
//     background: var(--cream-mid);
//     border: 3px solid #fff;
//     overflow: hidden;
//     display: flex; align-items: center; justify-content: center;
//   }
//   .avatar-initials {
//     font-family: 'DM Serif Display', serif;
//     font-size: 28px;
//     color: var(--ink-mid);
//     letter-spacing: -0.5px;
//   }

//   /* Name block */
//   .identity-name {
//     font-family: 'DM Serif Display', serif;
//     font-size: 26px;
//     color: var(--ink);
//     line-height: 1.15;
//     margin: 0 0 4px;
//     letter-spacing: -0.3px;
//   }
//   .identity-role {
//     font-size: 13px;
//     color: var(--ink-muted);
//     font-weight: 400;
//     letter-spacing: 0.2px;
//   }

//   /* Status badge */
//   .status-pill {
//     display: inline-flex; align-items: center; gap: 6px;
//     padding: 4px 10px;
//     border-radius: 999px;
//     font-size: 11.5px;
//     font-weight: 500;
//     letter-spacing: 0.2px;
//     border: 1px solid;
//   }
//   .status-dot {
//     width: 6px; height: 6px;
//     border-radius: 50%;
//   }
//   .status-active { background: var(--emerald-light); color: var(--emerald); border-color: #a8dcc5; }
//   .status-active .status-dot { background: var(--emerald); }
//   .status-inactive { background: var(--cream-mid); color: var(--ink-muted); border-color: var(--cream-border); }
//   .status-inactive .status-dot { background: var(--ink-faint); }

//   /* Action buttons */
//   .btn-primary {
//     display: inline-flex; align-items: center; gap: 7px;
//     padding: 10px 20px;
//     background: var(--ink);
//     color: #fff;
//     font-family: 'DM Sans', sans-serif;
//     font-size: 13.5px;
//     font-weight: 500;
//     border: none;
//     border-radius: var(--radius-sm);
//     cursor: pointer;
//     transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
//     box-shadow: 0 2px 8px rgba(26,23,20,0.18);
//     letter-spacing: 0.1px;
//   }
//   .btn-primary:hover { background: var(--ink-mid); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(26,23,20,0.22); }
//   .btn-primary:active { transform: translateY(0); }
//   .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

//   .btn-ghost {
//     display: inline-flex; align-items: center; gap: 6px;
//     padding: 10px 16px;
//     background: transparent;
//     color: var(--ink-mid);
//     font-family: 'DM Sans', sans-serif;
//     font-size: 13.5px;
//     font-weight: 500;
//     border: 1px solid var(--cream-border);
//     border-radius: var(--radius-sm);
//     cursor: pointer;
//     transition: background 0.15s, border-color 0.15s;
//   }
//   .btn-ghost:hover { background: var(--cream-mid); border-color: #d8d2c9; }

//   .btn-save-gold {
//     display: inline-flex; align-items: center; gap: 7px;
//     padding: 10px 22px;
//     background: linear-gradient(135deg, #c49a3c, #d4ab50);
//     color: #fff;
//     font-family: 'DM Sans', sans-serif;
//     font-size: 13.5px;
//     font-weight: 600;
//     border: none;
//     border-radius: var(--radius-sm);
//     cursor: pointer;
//     transition: opacity 0.18s, transform 0.15s, box-shadow 0.18s;
//     box-shadow: 0 2px 12px rgba(196,154,60,0.4);
//     letter-spacing: 0.1px;
//   }
//   .btn-save-gold:hover { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(196,154,60,0.5); }
//   .btn-save-gold:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

//   /* ── Two-column grid ── */
//   .content-grid {
//     display: grid;
//     grid-template-columns: 1fr 320px;
//     gap: 20px;
//     align-items: start;
//   }
//   @media (max-width: 768px) {
//     .content-grid { grid-template-columns: 1fr; }
//   }

//   /* ── Section card ── */
//   .section-card {
//     background: #fff;
//     border-radius: var(--radius);
//     box-shadow: var(--shadow-card);
//     border: 1px solid var(--cream-border);
//     overflow: hidden;
//     margin-bottom: 20px;
//   }
//   .section-head {
//     padding: 20px 28px 0;
//     display: flex;
//     align-items: center;
//     gap: 10px;
//   }
//   .section-head-icon {
//     width: 32px; height: 32px;
//     border-radius: 8px;
//     background: var(--gold-light);
//     display: flex; align-items: center; justify-content: center;
//     color: var(--gold);
//     flex-shrink: 0;
//   }
//   .section-title {
//     font-family: 'DM Serif Display', serif;
//     font-size: 15px;
//     color: var(--ink);
//     margin: 0;
//     letter-spacing: -0.1px;
//   }
//   .section-divider { height: 1px; background: var(--cream-border); margin: 16px 28px 0; }
//   .section-body { padding: 20px 28px 24px; }

//   /* ── Field row ── */
//   .field-row {
//     display: grid;
//     grid-template-columns: 130px 1fr;
//     gap: 12px;
//     align-items: center;
//     padding: 14px 0;
//     border-bottom: 1px solid var(--cream-mid);
//   }
//   .field-row:last-child { border-bottom: none; padding-bottom: 0; }
//   .field-row:first-child { padding-top: 0; }
//   .field-label {
//     font-size: 12.5px;
//     font-weight: 500;
//     color: var(--ink-muted);
//     letter-spacing: 0.4px;
//     text-transform: uppercase;
//   }
//   .field-value {
//     font-size: 14px;
//     color: var(--ink);
//     font-weight: 400;
//     display: flex;
//     align-items: center;
//     gap: 8px;
//   }
//   .field-value-muted { color: var(--ink-faint); font-style: italic; }
//   .field-value svg { color: var(--ink-faint); flex-shrink: 0; }

//   /* ── Inputs ── */
//   .input-field {
//     width: 100%;
//     padding: 9px 13px;
//     font-family: 'DM Sans', sans-serif;
//     font-size: 13.5px;
//     color: var(--ink);
//     background: var(--cream);
//     border: 1px solid var(--cream-border);
//     border-radius: var(--radius-sm);
//     outline: none;
//     transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
//   }
//   .input-field:focus {
//     border-color: var(--gold);
//     box-shadow: 0 0 0 3px rgba(196,154,60,0.12);
//     background: #fff;
//   }
//   .input-field::placeholder { color: var(--ink-faint); }
//   .input-prefix-wrap {
//     display: flex;
//     align-items: center;
//     background: var(--cream);
//     border: 1px solid var(--cream-border);
//     border-radius: var(--radius-sm);
//     overflow: hidden;
//     transition: border-color 0.15s, box-shadow 0.15s;
//   }
//   .input-prefix-wrap:focus-within {
//     border-color: var(--gold);
//     box-shadow: 0 0 0 3px rgba(196,154,60,0.12);
//     background: #fff;
//   }
//   .input-prefix {
//     padding: 9px 10px 9px 13px;
//     font-size: 13px;
//     color: var(--ink-faint);
//     white-space: nowrap;
//     flex-shrink: 0;
//   }
//   .input-prefix-inner {
//     flex: 1;
//     padding: 9px 13px 9px 4px;
//     font-family: 'DM Sans', sans-serif;
//     font-size: 13.5px;
//     color: var(--ink);
//     border: none;
//     outline: none;
//     background: transparent;
//   }
//   .input-icon-wrap {
//     display: flex;
//     align-items: center;
//     background: var(--cream);
//     border: 1px solid var(--cream-border);
//     border-radius: var(--radius-sm);
//     overflow: hidden;
//     transition: border-color 0.15s, box-shadow 0.15s;
//   }
//   .input-icon-wrap:focus-within {
//     border-color: var(--gold);
//     box-shadow: 0 0 0 3px rgba(196,154,60,0.12);
//     background: #fff;
//   }
//   .input-icon-slot {
//     padding: 0 0 0 13px;
//     display: flex; align-items: center;
//     color: var(--ink-faint);
//   }
//   .input-icon-inner {
//     flex: 1;
//     padding: 9px 13px;
//     font-family: 'DM Sans', sans-serif;
//     font-size: 13.5px;
//     color: var(--ink);
//     border: none;
//     outline: none;
//     background: transparent;
//   }

//   /* Bio textarea */
//   .bio-editor {
//     border: 1px solid var(--cream-border);
//     border-radius: var(--radius-sm);
//     overflow: hidden;
//     transition: border-color 0.15s, box-shadow 0.15s;
//     background: var(--cream);
//   }
//   .bio-editor:focus-within {
//     border-color: var(--gold);
//     box-shadow: 0 0 0 3px rgba(196,154,60,0.12);
//     background: #fff;
//   }
//   .bio-toolbar {
//     display: flex; align-items: center; gap: 2px;
//     padding: 8px 10px;
//     border-bottom: 1px solid var(--cream-border);
//     background: rgba(255,255,255,0.6);
//   }
//   .bio-toolbar-btn {
//     padding: 5px 7px;
//     border: none;
//     background: transparent;
//     border-radius: 6px;
//     cursor: pointer;
//     color: var(--ink-muted);
//     transition: background 0.12s, color 0.12s;
//     display: flex; align-items: center;
//   }
//   .bio-toolbar-btn:hover { background: var(--cream-border); color: var(--ink); }
//   .bio-toolbar-sep { width: 1px; height: 16px; background: var(--cream-border); margin: 0 4px; }
//   .bio-textarea {
//     width: 100%;
//     padding: 12px 14px;
//     font-family: 'DM Sans', sans-serif;
//     font-size: 13.5px;
//     color: var(--ink);
//     border: none;
//     outline: none;
//     resize: none;
//     background: transparent;
//     line-height: 1.6;
//   }
//   .bio-footer {
//     padding: 6px 14px;
//     border-top: 1px solid var(--cream-border);
//     display: flex; justify-content: flex-end;
//     font-size: 11.5px;
//     color: var(--ink-faint);
//     background: rgba(255,255,255,0.4);
//   }

//   /* ── Role badge ── */
//   .role-badge {
//     display: inline-flex; align-items: center; gap: 6px;
//     padding: 5px 12px;
//     border-radius: 999px;
//     font-size: 12px;
//     font-weight: 500;
//     border: 1px solid;
//   }
//   .role-admin { background: var(--gold-light); color: #8a6315; border-color: #e8d4a0; }
//   .role-manager { background: var(--sapphire-light); color: var(--sapphire); border-color: #b8d0e8; }
//   .role-default { background: var(--emerald-light); color: var(--emerald); border-color: #a8dcc5; }

//   /* ── Info card (sidebar) ── */
//   .info-row {
//     display: flex;
//     align-items: flex-start;
//     gap: 12px;
//     padding: 13px 0;
//     border-bottom: 1px solid var(--cream-mid);
//   }
//   .info-row:last-child { border-bottom: none; }
//   .info-icon {
//     width: 34px; height: 34px;
//     border-radius: 8px;
//     background: var(--cream-mid);
//     display: flex; align-items: center; justify-content: center;
//     color: var(--ink-muted);
//     flex-shrink: 0;
//   }
//   .info-text-label { font-size: 11px; font-weight: 500; color: var(--ink-faint); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
//   .info-text-value { font-size: 13.5px; color: var(--ink); font-weight: 400; word-break: break-word; }

//   /* Photo upload */
//   .photo-section {
//     display: flex;
//     align-items: center;
//     gap: 16px;
//   }
//   .photo-avatar {
//     width: 64px; height: 64px;
//     border-radius: 50%;
//     overflow: hidden;
//     background: var(--cream-mid);
//     border: 2px solid var(--cream-border);
//     display: flex; align-items: center; justify-content: center;
//     flex-shrink: 0;
//   }
//   .photo-initials { font-family: 'DM Serif Display', serif; font-size: 20px; color: var(--ink-mid); }
//   .photo-actions { display: flex; flex-direction: column; gap: 6px; }
//   .photo-desc { font-size: 12px; color: var(--ink-muted); }
//   .photo-btns { display: flex; gap: 8px; }
//   .btn-photo-update {
//     font-size: 12.5px; font-weight: 500; color: var(--gold);
//     background: none; border: none; cursor: pointer; padding: 0;
//     font-family: 'DM Sans', sans-serif;
//     transition: color 0.15s;
//     text-decoration: underline; text-underline-offset: 2px;
//   }
//   .btn-photo-update:hover { color: #a88030; }
//   .btn-photo-delete {
//     font-size: 12.5px; font-weight: 500; color: var(--rose);
//     background: none; border: none; cursor: pointer; padding: 0;
//     font-family: 'DM Sans', sans-serif;
//     transition: color 0.15s;
//     text-decoration: underline; text-underline-offset: 2px;
//   }
//   .btn-photo-delete:hover { color: #7a1a28; }

//   /* ── Alerts ── */
//   .alert {
//     display: flex; align-items: flex-start; gap: 12px;
//     padding: 14px 18px;
//     border-radius: var(--radius-sm);
//     margin-bottom: 20px;
//     border: 1px solid;
//     animation: slideDown 0.2s ease;
//   }
//   @keyframes slideDown {
//     from { opacity: 0; transform: translateY(-8px); }
//     to   { opacity: 1; transform: translateY(0); }
//   }
//   .alert-error { background: var(--rose-light); border-color: #f3c0c8; color: var(--rose); }
//   .alert-success { background: var(--emerald-light); border-color: #a8dcc5; color: var(--emerald); }
//   .alert-icon {
//     width: 20px; height: 20px; border-radius: 50%;
//     display: flex; align-items: center; justify-content: center;
//     flex-shrink: 0; font-size: 11px; font-weight: 700;
//     margin-top: 1px;
//   }
//   .alert-error .alert-icon { background: rgba(155,35,53,0.15); }
//   .alert-success .alert-icon { background: rgba(45,106,79,0.15); }
//   .alert-close { margin-left: auto; background: none; border: none; cursor: pointer; opacity: 0.5; transition: opacity 0.15s; padding: 0; }
//   .alert-close:hover { opacity: 1; }
//   .alert-msg { font-size: 13.5px; font-weight: 400; flex: 1; }

//   /* ── Footer save bar ── */
//   .save-footer {
//     padding: 18px 28px;
//     background: var(--cream-mid);
//     border-top: 1px solid var(--cream-border);
//     display: flex; align-items: center; justify-content: space-between;
//   }
//   .save-footer-note { font-size: 12.5px; color: var(--ink-muted); }

//   /* ── Loader ── */
//   .spinner {
//     width: 14px; height: 14px;
//     border-radius: 50%;
//     border: 2px solid rgba(255,255,255,0.35);
//     border-top-color: #fff;
//     animation: spin 0.7s linear infinite;
//     flex-shrink: 0;
//   }
//   .spinner-gold {
//     border-color: rgba(196,154,60,0.25);
//     border-top-color: var(--gold);
//   }
//   @keyframes spin { to { transform: rotate(360deg); } }

//   /* ── Mono chip ── */
//   .mono-chip {
//     font-family: 'SF Mono', 'Fira Mono', monospace;
//     font-size: 11.5px;
//     background: var(--cream-mid);
//     border: 1px solid var(--cream-border);
//     border-radius: 6px;
//     padding: 3px 9px;
//     color: var(--ink-muted);
//     letter-spacing: 0.3px;
//   }

//   /* ── Full-page loader ── */
//   .page-loader {
//     min-height: 100vh;
//     display: flex; flex-direction: column;
//     align-items: center; justify-content: center;
//     gap: 14px;
//     background: var(--cream);
//   }
//   .page-loader-ring {
//     width: 36px; height: 36px;
//     border-radius: 50%;
//     border: 2px solid var(--cream-border);
//     border-top-color: var(--gold);
//     animation: spin 0.8s linear infinite;
//   }
//   .page-loader-text { font-size: 13px; color: var(--ink-muted); }

//   /* ── Decorative label ── */
//   .section-eyebrow {
//     font-size: 10.5px;
//     font-weight: 600;
//     letter-spacing: 1.2px;
//     text-transform: uppercase;
//     color: var(--gold);
//     padding: 22px 28px 0;
//   }

//   .actions-bar { display: flex; align-items: center; gap: 10px; }

//   /* responsive identity card */
//   @media (max-width: 640px) {
//     .identity-card { flex-direction: column; align-items: flex-start; }
//     .actions-bar { width: 100%; justify-content: flex-end; }
//     .field-row { grid-template-columns: 1fr; gap: 6px; }
//   }
// `;

// // ── Micro icons ──────────────────────────────────────────────────────────────
// const Ic = {
//   edit: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
//   check: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>,
//   x: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>,
//   mail: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
//   phone: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
//   shield: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
//   calendar: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
//   globe: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
//   briefcase: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
//   atSign: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>,
//   user: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
//   hash: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
//   bold: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6zM6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>,
//   italic: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 4h-9M14 20H5M15 4 9 20"/></svg>,
//   link: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
//   list: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>,
//   photo: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
// };

// // ── Main Component ──────────────────────────────────────────────────────────
// export default function UserProfilePage() {
//   const [user, setUser] = useState<UserProfile | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [isEditing, setIsEditing] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [editForm, setEditForm] = useState<EditState>({
//     name: '', email: '', phone: '', bio: '', jobTitle: '', website: '', username: '',
//   });
//   const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
//   const [avatarFile, setAvatarFile] = useState<File | null>(null);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     const loadUserProfile = async () => {
//       try {
//         setLoading(true);
//         const userId = localStorage.getItem('userId');
//         const userName = localStorage.getItem('name') || '';
//         const userEmail = localStorage.getItem('email') || '';
//         const userPhone = localStorage.getItem('phone') || '';
//         const userRole = localStorage.getItem('role') || '';
//         const userAvatar = localStorage.getItem('avatar') || '';

//         if (userId) {
//           try {
//             const res = await apiHandler({ url: MetaApi.getUserById(userId), method: 'get' });
//             if (res.ok && res.data) {
//               const profileData = res.data.data || res.data;
//               setUser(profileData);
//               setEditForm({
//                 name: profileData.name || userName, email: profileData.email || userEmail,
//                 phone: profileData.phone || userPhone, bio: profileData.bio || '',
//                 jobTitle: profileData.jobTitle || '', website: profileData.website || '',
//                 username: profileData.username || '',
//               });
//               setAvatarPreview(profileData.avatar || userAvatar || '');
//             } else {
//               fallback(userId, userName, userEmail, userPhone, userRole, userAvatar);
//             }
//           } catch {
//             fallback(userId, userName, userEmail, userPhone, userRole, userAvatar);
//           }
//         }
//         setLoading(false);
//       } catch {
//         setError('Failed to load profile');
//         setLoading(false);
//       }
//     };

//     const fallback = (id: string, name: string, email: string, phone: string, role: string, avatar: string) => {
//       setUser({ _id: id, name, email, phone, role, status: 'active', avatar });
//       setEditForm({ name, email, phone, bio: '', jobTitle: '', website: '', username: '' });
//       setAvatarPreview(avatar);
//     };

//     loadUserProfile();
//   }, []);

//   const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setAvatarFile(file);
//       const reader = new FileReader();
//       reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSaveProfile = async () => {
//     if (!user) return;
//     if (!editForm.name.trim() || !editForm.email.trim()) { setError('Name and email are required'); return; }

//     setIsSaving(true); setError(''); setSuccess('');
//     try {
//       const updateData: any = { ...editForm };
//       if (avatarFile && avatarPreview) updateData.avatar = avatarPreview;

//       const res = await apiHandler({ url: MetaApi.getUserById(user._id), method: 'put', data: updateData });
//       if (res.ok) {
//         setUser({ ...user, ...updateData });
//         localStorage.setItem('name', editForm.name);
//         localStorage.setItem('email', editForm.email);
//         localStorage.setItem('phone', editForm.phone);
//         if (avatarPreview) localStorage.setItem('avatar', avatarPreview);
//         setSuccess('Profile updated successfully');
//         setIsEditing(false);
//         setAvatarFile(null);
//         setTimeout(() => setSuccess(''), 3000);
//       } else {
//         setError(res.data?.message || 'Failed to update profile');
//       }
//     } catch (err: any) {
//       setError(err?.message || 'Failed to update profile');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//     if (user) {
//       setEditForm({ name: user.name, email: user.email, phone: user.phone,
//         bio: user.bio || '', jobTitle: user.jobTitle || '',
//         website: user.website || '', username: user.username || '' });
//       setAvatarFile(null);
//       setAvatarPreview(user.avatar || '');
//     }
//     setError('');
//   };

//   const initials = user?.name
//     ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
//     : 'U';

//   if (loading) {
//     return (
//       <div className="profile-root">
//         <style>{styles}</style>
//         <div className="page-loader">
//           <div className="page-loader-ring" />
//           <p className="page-loader-text">Loading your profile…</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="profile-root">
//         <style>{styles}</style>
//         <div className="page-loader">
//           <p className="page-loader-text">Unable to load profile.</p>
//         </div>
//       </div>
//     );
//   }

//   const roleCls = user.role === 'Admin' ? 'role-admin' : user.role === 'Manager' ? 'role-manager' : 'role-default';

//   return (
//     <div className="profile-root">
//       <style>{styles}</style>

//       {/* ── Hero banner ── */}
//       <div className="hero">
//         <div className="hero-grid" />
//         <div className="hero-glow" />
//         <div className="hero-glow2" />
//       </div>

//       <div className="page-container">

//         {/* ── Identity card ── */}
//         <div className="identity-card">
//           <div className="identity-left">
//             <div className="avatar-ring">
//               <div className="avatar-inner">
//                 {avatarPreview ? (
//                   <Image src={avatarPreview} alt={user.name} width={88} height={88}
//                     style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                 ) : (
//                   <span className="avatar-initials">{initials}</span>
//                 )}
//               </div>
//             </div>
//             <div>
//               <h1 className="identity-name">{user.name || 'Your Name'}</h1>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
//                 <span className="identity-role">{user.jobTitle || user.role}</span>
//                 <span className={`status-pill ${user.status === 'active' ? 'status-active' : 'status-inactive'}`}>
//                   <span className="status-dot" />
//                   {user.status === 'active' ? 'Active' : 'Inactive'}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="actions-bar">
//             {isEditing ? (
//               <>
//                 <button onClick={handleCancel} className="btn-ghost">{Ic.x} Cancel</button>
//                 <button onClick={handleSaveProfile} disabled={isSaving} className="btn-save-gold">
//                   {isSaving ? <><div className="spinner" />Saving…</> : <>{Ic.check} Save Changes</>}
//                 </button>
//               </>
//             ) : (
//               <button onClick={() => setIsEditing(true)} className="btn-primary">{Ic.edit} Edit Profile</button>
//             )}
//           </div>
//         </div>

//         {/* ── Alerts ── */}
//         {error && (
//           <div className="alert alert-error">
//             <div className="alert-icon">!</div>
//             <span className="alert-msg">{error}</span>
//             <button onClick={() => setError('')} className="alert-close">{Ic.x}</button>
//           </div>
//         )}
//         {success && (
//           <div className="alert alert-success">
//             <div className="alert-icon">{Ic.check}</div>
//             <span className="alert-msg">{success}</span>
//           </div>
//         )}

//         {/* ── Two-column content ── */}
//         <div className="content-grid">

//           {/* LEFT — main form */}
//           <div>
//             {/* Personal Info */}
//             <div className="section-card">
//               <div className="section-eyebrow">Personal</div>
//               <div className="section-head">
//                 <div className="section-head-icon">{Ic.user}</div>
//                 <h2 className="section-title">Profile Details</h2>
//               </div>
//               <div className="section-divider" />
//               <div className="section-body">

//                 {/* Photo */}
//                 <div className="field-row" style={{ alignItems: 'flex-start' }}>
//                   <span className="field-label" style={{ paddingTop: 6 }}>Photo</span>
//                   <div className="photo-section">
//                     <div className="photo-avatar">
//                       {avatarPreview
//                         ? <Image src={avatarPreview} alt={user.name} width={64} height={64}
//                             style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                         : <span className="photo-initials">{initials}</span>}
//                     </div>
//                     <div className="photo-actions">
//                       <span className="photo-desc">PNG, JPG or GIF · Max 4 MB</span>
//                       {isEditing && (
//                         <div className="photo-btns">
//                           <button className="btn-photo-update" onClick={() => fileInputRef.current?.click()}>
//                             {Ic.photo} Update photo
//                           </button>
//                           {avatarPreview && (
//                             <button className="btn-photo-delete" onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}>
//                               Remove
//                             </button>
//                           )}
//                           <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarSelect} style={{ display: 'none' }} />
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Name */}
//                 <div className="field-row">
//                   <span className="field-label">Full name</span>
//                   {isEditing
//                     ? <input className="input-field" value={editForm.name}
//                         onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
//                         placeholder="Your full name" />
//                     : <span className="field-value">{user.name}</span>}
//                 </div>

//                 {/* Username */}
//                 <div className="field-row">
//                   <span className="field-label">Username</span>
//                   {isEditing
//                     ? <div className="input-prefix-wrap">
//                         <span className="input-prefix">untitledui.com/</span>
//                         <input className="input-prefix-inner" value={editForm.username}
//                           onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
//                           placeholder="username" />
//                       </div>
//                     : <span className="field-value">
//                         <span style={{ color: 'var(--ink-faint)' }}>untitledui.com/</span>
//                         {user.username || <em style={{ color: 'var(--ink-faint)' }}>not set</em>}
//                       </span>}
//                 </div>

//                 {/* Job title */}
//                 <div className="field-row">
//                   <span className="field-label">Job title</span>
//                   {isEditing
//                     ? <input className="input-field" value={editForm.jobTitle}
//                         onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
//                         placeholder="e.g. Product Designer" />
//                     : <span className="field-value">{user.jobTitle || <em style={{ color: 'var(--ink-faint)' }}>not set</em>}</span>}
//                 </div>

//                 {/* Website */}
//                 <div className="field-row">
//                   <span className="field-label">Website</span>
//                   {isEditing
//                     ? <div className="input-prefix-wrap">
//                         <span className="input-prefix">https://</span>
//                         <input className="input-prefix-inner" value={editForm.website}
//                           onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
//                           placeholder="www.example.com" />
//                       </div>
//                     : <span className="field-value">
//                         {Ic.globe}
//                         {user.website
//                           ? <a href={`https://${user.website}`} target="_blank" rel="noreferrer"
//                               style={{ color: 'var(--gold)', textDecoration: 'none' }}>{user.website}</a>
//                           : <em style={{ color: 'var(--ink-faint)' }}>not set</em>}
//                       </span>}
//                 </div>

//                 {/* Bio */}
//                 <div className="field-row" style={{ alignItems: 'flex-start' }}>
//                   <div style={{ paddingTop: 4 }}>
//                     <span className="field-label" style={{ display: 'block' }}>Bio</span>
//                     <span style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2, display: 'block' }}>Max 400 chars</span>
//                   </div>
//                   {isEditing
//                     ? <div className="bio-editor">
//                         <div className="bio-toolbar">
//                           <span style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginRight: 4, fontWeight: 500 }}>Normal</span>
//                           <div className="bio-toolbar-sep" />
//                           <button className="bio-toolbar-btn" title="Bold">{Ic.bold}</button>
//                           <button className="bio-toolbar-btn" title="Italic">{Ic.italic}</button>
//                           <button className="bio-toolbar-btn" title="Link">{Ic.link}</button>
//                           <button className="bio-toolbar-btn" title="List">{Ic.list}</button>
//                         </div>
//                         <textarea className="bio-textarea" rows={4} value={editForm.bio} maxLength={400}
//                           onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
//                           placeholder="Write a short introduction…" />
//                         <div className="bio-footer">{editForm.bio.length} / 400</div>
//                       </div>
//                     : <div style={{ fontSize: 14, color: user.bio ? 'var(--ink)' : 'var(--ink-faint)',
//                         fontStyle: user.bio ? 'normal' : 'italic', lineHeight: 1.65 }}>
//                         {user.bio || 'No bio added yet.'}
//                       </div>}
//                 </div>
//               </div>

//               {isEditing && (
//                 <div className="save-footer">
//                   <span className="save-footer-note">Changes will be visible to your team.</span>
//                   <div style={{ display: 'flex', gap: 10 }}>
//                     <button onClick={handleCancel} className="btn-ghost">{Ic.x} Discard</button>
//                     <button onClick={handleSaveProfile} disabled={isSaving} className="btn-save-gold">
//                       {isSaving ? <><div className="spinner" />Saving…</> : <>{Ic.check} Save</>}
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Contact */}
//             <div className="section-card">
//               <div className="section-eyebrow">Contact</div>
//               <div className="section-head">
//                 <div className="section-head-icon">{Ic.mail}</div>
//                 <h2 className="section-title">Contact Information</h2>
//               </div>
//               <div className="section-divider" />
//               <div className="section-body">
//                 <div className="field-row">
//                   <span className="field-label">Email</span>
//                   {isEditing
//                     ? <div className="input-icon-wrap">
//                         <div className="input-icon-slot">{Ic.mail}</div>
//                         <input className="input-icon-inner" type="email" value={editForm.email}
//                           onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
//                       </div>
//                     : <span className="field-value">{Ic.mail}{user.email}</span>}
//                 </div>
//                 <div className="field-row">
//                   <span className="field-label">Phone</span>
//                   {isEditing
//                     ? <div className="input-icon-wrap">
//                         <div className="input-icon-slot">{Ic.phone}</div>
//                         <input className="input-icon-inner" type="tel" value={editForm.phone}
//                           onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
//                           placeholder="+1 (555) 000-0000" />
//                       </div>
//                     : <span className="field-value">{Ic.phone}{user.phone || <em style={{ color: 'var(--ink-faint)' }}>—</em>}</span>}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT — sidebar */}
//           <div>
//             {/* Account details */}
//             <div className="section-card">
//               <div className="section-eyebrow">Account</div>
//               <div className="section-head">
//                 <div className="section-head-icon">{Ic.shield}</div>
//                 <h2 className="section-title">Account Details</h2>
//               </div>
//               <div className="section-divider" />
//               <div className="section-body" style={{ paddingTop: 14 }}>

//                 <div className="info-row">
//                   <div className="info-icon">{Ic.shield}</div>
//                   <div>
//                     <div className="info-text-label">Role</div>
//                     <div className="info-text-value">
//                       <span className={`role-badge ${roleCls}`}>{Ic.shield}<span style={{ marginLeft: 5 }}>{user.role}</span></span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="info-row">
//                   <div className="info-icon">
//                     <span className={`status-dot ${user.status === 'active' ? '' : ''}`}
//                       style={{ width: 8, height: 8, borderRadius: '50%',
//                         background: user.status === 'active' ? 'var(--emerald)' : 'var(--ink-faint)',
//                         display: 'inline-block' }} />
//                   </div>
//                   <div>
//                     <div className="info-text-label">Status</div>
//                     <div className="info-text-value">
//                       <span className={`status-pill ${user.status === 'active' ? 'status-active' : 'status-inactive'}`}>
//                         <span className="status-dot" />
//                         {user.status === 'active' ? 'Active' : 'Inactive'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {user.createdAt && (
//                   <div className="info-row">
//                     <div className="info-icon">{Ic.calendar}</div>
//                     <div>
//                       <div className="info-text-label">Member since</div>
//                       <div className="info-text-value">
//                         {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 <div className="info-row">
//                   <div className="info-icon">{Ic.hash}</div>
//                   <div>
//                     <div className="info-text-label">Account ID</div>
//                     <div className="info-text-value">
//                       <span className="mono-chip">{user._id.slice(0, 14)}…</span>
//                     </div>
//                   </div>
//                 </div>

//               </div>
//             </div>

//             {/* Quick stats / decorative card */}
//             <div className="section-card" style={{ background: 'var(--ink)', border: 'none' }}>
//               <div style={{ padding: '22px 24px' }}>
//                 <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 13, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 14 }}>
//                   Profile Completeness
//                 </div>
//                 {[
//                   { label: 'Name', done: !!user.name },
//                   { label: 'Email', done: !!user.email },
//                   { label: 'Phone', done: !!user.phone },
//                   { label: 'Bio', done: !!user.bio },
//                   { label: 'Job title', done: !!user.jobTitle },
//                   { label: 'Website', done: !!user.website },
//                   { label: 'Username', done: !!user.username },
//                 ].map(({ label, done }) => (
//                   <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
//                     <span style={{ fontSize: 12.5, color: done ? '#e8e2d9' : '#5a534c' }}>{label}</span>
//                     <span style={{
//                       width: 20, height: 20, borderRadius: '50%',
//                       background: done ? 'var(--gold)' : 'rgba(255,255,255,0.07)',
//                       border: done ? 'none' : '1px solid #3d3730',
//                       display: 'flex', alignItems: 'center', justifyContent: 'center',
//                       color: done ? '#1a1714' : '#3d3730',
//                       fontSize: 10, fontWeight: 700,
//                     }}>
//                       {done ? '✓' : ''}
//                     </span>
//                   </div>
//                 ))}
//                 {/* Progress bar */}
//                 {(() => {
//                   const pct = Math.round(
//                     ([user.name, user.email, user.phone, user.bio, user.jobTitle, user.website, user.username]
//                       .filter(Boolean).length / 7) * 100
//                   );
//                   return (
//                     <div style={{ marginTop: 16 }}>
//                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
//                         <span style={{ fontSize: 11, color: '#5a534c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Complete</span>
//                         <span style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>{pct}%</span>
//                       </div>
//                       <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 999 }}>
//                         <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #c49a3c, #e8c97a)', borderRadius: 999, transition: 'width 0.6s ease' }} />
//                       </div>
//                     </div>
//                   );
//                 })()}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { apiHandler } from '@/handler/api_handler';
import { MetaApi } from '@/config/metaApi';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  bio?: string;
  jobTitle?: string;
  website?: string;
  username?: string;
}

interface EditState {
  name: string;
  email: string;
  phone: string;
  bio: string;
  jobTitle: string;
  website: string;
  username: string;
}

/* ─────────────────────────── STYLES ─────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .up-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #f1f5f9;
    min-height: 100vh;
    color: #0f172a;
  }

  /* ── Top banner ── */
  .up-banner {
    height: 180px;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 60%, #1e3a5f 100%);
    position: relative;
    overflow: hidden;
  }
  .up-banner::after {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .up-banner-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
  }
  .up-banner-blob1 { width: 320px; height: 320px; background: rgba(99,102,241,0.25); top: -120px; left: -60px; }
  .up-banner-blob2 { width: 240px; height: 240px; background: rgba(14,165,233,0.15); top: -80px; right: 10%; }

  /* ── Page wrapper ── */
  .up-wrap { max-width: 1040px; margin: 0 auto; padding: 0 24px 60px; }

  /* ── Identity strip ── */
  .up-identity {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 24px rgba(15,23,42,0.07), 0 1px 4px rgba(15,23,42,0.04);
    padding: 0 32px 24px;
    margin-top: -64px;
    margin-bottom: 24px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
  }
  .up-identity-left { display: flex; align-items: flex-end; gap: 18px; }

  /* Avatar */
  .up-avatar-wrap {
    flex-shrink: 0;
    width: 88px; height: 88px;
    border-radius: 50%;
    border: 4px solid #fff;
    box-shadow: 0 0 0 3px #6366f1, 0 4px 16px rgba(99,102,241,0.3);
    overflow: hidden;
    background: #e2e8f0;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: -2px;
  }
  .up-avatar-initials { font-size: 26px; font-weight: 700; color: #475569; letter-spacing: -0.5px; }
  .up-name { font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px; line-height: 1.2; }
  .up-sub  { font-size: 13px; font-weight: 400; color: #64748b; margin-top: 3px; display: flex; align-items: center; gap: 8px; }

  /* Badges */
  .badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 999px; font-size: 11.5px; font-weight: 600; border: 1px solid; }
  .badge-dot { width: 6px; height: 6px; border-radius: 50%; }
  .badge-green  { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
  .badge-green .badge-dot  { background: #16a34a; }
  .badge-gray   { background: #f8fafc; color: #64748b; border-color: #e2e8f0; }
  .badge-gray .badge-dot   { background: #94a3b8; }
  .badge-indigo { background: #eef2ff; color: #4f46e5; border-color: #c7d2fe; }
  .badge-amber  { background: #fffbeb; color: #d97706; border-color: #fde68a; }
  .badge-purple { background: #faf5ff; color: #7c3aed; border-color: #e9d5ff; }

  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 10px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13.5px; font-weight: 600;
    border: none; cursor: pointer;
    transition: all 0.18s ease;
    letter-spacing: 0.1px;
  }
  .btn-primary { background: #6366f1; color: #fff; box-shadow: 0 1px 6px rgba(99,102,241,0.35); }
  .btn-primary:hover { background: #4f46e5; box-shadow: 0 4px 16px rgba(99,102,241,0.45); transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
  .btn-success { background: #059669; color: #fff; box-shadow: 0 1px 6px rgba(5,150,105,0.3); }
  .btn-success:hover { background: #047857; box-shadow: 0 4px 16px rgba(5,150,105,0.4); transform: translateY(-1px); }
  .btn-success:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
  .btn-ghost { background: transparent; color: #475569; border: 1.5px solid #e2e8f0; }
  .btn-ghost:hover { background: #f8fafc; border-color: #cbd5e1; color: #0f172a; }
  .btn-sm { padding: 7px 14px; font-size: 12.5px; border-radius: 8px; }

  /* Grid */
  .up-grid { display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }
  @media (max-width: 768px) {
    .up-grid { grid-template-columns: 1fr; }
    .up-identity { flex-direction: column; align-items: flex-start; }
  }

  /* Card */
  .card { background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; box-shadow: 0 2px 12px rgba(15,23,42,0.05); overflow: hidden; margin-bottom: 20px; }
  .card-header { padding: 18px 24px 16px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 10px; }
  .card-header-icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .icon-indigo { background: #eef2ff; color: #6366f1; }
  .icon-slate  { background: #f1f5f9; color: #475569; }
  .icon-green  { background: #f0fdf4; color: #059669; }
  .card-title { font-size: 14px; font-weight: 700; color: #0f172a; }
  .card-sub   { font-size: 12px; font-weight: 400; color: #94a3b8; margin-top: 1px; }
  .card-body  { padding: 20px 24px 22px; }

  /* Field rows */
  .field { display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 16px; padding: 13px 0; border-bottom: 1px solid #f8fafc; }
  .field:last-child { border-bottom: none; padding-bottom: 0; }
  .field:first-child { padding-top: 0; }
  .field-top { align-items: flex-start; }
  .field-label { font-size: 11.5px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.6px; }
  .field-val { font-size: 13.5px; color: #334155; font-weight: 500; display: flex; align-items: center; gap: 7px; }
  .field-val-em { color: #cbd5e1; font-style: italic; font-weight: 400; }
  .field-val svg { color: #94a3b8; flex-shrink: 0; }

  /* Inputs */
  .inp { width: 100%; padding: 9px 12px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13.5px; font-weight: 400; color: #0f172a; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 9px; outline: none; transition: border-color 0.15s, box-shadow 0.15s, background 0.15s; }
  .inp:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); background: #fff; }
  .inp::placeholder { color: #cbd5e1; }
  .inp-wrap { display: flex; align-items: center; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 9px; overflow: hidden; transition: border-color 0.15s, box-shadow 0.15s, background 0.15s; }
  .inp-wrap:focus-within { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); background: #fff; }
  .inp-pre { padding: 9px 8px 9px 12px; font-size: 12.5px; color: #94a3b8; white-space: nowrap; flex-shrink: 0; border-right: 1.5px solid #e2e8f0; background: #f1f5f9; font-weight: 500; }
  .inp-inner { flex: 1; padding: 9px 12px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13.5px; color: #0f172a; border: none; outline: none; background: transparent; }
  .inp-icon-wrap { display: flex; align-items: center; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 9px; overflow: hidden; transition: border-color 0.15s, box-shadow 0.15s, background 0.15s; }
  .inp-icon-wrap:focus-within { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); background: #fff; }
  .inp-icon-slot { padding: 0 0 0 12px; color: #94a3b8; display: flex; align-items: center; }
  .inp-icon-inner { flex: 1; padding: 9px 12px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13.5px; color: #0f172a; border: none; outline: none; background: transparent; }

  /* Bio editor */
  .bio-box { border: 1.5px solid #e2e8f0; border-radius: 9px; overflow: hidden; background: #f8fafc; transition: border-color 0.15s, box-shadow 0.15s, background 0.15s; }
  .bio-box:focus-within { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); background: #fff; }
  .bio-bar { display: flex; align-items: center; gap: 2px; padding: 7px 10px; border-bottom: 1px solid #e2e8f0; background: rgba(255,255,255,0.7); }
  .bio-bar-btn { padding: 4px 7px; border: none; background: none; border-radius: 6px; cursor: pointer; color: #64748b; transition: background 0.12s, color 0.12s; display: flex; }
  .bio-bar-btn:hover { background: #e2e8f0; color: #0f172a; }
  .bio-sep { width: 1px; height: 14px; background: #e2e8f0; margin: 0 3px; }
  .bio-ta { width: 100%; padding: 12px 14px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13.5px; color: #0f172a; line-height: 1.65; border: none; outline: none; resize: none; background: transparent; }
  .bio-foot { padding: 5px 14px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: right; background: rgba(255,255,255,0.5); }

  /* Photo upload */
  .photo-zone { display: flex; align-items: center; gap: 16px; }
  .photo-thumb { width: 60px; height: 60px; border-radius: 50%; overflow: hidden; background: #e2e8f0; border: 2px solid #e2e8f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .photo-thumb-txt { font-size: 18px; font-weight: 700; color: #64748b; }
  .photo-info { font-size: 11.5px; color: #94a3b8; margin-bottom: 6px; }
  .photo-btns { display: flex; gap: 8px; }
  .photo-btn-up { font-size: 12.5px; font-weight: 600; color: #6366f1; background: none; border: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; padding: 0; text-decoration: underline; text-underline-offset: 2px; transition: color 0.15s; }
  .photo-btn-up:hover { color: #4f46e5; }
  .photo-btn-del { font-size: 12.5px; font-weight: 600; color: #ef4444; background: none; border: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; padding: 0; text-decoration: underline; text-underline-offset: 2px; transition: color 0.15s; }
  .photo-btn-del:hover { color: #dc2626; }

  /* Sidebar */
  .si-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f8fafc; }
  .si-row:last-child { border-bottom: none; padding-bottom: 0; }
  .si-row:first-child { padding-top: 0; }
  .si-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .si-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
  .si-val   { font-size: 13.5px; font-weight: 500; color: #334155; }

  /* Completeness card */
  .comp-card { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 14px; padding: 22px 22px 20px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 4px 20px rgba(15,23,42,0.2); }
  .comp-title { font-size: 11px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
  .comp-item { display: flex; align-items: center; justify-content: space-between; margin-bottom: 9px; }
  .comp-item-label { font-size: 12.5px; }
  .comp-check { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 9px; font-weight: 700; }
  .comp-check-on  { background: #6366f1; color: #fff; }
  .comp-check-off { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: transparent; }
  .comp-bar-wrap { margin-top: 14px; }
  .comp-bar-top  { display: flex; justify-content: space-between; margin-bottom: 7px; }
  .comp-bar-lbl  { font-size: 11px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
  .comp-bar-pct  { font-size: 12px; color: #6366f1; font-weight: 700; }
  .comp-bar-bg   { height: 5px; background: rgba(255,255,255,0.07); border-radius: 999px; }
  .comp-bar-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #818cf8); border-radius: 999px; transition: width 0.7s cubic-bezier(0.4,0,0.2,1); }

  /* Mono chip */
  .mono { font-family: 'SF Mono','Fira Mono',monospace; font-size: 11px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; padding: 3px 8px; color: #64748b; }

  /* Alerts */
  .alert { display: flex; align-items: flex-start; gap: 10px; padding: 13px 16px; border-radius: 10px; border: 1px solid; margin-bottom: 18px; font-size: 13.5px; font-weight: 400; animation: slideIn 0.2s ease; }
  @keyframes slideIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  .alert-err { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
  .alert-ok  { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
  .alert-icon { flex-shrink: 0; margin-top: 1px; }
  .alert-close { margin-left: auto; background: none; border: none; cursor: pointer; opacity: 0.5; transition: opacity 0.15s; padding: 0; color: inherit; }
  .alert-close:hover { opacity: 1; }

  /* Save footer */
  .save-bar { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .save-bar-note { font-size: 12px; color: #94a3b8; }
  .save-bar-btns { display: flex; gap: 10px; }

  /* Spinner */
  .spin { width: 13px; height: 13px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; animation: rot 0.7s linear infinite; flex-shrink: 0; }
  @keyframes rot { to { transform: rotate(360deg); } }

  /* Page loader */
  .pg-load { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; background: #f1f5f9; }
  .pg-spin { width: 36px; height: 36px; border-radius: 50%; border: 2.5px solid #e2e8f0; border-top-color: #6366f1; animation: rot 0.8s linear infinite; }
  .pg-txt { font-size: 13px; color: #64748b; font-family: 'Plus Jakarta Sans', sans-serif; }
  .actions-row { display: flex; gap: 10px; align-items: center; }
`;

/* ─────────────────────────── ICONS ─────────────────────────── */
const Ic = {
  edit:     <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  check:    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>,
  x:        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  mail:     <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  phone:    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  shield:   <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  calendar: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  globe:    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  user:     <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  hash:     <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
  camera:   <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  bold:     <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6zM6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>,
  italic:   <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 4h-9M14 20H5M15 4 9 20"/></svg>,
  link2:    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  list:     <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>,
  alertIc:  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
};

/* ─────────────────────────── COMPONENT ─────────────────────────── */
export default function UserProfilePage() {
  const [user, setUser]                   = useState<UserProfile | null>(null);
  const [loading, setLoading]             = useState(true);
  const [isEditing, setIsEditing]         = useState(false);
  const [isSaving, setIsSaving]           = useState(false);
  const [editForm, setEditForm]           = useState<EditState>({ name:'', email:'', phone:'', bio:'', jobTitle:'', website:'', username:'' });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Load profile ── */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const userId     = localStorage.getItem('userId');
        const userName   = localStorage.getItem('name')   || '';
        const userEmail  = localStorage.getItem('email')  || '';
        const userPhone  = localStorage.getItem('phone')  || '';
        const userRole   = localStorage.getItem('role')   || '';
        const userAvatar = localStorage.getItem('avatar') || '';

        const fallback = () => {
          setUser({ _id: userId!, name: userName, email: userEmail, phone: userPhone, role: userRole, status: 'active', avatar: userAvatar });
          setEditForm({ name: userName, email: userEmail, phone: userPhone, bio:'', jobTitle:'', website:'', username:'' });
          setAvatarPreview(userAvatar);
        };

        if (userId) {
          try {
            const res = await apiHandler({ url: MetaApi.getUserById(userId), method: 'get' });
            if (res.ok && res.data) {
              const d = res.data.data || res.data;
              setUser(d);
              setEditForm({ name: d.name||userName, email: d.email||userEmail, phone: d.phone||userPhone, bio: d.bio||'', jobTitle: d.jobTitle||'', website: d.website||'', username: d.username||'' });
              setAvatarPreview(d.avatar || userAvatar || '');
            } else { fallback(); }
          } catch { fallback(); }
        }
        setLoading(false);
      } catch {
        setError('Failed to load profile');
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ── Avatar pick ── */
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setError('Image must be under 4 MB. Please choose a smaller file.');
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  /* ── Save — uses FormData when avatar present to avoid 413 ── */
  const handleSaveProfile = async () => {
    if (!user) return;
    if (!editForm.name.trim() || !editForm.email.trim()) { setError('Name and email are required.'); return; }
    setIsSaving(true); setError(''); setSuccess('');
    try {
      let res;
      if (avatarFile) {
        // ✅ multipart/form-data — avoids 413 caused by base64 bloat in JSON
        const form = new FormData();
        (Object.entries(editForm) as [string, string][]).forEach(([k, v]) => form.append(k, v));
        form.append('avatar', avatarFile, avatarFile.name);
        res = await apiHandler({ url: MetaApi.getUserById(user._id), method: 'put', data: form });
      } else {
        // no image — plain JSON is fine
        res = await apiHandler({ url: MetaApi.getUserById(user._id), method: 'put', data: { ...editForm } });
      }

      if (res.ok) {
        const updatedAvatar = res.data?.data?.avatar || res.data?.avatar || avatarPreview || user.avatar;
        setUser({ ...user, ...editForm, avatar: updatedAvatar || user.avatar });
        localStorage.setItem('name',  editForm.name);
        localStorage.setItem('email', editForm.email);
        localStorage.setItem('phone', editForm.phone);
        if (updatedAvatar) localStorage.setItem('avatar', updatedAvatar);
        setAvatarPreview(updatedAvatar || null);
        setAvatarFile(null);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3500);
      } else {
        setError(res.data?.message || 'Failed to update profile. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Cancel ── */
  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setEditForm({ name: user.name, email: user.email, phone: user.phone, bio: user.bio||'', jobTitle: user.jobTitle||'', website: user.website||'', username: user.username||'' });
      setAvatarFile(null);
      setAvatarPreview(user.avatar || '');
    }
    setError('');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const roleBadgeCls = user?.role === 'Admin' ? 'badge-amber' : user?.role === 'Manager' ? 'badge-purple' : 'badge-indigo';

  const completenessFields = [
    { label: 'Full name',  done: !!user?.name },
    { label: 'Email',      done: !!user?.email },
    { label: 'Phone',      done: !!user?.phone },
    { label: 'Bio',        done: !!user?.bio },
    { label: 'Job title',  done: !!user?.jobTitle },
    { label: 'Website',    done: !!user?.website },
    { label: 'Username',   done: !!user?.username },
  ];
  const pct = user ? Math.round(completenessFields.filter(f => f.done).length / completenessFields.length * 100) : 0;

  if (loading) return (
    <div className="up-root"><style>{styles}</style>
      <div className="pg-load"><div className="pg-spin" /><p className="pg-txt">Loading profile…</p></div>
    </div>
  );
  if (!user) return (
    <div className="up-root"><style>{styles}</style>
      <div className="pg-load"><p className="pg-txt">Unable to load profile.</p></div>
    </div>
  );

  return (
    <div className="up-root">
      <style>{styles}</style>

      {/* Banner */}
      <div className="up-banner">
        <div className="up-banner-blob up-banner-blob1" />
        <div className="up-banner-blob up-banner-blob2" />
      </div>

      <div className="up-wrap">

        {/* Identity strip */}
        <div className="up-identity">
          <div className="up-identity-left">
            <div className="up-avatar-wrap">
              {avatarPreview
                ? <Image src={avatarPreview} alt={user.name} width={80} height={80} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <span className="up-avatar-initials">{initials}</span>}
            </div>
            <div style={{ paddingBottom: 4 }}>
              <div className="up-name">{user.name || 'Your Name'}</div>
              <div className="up-sub">
                <span>{user.jobTitle || user.role}</span>
                <span className={`badge ${user.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                  <span className="badge-dot" />
                  {user.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <div className="actions-row">
            {isEditing ? (
              <>
                <button onClick={handleCancel} className="btn btn-ghost btn-sm">{Ic.x} Cancel</button>
                <button onClick={handleSaveProfile} disabled={isSaving} className="btn btn-success btn-sm">
                  {isSaving ? <><div className="spin" />Saving…</> : <>{Ic.check} Save Changes</>}
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="btn btn-primary btn-sm">{Ic.edit} Edit Profile</button>
            )}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-err">
            <span className="alert-icon">{Ic.alertIc}</span>
            <span>{error}</span>
            <button className="alert-close" onClick={() => setError('')}>{Ic.x}</button>
          </div>
        )}
        {success && (
          <div className="alert alert-ok">
            <span className="alert-icon">{Ic.check}</span>
            <span>{success}</span>
          </div>
        )}

        {/* Two-column */}
        <div className="up-grid">

          {/* ── LEFT ── */}
          <div>
            {/* Personal */}
            <div className="card">
              <div className="card-header">
                <div className="card-header-icon icon-indigo">{Ic.user}</div>
                <div>
                  <div className="card-title">Personal Information</div>
                  <div className="card-sub">Update your name, photo and public profile.</div>
                </div>
              </div>
              <div className="card-body">

                {/* Photo */}
                <div className="field field-top">
                  <div className="field-label" style={{ paddingTop: 4 }}>Photo</div>
                  <div className="photo-zone">
                    <div className="photo-thumb">
                      {avatarPreview
                        ? <Image src={avatarPreview} alt={user.name} width={60} height={60} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        : <span className="photo-thumb-txt">{initials}</span>}
                    </div>
                    <div>
                      <div className="photo-info">PNG, JPG or GIF · Max 4 MB</div>
                      {isEditing && (
                        <div className="photo-btns">
                          <button className="photo-btn-up" onClick={() => fileInputRef.current?.click()}>
                            {Ic.camera} Update photo
                          </button>
                          {avatarPreview && (
                            <button className="photo-btn-del" onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}>
                              Remove
                            </button>
                          )}
                          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarSelect} style={{ display:'none' }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Full name */}
                <div className="field">
                  <div className="field-label">Full name</div>
                  {isEditing
                    ? <input className="inp" value={editForm.name} placeholder="Your full name" onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                    : <span className="field-val">{user.name || <em className="field-val-em">not set</em>}</span>}
                </div>

                {/* Username */}
                <div className="field">
                  <div className="field-label">Username</div>
                  {isEditing
                    ? <div className="inp-wrap">
                        <span className="inp-pre">@</span>
                        <input className="inp-inner" value={editForm.username} placeholder="username" onChange={e => setEditForm({ ...editForm, username: e.target.value })} />
                      </div>
                    : <span className="field-val">
                        <span style={{ color:'#94a3b8' }}>@</span>
                        {user.username || <em className="field-val-em">not set</em>}
                      </span>}
                </div>

                {/* Job title */}
                <div className="field">
                  <div className="field-label">Job title</div>
                  {isEditing
                    ? <input className="inp" value={editForm.jobTitle} placeholder="e.g. Product Designer" onChange={e => setEditForm({ ...editForm, jobTitle: e.target.value })} />
                    : <span className="field-val">{user.jobTitle || <em className="field-val-em">not set</em>}</span>}
                </div>

                {/* Website */}
                <div className="field">
                  <div className="field-label">Website</div>
                  {isEditing
                    ? <div className="inp-wrap">
                        <span className="inp-pre">https://</span>
                        <input className="inp-inner" value={editForm.website} placeholder="www.example.com" onChange={e => setEditForm({ ...editForm, website: e.target.value })} />
                      </div>
                    : <span className="field-val">
                        {Ic.globe}
                        {user.website
                          ? <a href={`https://${user.website}`} target="_blank" rel="noreferrer" style={{ color:'#6366f1', textDecoration:'none', fontWeight:500 }}>{user.website}</a>
                          : <em className="field-val-em">not set</em>}
                      </span>}
                </div>

                {/* Bio */}
                <div className="field field-top">
                  <div>
                    <div className="field-label">Bio</div>
                    <div style={{ fontSize:11, color:'#cbd5e1', marginTop:3 }}>max 400 chars</div>
                  </div>
                  {isEditing
                    ? <div className="bio-box">
                        <div className="bio-bar">
                          <span style={{ fontSize:11.5, color:'#64748b', fontWeight:600, marginRight:4 }}>Text</span>
                          <div className="bio-sep" />
                          <button className="bio-bar-btn">{Ic.bold}</button>
                          <button className="bio-bar-btn">{Ic.italic}</button>
                          <button className="bio-bar-btn">{Ic.link2}</button>
                          <button className="bio-bar-btn">{Ic.list}</button>
                        </div>
                        <textarea className="bio-ta" rows={4} value={editForm.bio} maxLength={400}
                          placeholder="Write a short introduction…"
                          onChange={e => setEditForm({ ...editForm, bio: e.target.value })} />
                        <div className="bio-foot">{editForm.bio.length} / 400</div>
                      </div>
                    : <div style={{ fontSize:13.5, color: user.bio ? '#334155':'#cbd5e1', fontStyle: user.bio?'normal':'italic', lineHeight:1.65 }}>
                        {user.bio || 'No bio added yet.'}
                      </div>}
                </div>
              </div>

              {isEditing && (
                <div className="save-bar">
                  <span className="save-bar-note">Changes visible to your team.</span>
                  <div className="save-bar-btns">
                    <button onClick={handleCancel} className="btn btn-ghost btn-sm">{Ic.x} Discard</button>
                    <button onClick={handleSaveProfile} disabled={isSaving} className="btn btn-success btn-sm">
                      {isSaving ? <><div className="spin" />Saving…</> : <>{Ic.check} Save</>}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Contact */}
            <div className="card">
              <div className="card-header">
                <div className="card-header-icon icon-slate">{Ic.mail}</div>
                <div>
                  <div className="card-title">Contact Information</div>
                  <div className="card-sub">How we reach you.</div>
                </div>
              </div>
              <div className="card-body">
                <div className="field">
                  <div className="field-label">Email</div>
                  {isEditing
                    ? <div className="inp-icon-wrap">
                        <span className="inp-icon-slot">{Ic.mail}</span>
                        <input className="inp-icon-inner" type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                      </div>
                    : <span className="field-val">{Ic.mail}{user.email}</span>}
                </div>
                <div className="field">
                  <div className="field-label">Phone</div>
                  {isEditing
                    ? <div className="inp-icon-wrap">
                        <span className="inp-icon-slot">{Ic.phone}</span>
                        <input className="inp-icon-inner" type="tel" value={editForm.phone} placeholder="+1 (555) 000-0000" onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                      </div>
                    : <span className="field-val">{Ic.phone}{user.phone || <em className="field-val-em">not set</em>}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT sidebar ── */}
          <div>

            {/* Completeness */}
            <div className="comp-card">
              <div className="comp-title">Profile Completeness</div>
              {completenessFields.map(({ label, done }) => (
                <div key={label} className="comp-item">
                  <span className="comp-item-label" style={{ color: done ? '#e2e8f0' : '#475569' }}>{label}</span>
                  <span className={`comp-check ${done ? 'comp-check-on' : 'comp-check-off'}`}>✓</span>
                </div>
              ))}
              <div className="comp-bar-wrap">
                <div className="comp-bar-top">
                  <span className="comp-bar-lbl">Complete</span>
                  <span className="comp-bar-pct">{pct}%</span>
                </div>
                <div className="comp-bar-bg">
                  <div className="comp-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>

            {/* Account details */}
            <div className="card">
              <div className="card-header">
                <div className="card-header-icon icon-green">{Ic.shield}</div>
                <div>
                  <div className="card-title">Account Details</div>
                  <div className="card-sub">Role, status & membership.</div>
                </div>
              </div>
              <div className="card-body">

                <div className="si-row">
                  <div className="si-icon" style={{ background:'#eef2ff', color:'#6366f1' }}>{Ic.shield}</div>
                  <div>
                    <div className="si-label">Role</div>
                    <div className="si-val">
                      <span className={`badge ${roleBadgeCls}`}>{Ic.shield}<span style={{ marginLeft:4 }}>{user.role}</span></span>
                    </div>
                  </div>
                </div>

                <div className="si-row">
                  <div className="si-icon" style={{ background: user.status==='active'?'#f0fdf4':'#f8fafc', color: user.status==='active'?'#16a34a':'#94a3b8', justifyContent:'center' }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background: user.status==='active'?'#16a34a':'#94a3b8', display:'inline-block' }} />
                  </div>
                  <div>
                    <div className="si-label">Status</div>
                    <div className="si-val">
                      <span className={`badge ${user.status==='active'?'badge-green':'badge-gray'}`}>
                        <span className="badge-dot" />
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {user.createdAt && (
                  <div className="si-row">
                    <div className="si-icon" style={{ background:'#f1f5f9', color:'#475569' }}>{Ic.calendar}</div>
                    <div>
                      <div className="si-label">Member since</div>
                      <div className="si-val">{new Date(user.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}</div>
                    </div>
                  </div>
                )}

                <div className="si-row">
                  <div className="si-icon" style={{ background:'#f1f5f9', color:'#475569' }}>{Ic.hash}</div>
                  <div>
                    <div className="si-label">Account ID</div>
                    <div className="si-val"><span className="mono">{user._id.slice(0, 14)}…</span></div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}