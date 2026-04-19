export const VIETNAM_MAP_CENTER = [16.2, 106.2];
export const VIETNAM_DEFAULT_ZOOM = 6;
export const VIETNAM_MAP_BOUNDS = [
  [8.18, 102.14],
  [23.45, 109.55],
];

export const NEED_HELP_CLUSTER_SWITCH_ZOOM = 11;
export const NEED_HELP_SIDEBAR_ITEM_HEIGHT = 248;
export const NEED_HELP_SIDEBAR_OVERSCAN = 3;
export const NEED_HELP_MAX_VISIBLE_SIDEBAR_ITEMS = 200;

export const DEFAULT_VIETNAM_BBOX = [
  VIETNAM_MAP_BOUNDS[0][1],
  VIETNAM_MAP_BOUNDS[0][0],
  VIETNAM_MAP_BOUNDS[1][1],
  VIETNAM_MAP_BOUNDS[1][0],
];

export const CATEGORY_OPTIONS = [
  { value: '', label: 'Tất cả danh mục' },
  { value: 'Y_TE', label: 'Hỗ trợ y tế' },
  { value: 'GIAO_DUC', label: 'Giáo dục' },
  { value: 'THIEN_TAI', label: 'Cứu trợ thiên tai' },
  { value: 'XAY_DUNG', label: 'Xây dựng' },
  { value: 'MOI_TRUONG', label: 'Môi trường' },
  { value: 'KHAC', label: 'Khác' },
];

export const URGENCY_OPTIONS = [
  { value: '', label: 'Tất cả mức độ' },
  { value: 'CRITICAL', label: 'Khẩn cấp' },
  { value: 'HIGH', label: 'Cao' },
  { value: 'MEDIUM', label: 'Trung bình' },
  { value: 'LOW', label: 'Thấp' },
];

export const normalizeVietnameseText = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();

export const getUrgencyLabel = (value = '') => {
  const key = String(value).toUpperCase();

  if (key === 'CRITICAL') return 'Khẩn cấp';
  if (key === 'HIGH') return 'Cao';
  if (key === 'MEDIUM') return 'Trung bình';
  if (key === 'LOW') return 'Thấp';
  return 'Trung bình';
};

export const getUrgencyBadgeClass = (value = '') => {
  const key = String(value).toUpperCase();

  if (key === 'CRITICAL') return 'bg-red-100 text-red-700 border-red-200';
  if (key === 'HIGH') return 'bg-orange-100 text-orange-700 border-orange-200';
  if (key === 'MEDIUM') return 'bg-amber-100 text-amber-700 border-amber-200';
  if (key === 'LOW') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

export const getCategoryLabel = (value = '') => {
  const key = String(value).toUpperCase();

  if (key === 'Y_TE') return 'Hỗ trợ y tế';
  if (key === 'GIAO_DUC') return 'Giáo dục';
  if (key === 'THIEN_TAI') return 'Cứu trợ thiên tai';
  if (key === 'XAY_DUNG') return 'Xây dựng';
  if (key === 'MOI_TRUONG') return 'Môi trường';
  return 'Khác';
};

export const normalizeNeedHelpMapItems = (items = []) =>
  (Array.isArray(items) ? items : [])
    .map((item) => {
      const coordinates = item?.coordinates || item?.location?.coordinates;

      if (!Array.isArray(coordinates) || coordinates.length < 2) {
        return null;
      }

      const [longitude, latitude] = coordinates.map(Number);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
      }

      const category = item?.category || 'KHAC';
      const categoryLabel = getCategoryLabel(category);
      const title = item?.title || 'Yêu cầu trợ giúp';
      const story = item?.story || '';
      const address =
        item?.address || item?.location?.address || 'Chưa có địa điểm cụ thể';

      return {
        id: String(item?.id || item?._id || ''),
        title,
        story,
        urgencyLevel: item?.urgencyLevel || 'MEDIUM',
        category,
        categoryLabel,
        status: item?.status || '',
        address,
        latitude,
        longitude,
        amountNeeded: Number(item?.amountNeeded || 0),
        searchText: normalizeVietnameseText(
          [title, address, story, categoryLabel].filter(Boolean).join(' ')
        ),
        raw: item,
      };
    })
    .filter(Boolean);

