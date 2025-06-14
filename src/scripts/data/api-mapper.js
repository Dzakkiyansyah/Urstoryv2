import Map from '../utils/map';

export async function storyMapper(story) {
  if (story.lat == null || story.lon == null) {
    return {
      ...story,
      location: {
        placeName: 'Lokasi tidak tersedia',
      },
    };
  }

  try {
    const placeName = await Map.getPlaceNameByCoordinate(story.lat, story.lon);
    return {
      ...story,
      location: {
        placeName: placeName,
      },
    };
  } catch (error) {
    console.error('Error in storyMapper while fetching placeName:', error);
    return {
      ...story,
      location: {
        placeName: `Koordinat: ${parseFloat(story.lat).toFixed(
          4
        )}, ${parseFloat(story.lon).toFixed(4)}`,
      },
    };
  }
}
