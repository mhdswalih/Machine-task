import Sidebar from './components/sidebar/Sidebar'
import { Toaster } from 'react-hot-toast'

const App = () => {
  return (
    <div>
      <Toaster position="bottom-right" reverseOrder={false} />
      <Sidebar />
    </div>
  )
}

export default App