export const applyNeedHelpMapFilters = (items = [], filters = {}) => {
  const search = normalizeVietnameseText(filters?.search || '');
  const category = String(filters?.category || '').trim();
  const urgencyLevel = String(filters?.urgencyLevel || '').trim();

  return items.filter((item) => {
    if (category && item.category !== category) return false;
    if (urgencyLevel && item.urgencyLevel !== urgencyLevel) return false;
    if (search && !item.searchText?.includes(search)) return false;
    return true;
  });
};

export const getVisibleItemsFromViewport = (items = [], viewport = null) => {
  if (!viewport) return items;

  return items.filter((item) => {
    return (
      item.latitude <= viewport.north &&
      item.latitude >= viewport.south &&
      item.longitude <= viewport.east &&
      item.longitude >= viewport.west
    );
  });
};

export const sortNeedHelpItems = (items = []) => {
  const urgencyWeight = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  return [...items].sort((a, b) => {
    const urgencyDiff =
      (urgencyWeight[b.urgencyLevel] || 0) - (urgencyWeight[a.urgencyLevel] || 0);

    if (urgencyDiff !== 0) return urgencyDiff;

    const amountDiff = Number(b.amountNeeded || 0) - Number(a.amountNeeded || 0);
    if (amountDiff !== 0) return amountDiff;

    return String(a.title || '').localeCompare(String(b.title || ''), 'vi');
  });
};

export const limitSidebarItems = (items = [], maxItems = NEED_HELP_MAX_VISIBLE_SIDEBAR_ITEMS) =>
  (Array.isArray(items) ? items : []).slice(0, maxItems);

export const getClusterBadgeSizeClass = (count = 0) => {
  if (count >= 100) return 'h-[84px] w-[84px] text-[22px]';
  if (count >= 30) return 'h-[76px] w-[76px] text-[20px]';
  if (count >= 10) return 'h-[68px] w-[68px] text-[19px]';
  if (count >= 5) return 'h-[62px] w-[62px] text-[18px]';
  return 'h-[56px] w-[56px] text-[17px]';
};

export const getClusterIconPixelSize = (count = 0) => {
  if (count >= 100) return 104;
  if (count >= 30) return 96;
  if (count >= 10) return 88;
  if (count >= 5) return 82;
  return 76;
};

export const toNeedHelpGeoJsonPoints = (items = []) =>
  items.map((item) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [item.longitude, item.latitude],
    },
    properties: {
      id: item.id,
      title: item.title,
      story: item.story,
      urgencyLevel: item.urgencyLevel,
      category: item.category,
      categoryLabel: item.categoryLabel,
      status: item.status,
      address: item.address,
      amountNeeded: item.amountNeeded,
      latitude: item.latitude,
      longitude: item.longitude,
    },
  }));

export const formatNeedHelpMapSummary = ({
  total = 0,
  visible = 0,
  clusterCount = 0,
  mode = 'cluster',
}) => {
  if (mode === 'cluster') {
    return `${clusterCount} cụm • ${visible} yêu cầu trong vùng • ${total} tổng cộng`;
  }

  return `${visible} yêu cầu trong vùng • ${total} tổng cộng`;
};

export const buildViewportSignature = (viewport = null) => {
  if (!viewport) return '';

  return JSON.stringify({
    north: Number(Number(viewport.north || 0).toFixed(5)),
    south: Number(Number(viewport.south || 0).toFixed(5)),
    east: Number(Number(viewport.east || 0).toFixed(5)),
    west: Number(Number(viewport.west || 0).toFixed(5)),
    zoom: Number(viewport.zoom || 0),
  });
};