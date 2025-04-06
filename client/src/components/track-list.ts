import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { formatDistanceToNow } from 'date-fns';

interface Track {
  title: string;
  artist: string;
  album: string;
  station: string;
  played_at: string;
}

@customElement('track-list')
export class TrackList extends LitElement {
  @property({ type: Array })
  recentTracks: Track[] = [];

  @state()
  private currentTrack: Track | null = null;

  private eventSource?: EventSource;

  static styles = css`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .track-card {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      transition: transform 0.2s ease;
    }

    .track-card:hover {
      transform: translateY(-2px);
    }

    .track-card.current {
      background: #e0f2f1;
      border-left: 4px solid #009688;
    }

    h2 {
      color: #333;
      margin-bottom: 1rem;
    }

    h3 {
      margin: 0;
      color: #1a1a1a;
    }

    .artist {
      color: #666;
      font-weight: 500;
      margin: 0.5rem 0;
    }

    .album {
      color: #888;
      font-style: italic;
      margin: 0.25rem 0;
    }

    .meta {
      display: flex;
      justify-content: space-between;
      color: #666;
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.fetchRecentTracks();
    this.initializeSSE();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.eventSource?.close();
  }

  private async fetchRecentTracks() {
    try {
      const response = await fetch('http://localhost:8000/tracks/recent');
      this.recentTracks = await response.json();
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  }

  private initializeSSE() {
    this.eventSource = new EventSource('http://localhost:8000/tracks/live');

    this.eventSource.onmessage = (event) => {
      const track = JSON.parse(event.data);
      this.currentTrack = track;
      this.recentTracks = [track, ...this.recentTracks.slice(0, 9)];
    };

    this.eventSource.onerror = () => {
      console.error('SSE connection failed, retrying...');
      this.eventSource?.close();
      setTimeout(() => this.initializeSSE(), 5000);
    };
  }

  private renderTrackCard(track: Track, isCurrent = false) {
    return html`
      <div class="track-card ${isCurrent ? 'current' : ''}">
        <h3>${track.title}</h3>
        <p class="artist">${track.artist}</p>
        <p class="album">${track.album}</p>
        ${isCurrent
          ? html`<p class="station">on ${track.station}</p>`
          : html`<p class="meta">
              <span class="station">${track.station}</span>
              <span class="time">${formatDistanceToNow(new Date(track.played_at))} ago</span>
            </p>`}
      </div>
    `;
  }

  render() {
    return html`
      ${this.currentTrack
        ? html`
            <section class="now-playing">
              <h2>Now Playing</h2>
              ${this.renderTrackCard(this.currentTrack, true)}
            </section>
          `
        : ''}

      <section class="recent-tracks">
        <h2>Recent Tracks</h2>
        ${this.recentTracks.map((track) => this.renderTrackCard(track))}
      </section>
    `;
  }
}
