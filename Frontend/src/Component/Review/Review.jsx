import React, { useEffect, useRef } from 'react';
import styles from './Review.module.css';
import { Star } from 'lucide-react';

const reviews = [
  {
    quote: "Timelazy changed the way I manage my schedule!",
    name: "Kent C. Dodds",
    title: "Founder of EpicWeb.dev",
    img: "https://i.pravatar.cc/40?img=1",
  },
  {
    quote: "Timelazy helps me stay on track without making planning feel like a chore.",
    name: "Ant Wilson",
    title: "CTO, Supabase",
    img: "https://i.pravatar.cc/40?img=2",
  },
  {
    quote: "This is the easiest way I've ever scheduled timetables!",
    name: "Jane Doe",
    title: "Product Manager",
    img: "https://i.pravatar.cc/40?img=3",
  },
  {
    quote: "Timelazy makes it incredibly easy to build my weekly schedule",
    name: "Michael Scott",
    title: "Regional Manager",
    img: "https://i.pravatar.cc/40?img=4",
  },
  {
    quote: "A brilliant tool TimeLazy. Highly recommend.",
    name: "Sarah Kim",
    title: "UX Designer",
    img: "https://i.pravatar.cc/40?img=5",
  },
];

const Review = () => {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % reviews.length;
      const width = track.children[0].offsetWidth + 40; // 40 = gap
      track.style.transform = `translateX(-${index * width}px)`;
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <h1><Star className={styles.icon} /> Why Pen & Paper Can't Compete</h1>
      <p className={styles.subtitle}>Here's why people love our AI-powered scheduling</p>

      <div className={styles.carousel}>
        <div className={styles.carouselTrack} ref={trackRef}>
          {reviews.map((review, idx) => (
            <div key={idx} className={styles.slide}>
              <div className={styles.quote}>"{review.quote}"</div>
              <div className={styles.author}>
                <img src={review.img} alt={review.name} />
                <div className={styles.authorInfo}>
                  <strong>{review.name}</strong><br />
                  {review.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Review;
