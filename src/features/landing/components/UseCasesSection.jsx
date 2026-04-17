import PropTypes from 'prop-types'

const colorClasses = {
  purple: { border: 'border-purple', bg: 'bg-purple', iconColor: 'white' },
  green: { border: 'border-green', bg: 'bg-green', iconColor: 'black' },
  blue: { border: 'border-blue', bg: 'bg-blue', iconColor: 'white' },
  yellow: { border: 'border-yellow', bg: 'bg-yellow', iconColor: 'black' }
}

export function UseCasesSection({ useCases }) {
  return (
    <section className="py-24 bg-white">
      <div className="w-full max-w-[1200px] mx-auto px-4">
        
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Được xây dựng cho mọi nhóm</h2>
          <p className="text-gray text-lg">Từ startup đến doanh nghiệp lớn, chúng tôi có giải pháp cho bạn</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase) => (
            <UseCaseCard key={useCase.id} {...useCase} />
          ))}
        </div>

      </div>
    </section>
  )
}

UseCasesSection.propTypes = {
  useCases: PropTypes.array.isRequired
}

function UseCaseCard({ icon: Icon, title, description, color }) {
  const classes = colorClasses[color] || colorClasses.yellow
  
  return (
    <div 
      className={`bg-white border ${classes.border} rounded-2xl p-8 h-full text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md`}
    >
      <div 
        className={`mx-auto mb-4 flex items-center justify-center w-16 h-16 ${classes.bg} rounded-2xl`}
      >
        <Icon size={32} color={classes.iconColor} />
      </div>
      <h5 className="font-bold text-lg mb-2">{title}</h5>
      <p className="text-gray text-sm mb-0">{description}</p>
    </div>
  )
}