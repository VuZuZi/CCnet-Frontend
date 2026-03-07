import PropTypes from 'prop-types'

export function FeaturesSection({ features }) {
  return (
    <section className="py-24 bg-white">
      <div className="w-full max-w-[1200px] mx-auto px-4">
        
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to <span className="text-orange">Succeed</span>
          </h2>
          <p className="text-gray mx-auto max-w-[600px] text-lg">
            Powerful features designed to help your team collaborate better.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div 
              key={feature.id}
              className="group bg-white border border-light-gray rounded-2xl p-8 h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-yellow"
            >
              <div className="w-14 h-14 bg-yellow rounded-2xl flex items-center justify-center mb-6 text-[1.75rem] text-black transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                <feature.icon />
              </div>
              <h4 className="font-bold text-xl mb-3">{feature.title}</h4>
              <p className="text-gray mb-0">{feature.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

FeaturesSection.propTypes = {
  features: PropTypes.array.isRequired
}