<p align="center">
  <img src="track-haus-mark.svg" alt="Track Haus Mark" width="250" style="margin: 30px;">
</p>

# 🎧 Track Haus – Real-time Music Tracking 

**Track Haus (`track.haus`)** is a minimalist, real-time **music tracking API** that logs your plays from [pianobar](https://6xq.net/pianobar/) (CLI for [Pandora](https://www.pandora.com/)) and provides analytics on your listening habits. It stores data in PostgreSQL and presents a clean, organized history of your tracks.

## 🌟 Features
- 🎹 **Real-time track logging** for **[pianobar](https://6xq.net/pianobar/)** users
- 📊 **Listening stats** (top artists, most played tracks, etc.)
- 📡 **Live "Now Playing" feed** (coming soon!)
- 🏗️ **API-first design** (FastAPI + PostgreSQL)

## 🎵 How It Works

### 🔹 Integration via pianobar

Track Haus captures every song played through [pianobar](https://6xq.net/pianobar/) by hooking into its event system. When a song finishes playing, pianobar triggers a script that:

1. **Extracts track details** (title, artist, album, station, etc.).
2. **Sends the data** to the Track Haus API.
3. **Stores the track** in PostgreSQL for analytics and history tracking.
4. **Exposes data through API endpoints** for retrieval, visualization, and trend analysis.

This process enables **real-time music logging**, allowing users to view their listening habits, top artists, and favorite tracks.


## 📡 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/tracks/play` | Log a played track |
| `GET` | `/tracks/recent` | Get recently played tracks |
| `GET` | `/stats/top-artists` | Get most played artists |
| `GET` | `/stats/top-songs` | Get most played songs |

More endpoints coming soon! 🚀  


## 🛠️ Tech Stack
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL + SQLAlchemy
- **Dev Tools:** Docker, pyenv, Alembic (for migrations)

## 🛣️ Roadmap
- ✅ Basic **track logging API**
- 🔜 **Live now-playing feed**
- 🔜 **Expand beyond Pianobar (Spotify, Apple Music, etc.)**
- 🔜 **User accounts & personal dashboards**

## 🤝 About This Project
This is a **personal project** designed to explore **FastAPI, PostgreSQL, and real-time data tracking**.

**Future versions** may open it up to more users and streaming platforms.


## 👷‍♂️ Author
**Made by [Michael](https://github.com/michaelseiter)**  



### 🙋 Questions or Feedback?
If you're curious about the project, feel free to **open an issue** or connect with me on **GitHub**!


## 📌 TL;DR
Track Haus is a **real-time music logging API** that captures what you listen to and provides analytics.