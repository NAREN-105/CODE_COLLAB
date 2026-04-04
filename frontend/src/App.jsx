import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Room from './components/Room';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="*" element={<Navigate to="/room/main" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;