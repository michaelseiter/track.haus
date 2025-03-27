import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('nav-bar')
export class NavBar extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: var(--surface-3);
      border-bottom: 1px solid rgba(0, 240, 255, 0.1);
      padding: var(--space-lg);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: var(--glow-sm);
      backdrop-filter: blur(10px);
    }

    .nav-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: var(--primary);
      transition: color 0.2s ease, text-shadow 0.2s ease;
      font-weight: var(--font-bold);
      font-size: var(--font-size-lg);
      letter-spacing: var(--tracking-wide);
    }

    .nav-links {
      display: flex;
      gap: 1.5rem;
    }

    .nav-links a {
      text-decoration: none;
      color: #666;
      font-weight: 500;
      padding: 0.5rem;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .nav-links a:hover {
      color: #333;
      background: #f5f5f5;
    }

    .nav-links a.active {
      color: var(--warm-white);
      background: var(--secondary);
      box-shadow: var(--glow-md);
      text-shadow: 0 0 10px var(--neon-blue);
    }
  `;

  render() {
    const path = window.location.pathname;
    
    return html`
      <div class="nav-content">
        <a href="/" class="logo">
          <img src="/public/track-haus-mark.svg" alt="Track Haus" height="60">
        </a>
        <div class="nav-links">
          <a href="/" class="${path === '/' ? 'active' : ''}">Now Playing</a>
          <a href="/stats" class="${path === '/stats' ? 'active' : ''}">Stats</a>
        </div>
      </div>
    `;
  }
}
