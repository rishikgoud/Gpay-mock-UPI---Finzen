import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import SendMoney from './components/SendMoney';
import Transactions from './components/Transactions';

function App() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Router>
        <NavBar />
        <div className="flex-1 flex justify-center items-center">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/send" element={<SendMoney />} />
            <Route path="/transactions" element={<Transactions />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
