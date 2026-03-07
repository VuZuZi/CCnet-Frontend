import PropTypes from 'prop-types'

export function StatsSection({ stats }) {
  return (
    <section className="py-24 bg-off-white">
      <div className="w-full max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div 
              key={stat.id}
              className="bg-white rounded-[24px] p-8 text-center border border-light-gray transition-all duration-300 hover:border-yellow hover:shadow-md hover:scale-105"
            >
              <div className="text-5xl font-extrabold text-black mb-2">{stat.value}</div>
              <div className="text-gray">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

StatsSection.propTypes = {
  stats: PropTypes.array.isRequired
}