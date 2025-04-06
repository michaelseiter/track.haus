import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { AuthService } from '../services/auth';

@customElement('nav-bar')
export class NavBar extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: var(--space-xl);
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 270px;
      z-index: 100;
    }

    .nav-content {
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
    }

    .logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-md);
      text-decoration: none;
      color: var(--primary);
      transition:
        color 0.2s ease,
        text-shadow 0.2s ease;
      padding: var(--space-md) 0;
    }

    .logo img {
      width: 120px;
      height: 120px;
      filter: drop-shadow(0 0 10px rgba(255, 46, 136, 0.3));
    }

    .logo:hover {
      transform: rotate(-360deg) scale(1.1);
      transition: transform 0.2s ease;
    }

    .nav-links {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      font-size: var(--font-size-md);
      flex: 1;
    }

    .logout-button {
      padding: var(--space-md);
      background: transparent;
      border: none;
      border-radius: var(--radius-md);
      color: var(--text-2);
      cursor: pointer;
      font-size: var(--font-size-md);
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      width: 100%;
    }

    .logout-button:hover {
      color: var(--text-1);
    }

    .nav-links a {
      color: var(--text-2);
      padding: var(--space-md);
      border-radius: var(--radius-md);
      transition: all 0.2s ease;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }

    .nav-links a:hover {
      color: var(--neon-pink);
      background: rgba(255, 46, 136, 0.1);
    }

    .nav-links a.active {
      color: var(--secondary);
      background: rgba(0, 229, 229, 0.1);
      text-shadow: 0 0 20px var(--cyber-teal);
    }
  `;

  private handleLogout() {
    AuthService.clearApiKey();
    window.location.href = '/login';
  }

  render() {
    const path = window.location.pathname;

    return html`
      <div class="nav-content">
        <a href="/" class="logo">
          <img src="/images/track-haus-mark.svg" alt="Track Haus" />
        </a>
        <nav class="nav-links">
          <a href="/" class="${path === '/' ? 'active' : ''}">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
              />
            </svg>
            Plays
          </a>
          <a href="/stats" class="${path === '/stats' ? 'active' : ''}">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M18 20V10" />
              <path d="M12 20V4" />
              <path d="M6 20v-6" />
            </svg>
            Stats
          </a>
        </nav>
        <button class="logout-button" @click=${this.handleLogout}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log out
        </button>
      </div>
    `;
  }
}
