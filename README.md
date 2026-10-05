# carmelarkin.com

Carmel's personal website.

## How to edit

### Add photos
1. Put your photos in the `img/` folder
2. Name them to match the placeholders (e.g., `placeholder-mt-hamilton.jpg`)
3. Or update the `src="..."` in `index.html` to match your filenames

### Add map pins
Edit `pins.js`:
- **Visited places:** Add to the `visitedPins` array
- **Favorite places:** Add to `favoritePins` (includes photo + memory)
- **Want to visit:** Add to `wantToVisitPins`

Each pin needs: `{ name: "Place Name", lat: 37.0, lng: -122.0 }`

### Add YouTube videos

