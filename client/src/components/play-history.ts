import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { format } from 'date-fns';

// Make TypeScript happy with our custom elements
declare global {
  interface HTMLElementTagNameMap {
    'play-history': PlayHistory;
  }
}
import { Play } from '../types/play';

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
    }

    .play-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      max-width: 800px;
      margin: 0 auto;
    }

    .play-item {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: var(--space-sm);
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-sm);
      transition: background-color 0.2s ease;
      position: relative;
    }

    .play-item:hover {
      background: var(--surface-2);
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

    .rating.DISLIKE {
      color: var(--error);
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
  `;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadPlays();
  }

  private async loadPlays() {
    try {
      // TODO: Replace with your API key from registration
      const API_KEY = '2qhqGuY4ACHcp8V90twM0KFKTQqid6Hd3r3CHPP6cRk';
      
      console.log('Fetching plays...');
      const response = await fetch('http://localhost:8000/plays?api_key=' + API_KEY);
      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);
      
      const text = await response.text();
      console.log('Response text:', text);
      
      if (!response.ok) {
        try {
          const data = JSON.parse(text);
          throw new Error(data.detail || 'Failed to load plays');
        } catch (parseError) {
          throw new Error(`Failed to load plays: ${text}`);
        }
      }
      
      this.plays = JSON.parse(text);
      console.log('Loaded plays:', this.plays);
    } catch (e) {
      console.error('Error loading plays:', e);
      this.error = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      this.loading = false;
    }
  }

  private formatDate(dateStr: string): string {
    return format(new Date(dateStr), 'MMM d, yyyy h:mm a');
  }

  private getRatingEmoji(rating: Play['rating']): string {
    switch (rating.toUpperCase()) {
      case 'LIKE': return '🤘';
      case 'DISLIKE': return '😡';
      default: return '😐';
    }
  }

  render() {
    if (this.loading) {
      return html`<div class="loading">Loading...</div>`;
    }

    if (this.error) {
      return html`<div class="error">${this.error}</div>`;
    }

    return html`
      <div class="play-list">
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
