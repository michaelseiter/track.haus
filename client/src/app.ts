import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { AuthService } from './services/auth';
import './components/play-history';
import './components/login-page';
import './components/nav-bar';
import './components/verify-page';
import './components/stats-page';

declare global {
  interface HTMLElementTagNameMap {
    'app-root': App;
  }
}

@customElement('app-root')
export class App extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--surface-1);
      color: var(--text-1);
    }
  `;

  private getPage() {
    const path = window.location.pathname;
    const isAuthenticated = AuthService.isAuthenticated();

    // If not authenticated, only allow access to login
    if (!isAuthenticated && path !== '/login') {
      window.location.href = '/login';
      return html``;
    }

    // If authenticated, redirect from login to home
    if (isAuthenticated && path === '/login') {
      window.location.href = '/';
      return html``;
    }

    // Route to the appropriate page
    switch (path) {
      case '/login':
        return html`<login-page></login-page>`;
      case '/verify':
        return html`<verify-page></verify-page>`;
      case '/stats':
        return html`<nav-bar></nav-bar><stats-page></stats-page>`;
      case '/':
      default:
        return html`<nav-bar></nav-bar><play-history></play-history>`;
    }
  }

  override render() {
    return this.getPage();
  }
}
