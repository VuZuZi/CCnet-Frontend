export function groupByMonth(items = []) {
  return items.reduce((acc, item) => {
    const d = new Date(item.createdAt);
    const key = `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;

    if (!acc[key]) acc[key] = [];
    acc[key].push(item);

    return acc;
  }, {});
}