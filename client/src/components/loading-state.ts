import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('loading-state')
export class LoadingState extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    .loading-state {
      text-align: center;
      padding: var(--space-xl);
      color: var(--text-2);
    }
  `;

  render() {
    return html`<div class="loading-state">Loading...</div>`;
  }
}
