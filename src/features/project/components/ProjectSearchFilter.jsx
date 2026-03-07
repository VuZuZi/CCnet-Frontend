import { FiSearch } from 'react-icons/fi';

export function ProjectSearchFilter({ 
  searchValue, 
  onSearchChange, 
  statusFilter, 
  onStatusChange,
  sortBy,
  onSortChange 
}) {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        <div className="md:col-span-6 relative">
          <FiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray" />
          <input
            type="text"
            className="w-full pl-11 pr-4 h-12 border border-light-gray rounded-lg bg-white text-black focus:outline-none focus:border-yellow focus:ring-1 focus:ring-yellow transition-colors"
            placeholder="Search campaigns..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="md:col-span-3">
          <select
            className="w-full h-12 px-4 border border-light-gray rounded-lg bg-white text-black focus:outline-none focus:border-yellow focus:ring-1 focus:ring-yellow transition-colors cursor-pointer"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        
        <div className="md:col-span-3">
          <select
            className="w-full h-12 px-4 border border-light-gray rounded-lg bg-white text-black focus:outline-none focus:border-yellow focus:ring-1 focus:ring-yellow transition-colors cursor-pointer"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="createdAt">Newest First</option>
            <option value="title">Title A-Z</option>
            <option value="financialGoal">Highest Goal</option>
            <option value="startDate">Start Date</option>
          </select>
        </div>
        
      </div>
    </div>
  );
}