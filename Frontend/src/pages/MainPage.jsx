import React from 'react'
import Navbar from '../Component/NavBar/Navbar'
import Compare from '../Component/Compare/Compare'
import TimetableDemo from '../Component/TimetableDemo/TimetableDemo'
import ChooseMode from '../Component/ChooseMode/ChooseMode'
import Review from '../Component/Review/Review'
import Footer from '../Component/Footer/Footer'
import Chatbot from '../Component/Buttons/Chatbot/Chatbot'
import Scroll from '../Component/Buttons/Scroll/Scroll'
import Hero from '../Component/Hero/Hero'
const MainPage = () => {
  return (
    <div>
      <Navbar/>
      <Hero/>
      <Compare /> 
      <TimetableDemo/>
       <ChooseMode/> 
<Review/>
<Chatbot/>
<Scroll/>
<Footer/>
    </div>
  )
}

export default MainPage
