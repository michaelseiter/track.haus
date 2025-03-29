import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { format } from 'date-fns';
import { api } from '../services/api';
import { Play } from '../types/play';

// Make TypeScript happy with our custom elements
declare global {
  interface HTMLElementTagNameMap {
    'play-history': PlayHistory;
  }
}

@customElement('play-history')
export class PlayHistory extends LitElement {
  @state()
  private plays: Play[] = [];

  @state()
  private loading = true;

  @state()
  private error: string | null = null;

  static styles = css`
    :host {
      display: block;
      padding: var(--space-md) 0;
      margin-left: 300px;
    }

    .play-list {
      display: flex;
      flex-direction: column;
    }

    h1 {
      margin-left: var(--space-md);
    }

    .play-item {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: var(--space-sm);
      padding: var(--space-md);
      border-radius: var(--radius-sm);
      transition: background-color 0.2s ease;
      position: relative;
      border-bottom: 4px double rgba(255, 255, 255, 0.2);
    }

    .play-item:hover {
      background: var(--surface-3);
    }

    .play-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-2xs);
      min-width: 0;
    }

    .primary-info {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      min-width: 0;
    }

    .track-title {
      font-weight: var(--font-medium);
      color: var(--text-1);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .artist {
      color: var(--text-2);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .secondary-info {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      font-size: var(--font-size-sm);
      color: var(--text-3);
    }

    .album {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .station {
      color: var(--primary);
    }

    .rating {
      font-size: var(--font-size-md);
      opacity: 0.7;
      transition: opacity 0.2s ease;
    }

    .play-item:hover .rating {
      opacity: 1;
    }

    .rating.LIKE {
      color: var(--success);
    }

    .rating.BAN {
      color: var(--error);
    }

    .rating.TIRED {
      color: var(--warning);
    }

    .rating.UNRATED {
      color: var(--text-3);
    }

    .error {
      color: var(--error);
      padding: var(--space-md);
      border: 1px solid var(--error);
      border-radius: var(--radius-sm);
      margin: var(--space-md) 0;
      text-align: center;
      background: rgba(255, 0, 127, 0.1);
      box-shadow: var(--glow-sm);
    }

    .loading {
      text-align: center;
      padding: var(--space-xl);
      color: var(--text-2);
    }

    .cyber-tired {
      fill: var(--plasma-purple);
      stroke: var(--plasma-purple);
      }
  `;

  override async connectedCallback() {
    super.connectedCallback();
    await this.loadPlays();
  }

  private async loadPlays() {
    try {
      console.log('Fetching plays...');
      const data = await api.getPlays();
      console.log('Received plays:', data);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      this.plays = data;
    } catch (e: unknown) {
      console.error('Error loading plays:', e);
      this.error = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      this.loading = false;
    }
  }

  private formatDate(dateStr: string): string {
    return format(new Date(dateStr + 'Z'), 'MMM d, yyyy h:mm a');
  }

  private getRatingEmoji(rating: Play['rating']): ReturnType<typeof html> {
    switch (rating?.toUpperCase()) {
      case 'LIKE': return html`<img src="/cyber-heart.svg" alt="Like" style="width: 24px; height: 24px; vertical-align: middle;">`;
      case 'BAN': return html`<img src="/cyber-ban.svg" alt="Ban" style="width: 24px; height: 24px; vertical-align: middle;">`;
      case 'TIRED': return html`<img src="/cyber-tired.svg" alt="Tired" style="width: 24px; height: 24px; vertical-align: middle;">`;
      default: return html``;
    }
  }

  override render() {
    if (this.loading) {
      return html`<div class="loading">Loading...</div>`;
    }

    if (this.error) {
      return html`<div class="error">${this.error}</div>`;
    }

    return html`
      <div class="play-list">
      <h1>Plays</h1>
        ${this.plays.map(play => html`
          <div class="play-item">
            <div class="play-content">
              <div class="primary-info">
                <div class="track-title">${play.track.title}</div>
                <div class="artist">by ${play.track.artist.name}</div>
              </div>
              <div class="secondary-info">
                <div class="album">${play.track.album.title}</div>
                <div>•</div>
                <div class="station">${play.station.name}</div>
                <div>•</div>
                <div>${this.formatDate(play.played_at)}</div>
              </div>
            </div>
            <div class="rating ${play.rating}">${this.getRatingEmoji(play.rating)}</div>
          </div>
        `)}
      </div>
    `;
  }
}
