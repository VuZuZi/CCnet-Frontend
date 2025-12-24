import { Outlet } from 'react-router-dom'
import { Navbar } from '../common/Navbar'


export function RootLayout() {
  return (
    <div className="app">
      <Navbar />
      <Outlet />
    </div>
  )
}