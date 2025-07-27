import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard'; // hypothetical
import About from './pages/About';
import Contact  from './pages/ContactUs';
import Feedback from './pages/Feedback';
import MainPage from './pages/MainPage';
import Loading from './Component/Loading/Loading';
import LoginPer from './pages/LoginPer';
import Loginad from './pages/Loginad';
import Signupad from './pages/Signupad';
import SignupPer from './pages/SignupPer';
import Admindash from './pages/Admindash/Admindash';
function App() {
  return ( 
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Loading />}/>
         <Route path="/Landing" element={<MainPage />} /> 
       <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/ContactUs" element={<Contact/>} />
      <Route path="/Loginper" element={<LoginPer/>}/>
       <Route path="/Feedback" element={<Feedback/>} /> 
      <Route path="/Loginad" element={<Loginad/>}/>
     <Route path="/Signupad" element={<Signupad/>}/>
     <Route path='/SignupPer' element={<SignupPer/>}/>
<Route path="/admindash" element={<Admindash /> }/>   
 </Routes>  
  </BrowserRouter>
  );
  }

  export default App;