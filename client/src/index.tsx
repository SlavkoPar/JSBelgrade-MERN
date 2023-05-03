import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router} from 'react-router-dom'

import 'normalize.scss'
import 'index.css';
import App from 'App';
import { GlobalProvider } from 'global/GlobalProvider';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <React.StrictMode>
  <GlobalProvider>
    <Router>
      <App />
    </Router>
  </GlobalProvider>
  // </React.StrictMode>
);
