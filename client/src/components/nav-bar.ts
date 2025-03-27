import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('nav-bar')
export class NavBar extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: white;
      border-bottom: 1px solid #eee;
      padding: 1rem;
      position: sticky;
      top: 0;
      z-index: 100;
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
      color: #333;
      font-weight: 600;
      font-size: 1.2rem;
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
      color: #009688;
      background: #e0f2f1;
    }
  `;

  render() {
    const path = window.location.pathname;
    
    return html`
      <div class="nav-content">
        <a href="/" class="logo">
          <img src="/public/track-haus-mark.svg" alt="Track Haus" height="40">
          <span>Track Haus</span>
        </a>
        <div class="nav-links">
          <a href="/" class="${path === '/' ? 'active' : ''}">Now Playing</a>
          <a href="/stats" class="${path === '/stats' ? 'active' : ''}">Stats</a>
        </div>
      </div>
    `;
  }
}
