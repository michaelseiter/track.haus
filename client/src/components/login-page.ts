import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AuthService } from '../services/auth';
import { api } from '../services/api';

declare global {
  interface HTMLElementTagNameMap {
    'login-page': LoginPage;
  }
}

@customElement('login-page')
export class LoginPage extends LitElement {
  @state()
  private error: string | null = null;

  @state()
  private loading = false;

  @state()
  private isLogin = true;

  @state()
  private resendingVerification = false;

  @state()
  private lastEmail: string | null = null;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: var(--surface-1);
      gap: var(--space-xl);
    }

    .logo {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .logo img {
      width: 200px;
      height: auto;
    }

    .login-container {
      background: var(--surface-2);
      padding: var(--space-xl);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 400px;
    }

    h1 {
      margin: 0 0 var(--space-lg);
      color: var(--text-1);
      text-align: center;
    }

    .form-group {
      margin-bottom: var(--space-md);
    }

    label {
      display: block;
      margin-bottom: var(--space-xs);
      color: var(--text-2);
    }

    input {
      width: 100%;
      padding: var(--space-sm);
      border: 2px solid var(--surface-3);
      border-radius: var(--radius-sm);
      background: var(--surface-1);
      color: var(--text-1);
      font-size: var(--font-size-base);
    }

    input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: var(--glow-sm);
    }

    button {
      width: 100%;
      padding: var(--space-lg);
      background: var(--primary);
      color: white;
      border: none;
      border-radius: var(--radius-sm);
      font-size: var(--font-size-base);
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    button:hover {
      background: var(--primary-dark);
    }

    button:disabled {
      background: var(--surface-3);
      cursor: not-allowed;
    }

    .toggle-mode {
      margin-top: var(--space-lg);
      text-align: center;
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

    .error {
      color: var(--error);
      padding: var(--space-sm);
      border: 1px solid var(--error);
      border-radius: var(--radius-sm);
      margin-bottom: var(--space-md);
      text-align: center;
      background: rgba(255, 0, 127, 0.1);
    }
  `;

  private async handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const passwordConfirm = !this.isLogin 
      ? (form.elements.namedItem('password_confirm') as HTMLInputElement).value
      : undefined;

    this.loading = true;
    this.error = null;

    try {
      const endpoint = this.isLogin ? 'login' : 'register';
      const response = await fetch(`http://localhost:8000/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password,
          password_confirm: passwordConfirm
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `${this.isLogin ? 'Login' : 'Registration'} failed`);
      }

      // Store the API key
      AuthService.setApiKey(data.api_key);

      // Verify the API key works by making a test request
      await api.testAuth();

      // Only redirect if the test request succeeds
      // First check if we can get plays
      try {
        await api.getPlays(1, 0);
        window.location.href = '/plays';
      } catch (e) {
        // If plays fails, just go to root
        window.location.href = '/';
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : `${this.isLogin ? 'Login' : 'Registration'} failed`;
      this.error = message;
      
      // Save email if verification needed
      if (message.includes('verify your email')) {
        const emailInput = this.shadowRoot?.querySelector<HTMLInputElement>('#email');
        if (emailInput) {
          this.lastEmail = emailInput.value;
        }
      }
    } finally {
      this.loading = false;
    }
  }

  private async handleResendVerification() {
    if (!this.lastEmail) return;
    
    this.resendingVerification = true;
    try {
      const response = await fetch('http://localhost:8000/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: this.lastEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to resend verification email');
      }

      this.error = null;
      alert('Verification email sent! Please check your inbox.');
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Failed to resend verification email';
    } finally {
      this.resendingVerification = false;
    }
  }

  override render() {
    return html`
      <div class="logo">
        <img src="/public/track-haus-mark.svg" alt="Track Haus" />
      </div>
      <div class="login-container">
        ${this.error ? html`
          <div class="error">
            ${this.error}
            ${this.lastEmail && this.error.includes('verify your email') ? html`
              <button
                class="text-button"
                @click=${this.handleResendVerification}
                ?disabled=${this.resendingVerification}
              >
                ${this.resendingVerification ? 'Sending...' : 'Resend verification email'}
              </button>
            ` : ''}
          </div>
        ` : ''}
        <form @submit=${this.handleSubmit}>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required />
          </div>
          ${!this.isLogin ? html`
            <div class="form-group">
              <label for="password-confirm">Confirm Password</label>
              <input type="password" id="password-confirm" name="password_confirm" required />
            </div>
          ` : ''}
          <button type="submit" ?disabled=${this.loading}>
            ${this.loading 
              ? (this.isLogin ? 'Logging in...' : 'Registering...') 
              : (this.isLogin ? 'Log in' : 'Register')}
          </button>
        </form>
        <div class="toggle-mode">
          <button 
            class="text-button" 
            @click=${() => this.isLogin = !this.isLogin}
          >
            ${this.isLogin 
              ? 'Need an account? Register' 
              : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    `;
  }
}
