export const handleMapMoveEnd = (mapRef, outerBounds) => {
    const map = mapRef.current;

    if (map) {
      const currentBounds = map.getBounds();

      if (!outerBounds.contains(currentBounds)) {
        map.fitBounds(outerBounds);
      }
    }
};