import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('empty-state')
export class EmptyState extends LitElement {
  @property({ type: String }) title = 'No data available';
  @property({ type: String }) message = 'There is no data to display at this time.';
  @property({ type: String }) icon = '';
  @property({ type: Boolean }) compact = false;

  static styles = css`
    :host {
      display: block;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--space-xl);
      background: var(--midnight-plum);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      margin: var(--space-xl) auto;
    }

    .empty-state.compact {
      padding: var(--space-md);
      margin: var(--space-md) auto;
    }

    .empty-icon {
      width: 120px;
      height: 120px;
      margin-bottom: var(--space-lg);
      opacity: 0.8;
    }

    .compact .empty-icon {
      width: 80px;
      height: 80px;
      margin-bottom: var(--space-md);
    }

    h2 {
      color: var(--toxic-green);
      margin: 0 0 var(--space-sm);
      font-size: var(--text-xl);
    }

    .compact h2 {
      font-size: var(--text-lg);
    }

    p {
      color: var(--color-text-muted);
      margin: 0;
    }

    ::slotted(button) {
      margin-top: var(--space-md);
    }
  `;

  render() {
    return html`
      <div class="empty-state ${this.compact ? 'compact' : ''}">
        ${this.icon ? html`<img src="${this.icon}" alt="${this.title}" class="empty-icon" />` : ''}
        <h2>${this.title}</h2>
        <p>${this.message}</p>
        <slot></slot>
      </div>
    `;
  }
}
