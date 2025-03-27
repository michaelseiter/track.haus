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
      display: grid;
      gap: var(--space-md);
      max-width: 800px;
      margin: 0 auto;
    }

    .play-card {
      background: var(--surface-2);
      border: 1px solid rgba(0, 240, 255, 0.1);
      border-radius: var(--radius-md);
      padding: var(--space-lg);
      display: grid;
      gap: var(--space-sm);
      transition: all 0.3s ease;
      box-shadow: var(--shadow-sm);
      position: relative;
      overflow: hidden;
    }

    .play-card:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: var(--glow-sm), var(--shadow-md);
      border-color: rgba(0, 240, 255, 0.2);
    }

    .track-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-bold);
      letter-spacing: var(--tracking-tight);
      color: var(--text-1);
    }

    .track-meta {
      color: var(--text-2);
      font-size: var(--font-size-md);
    }

    .station {
      color: var(--primary);
      font-size: var(--font-size-sm);
      font-weight: var(--font-medium);
      letter-spacing: var(--tracking-wide);
    }

    .timestamp {
      color: var(--text-3);
      font-size: var(--font-size-sm);
      margin-top: var(--space-sm);
    }

    .rating {
      font-size: var(--font-size-xl);
      position: absolute;
      top: var(--space-md);
      right: var(--space-md);
    }

    .rating.LIKE {
      color: var(--success);
      text-shadow: 0 0 10px var(--success);
    }

    .rating.DISLIKE {
      color: var(--error);
      text-shadow: 0 0 10px var(--error);
    }

    .rating.UNRATED {
      color: var(--text-3);
      text-shadow: 0 0 5px var(--text-3);
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
          <div class="play-card">
            <div class="track-title">${play.track.title}</div>
            <div class="track-meta">${play.track.artist.name} • ${play.track.album.title}</div>
            <div class="station">${play.station.name}</div>
            <div class="timestamp">${this.formatDate(play.played_at)}</div>
            <div class="rating ${play.rating}">${this.getRatingEmoji(play.rating)}</div>
          </div>
        `)}
      </div>
    `;
  }
}
