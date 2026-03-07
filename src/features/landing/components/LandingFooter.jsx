import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

export function LandingFooter({ navigation }) {
  return (
    <footer className="bg-white border-t border-light-gray pt-16 pb-8">
      <div className="w-full max-w-[1200px] mx-auto px-4">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          <div className="md:col-span-4 mb-8 md:mb-0">
            <div className="flex items-center mb-4">
               <span className="font-bold text-2xl text-black">CCNet</span>
            </div>
            <p className="text-gray">Modern management system for modern teams.</p>
          </div>
          
          <div className="md:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {Object.entries(navigation).map(([key, links]) => (
                <div key={key}>
                  <h6 className="font-bold mb-4 capitalize text-black">{key}</h6>
                  <ul className="list-none p-0 m-0">
                    {links.map((link) => (
                      <li className="mb-2" key={link.path}>
                        <Link 
                          to={link.path} 
                          className="text-gray no-underline block transition-colors duration-200 hover:text-orange"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <hr className="my-8 border-light-gray" />
        
        <div className="text-center text-gray text-sm">
          © {new Date().getFullYear()} CCNet. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

LandingFooter.propTypes = {
  navigation: PropTypes.object.isRequired
}