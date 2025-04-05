import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import { formatDuration, formatDate } from "../utils/formatters";
import { createFetchStatsTask } from "@/tasks/fetch-stats-task";
import "./empty-state";

interface TopItem {
  id: number;
  name: string;
  play_count: number;
  last_played: string;
}

interface TimeStats {
  hour?: number;
  day?: number;
  month?: number;
  play_count: number;
}

interface RatingStats {
  rating: string;
  play_count: number;
}

interface Stats {
  overall: {
    total_plays: number;
    unique_tracks: number;
    unique_artists: number;
    total_time_seconds: number;
    first_play: string;
    last_play: string;
  };
  top_tracks: TopItem[];
  top_artists: TopItem[];
  top_albums: TopItem[];
  top_stations: TopItem[];
  plays_by_hour: TimeStats[];
  plays_by_day: TimeStats[];
  plays_by_month: TimeStats[];
  rating_distribution: RatingStats[];
}

@customElement("stats-page")
export class StatsPage extends LitElement {

  static styles = css`
    :host {
      display: block;
      padding: var(--space-md) 0;
      max-width: 620px;
      margin: 0 auto;
      margin-left: 300px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--space-lg);
      margin-bottom: var(--space-xl);
    }

    .card {
      background: var(--midnight-plum);
      border-radius: var(--radius-lg);
      padding: var(--space-lg);
      box-shadow: var(--shadow-md);
    }

    .card-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-md);
    }

    .card h2 {
      margin: 0 0 var(--space-md);
      color: var(--toxic-green);
      font-size: var(--text-xl);
    }

    .stat {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--space-sm);
      padding-bottom: var(--space-sm);
      border-bottom: 2px solid var(--synthwave-plum);
    }

    .stat:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .stat-label {
      color: var(--color-text-muted);
    }

    .stat-value {
      font-weight: 500;
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
      color: var(--color-text-muted);
      padding: var(--space-xl);
    }
    

  `;

  #fetchStats = createFetchStatsTask(this);

  #formatHour(hour: number | null | undefined) {
    if (hour === null || hour === undefined) return '--:00 AM';
    // Convert UTC hour to local time
    const localHour = ((hour - new Date().getTimezoneOffset() / 60) + 24) % 24;
    const hour12 = localHour % 12 || 12; // Convert to 12-hour format
    const ampm = localHour < 12 ? 'AM' : 'PM';
    return `${hour12}:00 ${ampm}`;
  }

  #formatDay(day: number | null | undefined) {
    if (day === null || day === undefined) return '--';
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day];
  }

  #formatMonth(month: number | null | undefined) {
    if (month === null || month === undefined) return '--';
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1];
  }

  #renderOverallStats(overall: Stats['overall']) {
    return html`
      <div class="card">
        <h2>Overall Stats</h2>
        <div class="stat">
          <span class="stat-label">Total Plays</span>
          <span class="stat-value">${overall.total_plays}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Unique Tracks</span>
          <span class="stat-value">${overall.unique_tracks}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Unique Artists</span>
          <span class="stat-value">${overall.unique_artists}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Total Time</span>
          <span class="stat-value">${formatDuration(overall.total_time_seconds)}</span>
        </div>
        <div class="stat">
          <span class="stat-label">First Play</span>
          <span class="stat-value">${formatDate(overall.first_play)}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Last Play</span>
          <span class="stat-value">${formatDate(overall.last_play)}</span>
        </div>
      </div>
    `;
  }

  #renderTopItems(title: string, items: TopItem[]) {
    return html`
      <div class="card">
        <div class="card-heading">
          <h2>${title}</h2>
          <div>Plays</div>
        </div>
        ${items.map(
      (item) => html`
            <div class="stat">
              <span class="stat-label">${item.name}</span>
              <span class="stat-value">${item.play_count}</span>
            </div>
          `
    )}
      </div>
    `;
  }

  #renderTimeStats(title: string, stats: TimeStats[]) {
    return html`
      <div class="card">
        <div class="card-heading">
          <h2>${title}</h2>
          <div>Plays</div>
        </div>
        ${stats.map(
      (stat) => html`
            <div class="stat">
              <span class="stat-label">
                ${stat.hour !== null && stat.hour !== undefined
          ? this.#formatHour(stat.hour)
          : stat.day !== null && stat.day !== undefined
            ? this.#formatDay(stat.day)
            : this.#formatMonth(stat.month)}
              </span>
              <span class="stat-value">${stat.play_count}</span>
            </div>
          `
    )}
      </div>
    `;
  }

  #renderRatingStats(rating_distribution: RatingStats[]) {
    return html`
      <div class="card">
        <div class="card-heading">
          <h2>Ratings</h2>
          <div>Plays</div>
        </div>
        ${rating_distribution.map(
      (stat) => html`
            <div class="stat">
              <span class="stat-label">${stat.rating}</span>
              <span class="stat-value">${stat.play_count}</span>
            </div>
          `
    )}
      </div>
    `;
  }

  #renderEmptyState() {
    return html`
      <empty-state
        title="No listening data yet"
        message="Start playing some music to see your stats here!"
        icon="/images/empty-stats.svg"
      ></empty-state>
    `;
  }

  render() {
    return html`
      <h1>Stats</h1>

      ${this.#fetchStats.render({
        pending: () => html`<div class="loading">Loading stats...</div>`,
        error: (err) => html`<div class="error">Failed to load stats: ${err}</div>`,
        complete: (stats) => {
          // Check if there's any play data
          if (!stats || stats.overall.total_plays === 0) {
            return this.#renderEmptyState();
          }
          
          return html`
            <div class="grid">
              ${this.#renderOverallStats(stats.overall)}
              ${this.#renderTopItems("Top Stations", stats.top_stations)}
              ${this.#renderTopItems("Top Artists", stats.top_artists)}
              ${this.#renderTopItems("Top Albums", stats.top_albums)}
              ${this.#renderTopItems("Top Tracks", stats.top_tracks)}
              ${this.#renderTimeStats("Plays by Hour", stats.plays_by_hour)}
              ${this.#renderTimeStats("Plays by Day", stats.plays_by_day)}
              ${this.#renderTimeStats("Plays by Month", stats.plays_by_month)}
              ${this.#renderRatingStats(stats.rating_distribution)}
            </div>
          `;
        },
      })}
    `;
  }

}
