import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('verify-page')
export class VerifyPage extends LitElement {
  @state()
  private error: string | null = null;

  @state()
  private verified = false;

  @state()
  private loading = true;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: var(--space-lg);
      background: var(--surface-1);
    }

    .logo {
      margin-bottom: var(--space-xl);
    }

    .logo img {
      width: 200px;
      height: auto;
    }

    .verify-container {
      background: var(--surface-2);
      padding: var(--space-xl);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      text-align: center;
      max-width: 400px;
      width: 100%;
    }

    .error {
      color: var(--error);
      padding: var(--space-sm);
      margin-bottom: var(--space-md);
      background: var(--error-bg);
      border-radius: var(--radius-sm);
    }

    .success {
      color: var(--success);
      padding: var(--space-sm);
      margin-bottom: var(--space-md);
      background: var(--success-bg);
      border-radius: var(--radius-sm);
    }

    .text-button {
      background: none;
      border: none;
      color: var(--primary);
      cursor: pointer;
      padding: 0;
      font-size: var(--font-size-sm);
      text-decoration: underline;
    }

    .text-button:hover {
      color: var(--primary-dark);
    }
  `;

  async connectedCallback() {
    super.connectedCallback();
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      this.error = 'No verification token provided';
      this.loading = false;
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Verification failed');
      }

      this.verified = true;
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Verification failed';
    } finally {
      this.loading = false;
    }
  }

  override render() {
    return html`
      <div class="logo">
        <img src="/public/track-haus-mark.svg" alt="Track Haus" />
      </div>
      <div class="verify-container">
        ${this.loading ? html`
          <p>Verifying your email...</p>
        ` : this.error ? html`
          <div class="error">${this.error}</div>
          <p>Please try again or contact support if the problem persists.</p>
        ` : this.verified ? html`
          <div class="success">Email verified successfully!</div>
          <p>You can now <a href="/login" class="text-button">log in</a> to your account.</p>
        ` : html`
          <div class="error">Something went wrong</div>
          <p>Please try again or contact support if the problem persists.</p>
        `}
      </div>
    `;
  }
}
