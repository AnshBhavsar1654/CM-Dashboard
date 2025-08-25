// Fixed hardcoded home coordinates
// These coordinates represent a central point in Gujarat

interface HomeCoordinates {
  latitude: number;
  longitude: number;
}

// Fixed hardcoded coordinates
export const HOME_COORDINATES: HomeCoordinates = {
  latitude: 23.22148141284724, // Location of CM (Starting point)
  longitude: 72.6572008,
};

export function getHomeCoordinates(): HomeCoordinates {
  return HOME_COORDINATES;
}
