const StatCard = ({ title, value }) => {
  const displayValue =
    typeof value === "object" && value !== null ? value.total : value;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <p className="text-gray-500 text-sm">{title}</p>

      <h3 className="text-2xl font-bold mt-2">{displayValue ?? 0}</h3>
    </div>
  );
};

export default StatCard;
