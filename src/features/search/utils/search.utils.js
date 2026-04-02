export function parseBooleanParam(value, fallback = false) {
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return fallback;
}

export function buildSearchParams(searchParams, nextValues = {}) {
  const params = new URLSearchParams(searchParams);

  Object.entries(nextValues).forEach(([key, value]) => {
    const shouldDelete =
      value === undefined ||
      value === null ||
      value === "" ||
      value === false;

    if (shouldDelete) {
      params.delete(key);
      return;
    }

    params.set(key, String(value));
  });

  return params;
}

function readLocationValue(item) {
  return String(
    item?.payload?.taggedLocation ||
      item?.payload?.location?.address ||
      item?.payload?.address ||
      ""
  ).trim();
}

export function buildLocationOptions(items = []) {
  const locations = Array.from(
    new Set(items.map(readLocationValue).filter(Boolean))
  );

  return locations.map((location) => ({
    value: location,
    label: location,
  }));
}