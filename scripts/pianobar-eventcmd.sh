#!/bin/bash

API_URL="http://localhost:8000/track/play"
API_KEY="-qr-WAHu8HQhxT1FCD36kz9vd2RIbx65BVYqskYcLwE"  # From registration
LOG_FILE="$HOME/.config/pianobar/track_haus.log"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Only process the script when the event is "songfinish"
if [ "$1" == "songfinish" ]; then
    # Read Pianobar's event data
    title=""
    artist=""
    album=""
    rating="UNRATED"
    station=""
    duration=0

    while IFS='=' read -r key value; do
        case "$key" in
            title) title="$value" ;;
            artist) artist="$value" ;;
            album) album="$value" ;;
            rating) 
                case "$value" in
                    0) rating="0" ;;
                    1) rating="1" ;;
                    2) rating="2" ;;
                    3) rating="3" ;;
                esac
                ;;
            stationName) station="$value" ;;
            songDuration) duration="$value" ;;
        esac
    done

    # Check if we have all required fields
    missing_fields=""
    [ -z "$title" ] && missing_fields="$missing_fields title"
    [ -z "$artist" ] && missing_fields="$missing_fields artist"
    [ -z "$album" ] && missing_fields="$missing_fields album"
    [ -z "$station" ] && missing_fields="$missing_fields station"

    if [ -n "$missing_fields" ]; then
        log "Error: Missing required fields:$missing_fields"
        exit 1
    fi

    # Send track data to FastAPI
    response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
         -H "Content-Type: application/json" \
         -H "X-API-Key: $API_KEY" \
         -d "{
           \"title\": \"$title\",
           \"artist\": \"$artist\",
           \"album\": \"$album\",
           \"station\": \"$station\",
           \"rating\": \"$rating\",
           \"duration\": \"$duration\"
         }")

    # Split response into body and status code
    http_body=$(echo "$response" | head -n 1)
    http_code=$(echo "$response" | tail -n 1)

    if [ "$http_code" -eq 200 ]; then
        log "Successfully recorded play: $artist - $title"
    else
        log "Error recording play: $http_body (HTTP $http_code)"
        log "Song data: $artist - $title ($album)"
    fi
fi
