import { LitElement, html, css } from 'lit';
import { Task } from '@lit/task';
import { customElement } from 'lit/decorators.js';
import { format, parseISO } from 'date-fns';
import { api } from '../services/api';
import { Play } from '../types/play';
import { formatDuration } from '../utils/formatters';
import './empty-state';
import { createFetchPlaysTask } from '@/tasks/fetch-plays-task';

@customElement('play-history')
export class PlayHistory extends LitElement {

  static styles = css`
    :host {
      display: block;
      padding: var(--space-md) 0;
      margin-left: 300px;
    }

    .play-list {
      display: flex;
      flex-direction: column;
      max-width: 740px;
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

  #fetchPlays = createFetchPlaysTask(this);

  #formatDate(dateStr: string): string {
    const date = parseISO(dateStr + 'Z');
    return format(date, 'PPPPp');
  }

  #getRatingEmoji(rating: Play['rating']): ReturnType<typeof html> {
    switch (rating?.toUpperCase()) {
      case 'LIKE': return html`<img src="/images/cyber-heart.svg" alt="Like" style="width: 24px; height: 24px; vertical-align: middle;">`;
      case 'BAN': return html`<img src="/images/cyber-ban.svg" alt="Ban" style="width: 24px; height: 24px; vertical-align: middle;">`;
      case 'TIRED': return html`<img src="/images/cyber-tired.svg" alt="Tired" style="width: 24px; height: 24px; vertical-align: middle;">`;
      default: return html``;
    }
  }

  #renderEmptyState() {
    return html`
      <empty-state
        title="No listening history yet"
        message="Your play history will appear here once you start listening to music."
        icon="/images/empty-plays.svg"
      ></empty-state>
    `;
  }

  render() {
    return html`
      <h1>Plays</h1>
      ${this.#fetchPlays.render({
      pending: () => html`<div class="loading">Loading plays...</div>`,
      error: (err) => html`<div class="error">Failed to load plays: ${err}</div>`,
      complete: (plays) => {
        if (!plays || plays.length === 0) {
          return this.#renderEmptyState();
        }

        return html`
            <div class="play-list">
              ${plays.map(play => html`<div class="play-item">
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
                    <div>${this.#formatDate(play.created_at)}</div>
                    ${play.duration ? html`<div>•</div>
                      <div>${formatDuration(play.duration)}</div>
                    ` : ''}
                  </div>
                </div>
                <div class="rating ${play.rating}">${this.#getRatingEmoji(play.rating)}</div>
              </div>
            `)}
            </div>
          `;
      },
    })}
    `;
  }
}
