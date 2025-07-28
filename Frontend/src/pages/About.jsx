
import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../css/About.css'; // Import the CSS file
import aboutVideo from '../assets/Timelazy video.mp4';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const About = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const handleGoBack = () => {
    navigate('/Landing'); // Navigate to the dashboard route
  };

  return (
    <div className="page-container">
      <div className="main-content">
        <div className="content-area">
          <button onClick={handleGoBack} className="back-button">
          Back
          </button>
          <div className="about-text" data-aos="fade-right">
            <h1>About Timelazy</h1>
            <p>
              <strong>Timelazy</strong> is your smart AI-powered planner for schools and colleges. We help institutions automate the most complex task: building efficient, conflict-free timetables — instantly.
            </p>
          </div>
          <div className="section-divider"></div>
          {/* Team Section */}
          <section className="content-section team-section">
            <h2>About</h2>
            <div className="two-column">
              <div className="column-image">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Team Image"
                  loading="lazy"
                />
              </div>
              <div className="column-text">
                <p>
                  TechTrend Innovations was founded with a vision to revolutionize the tech industry. Our team of dedicated professionals works tirelessly to develop solutions that address real-world challenges, from AI-driven analytics to sustainable tech infrastructures.
                </p>
              </div>
            </div>
          </section>
          {/* Mission Section */}
          <section className="content-section mission-section">
            <h2>Our Mission</h2>
            <div className="two-column">
              <div className="column-text">
                <p>
                  At TechTrend Innovations, we strive to push the boundaries of technology by creating innovative solutions that empower businesses and individuals. Our passion for cutting-edge tech drives us to deliver excellence.
                </p>
              </div>
              <div className="column-image">
                <img
                  src="https://static.vecteezy.com/system/resources/previews/008/167/404/non_2x/simply-soft-gradation-technology-background-free-vector.jpg"
                  alt="Mission Image"
                  loading="lazy"
                />
              </div>
            </div>
          </section>
          {/* Vision Section */}
          <section className="content-section vision-section">
            <h2>Our Vision</h2>
            <div className="two-column">
              <div className="column-image">
                <img
                  src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Vision Image"
                  loading="lazy"
                />
              </div>
              <div className="column-text">
                <p>
                  We envision a world where technology seamlessly connects people, fosters creativity, and solves global challenges. TechTrend Innovations aims to lead this transformation with sustainable and inclusive solutions.
                </p>
              </div>
            </div>
          </section>
        </div>
        {/* Right side - fixed video */}
        <div className="video-area">
          <video
            className="timelazy-video"
            autoPlay
            loop
            muted
            playsInline
            title="Timelazy AI Demo Video"
            aria-label="Timelazy AI-generated timetable video"
          >
            <source src={aboutVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
      {/* Footer */}
      <footer>
        <p>© 2025 Incorbis Innovations. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default About;
