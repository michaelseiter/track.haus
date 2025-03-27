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
      padding: 1rem;
    }

    .play-list {
      display: grid;
      gap: 1rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .play-card {
      background: var(--surface-2);
      border-radius: 8px;
      padding: 1rem;
      display: grid;
      gap: 0.5rem;
    }

    .track-title {
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--text-1);
    }

    .track-meta {
      color: var(--text-2);
      font-size: 0.9rem;
    }

    .station {
      color: var(--text-2);
      font-size: 0.8rem;
    }

    .timestamp {
      color: var(--text-3);
      font-size: 0.8rem;
    }

    .rating {
      font-size: 1.2rem;
    }

    .rating.LIKE {
      color: var(--green-6);
    }

    .rating.DISLIKE {
      color: var(--red-6);
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
    switch (rating) {
      case 'LIKE': return '👍';
      case 'DISLIKE': return '👎';
      default: return '•';
    }
  }

  render() {
    if (this.loading) {
      return html`<div>Loading...</div>`;
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
