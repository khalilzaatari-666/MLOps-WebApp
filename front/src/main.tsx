import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const head = document.head;
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
head.appendChild(fontLink);

createRoot(document.getElementById("root")!).render(<App />);
