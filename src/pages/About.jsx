import SEO from '../components/SEO';
import { HeartHandshake } from 'lucide-react';
import './LandingPage.css';

export default function About() {
  return (
    <div className="landing-page landing-page--wishnest animate-fade-in">
      <SEO 
        title="About Us"
        description="Learn more about WishNest and why we build tools to make gifting clearer, kinder, and less awkward."
        path="/about"
      />
      <section className="landing-section">
        <div className="container">
          <div className="landing-section__header">
            <div className="landing-kicker" style={{ background: '#fff1eb', border: '1px solid #fbd5bf', color: '#7c2d12' }}>
              <HeartHandshake size={15} />
              <span>About WishNest</span>
            </div>
            <h1>About WishNest</h1>
            <p>
              WishNest is built to make gifting clearer, kinder, and less awkward by giving people one organized place
              to share what they would genuinely use and enjoy.
            </p>
          </div>

          <div className="landing-info-grid">
            <article className="landing-info-card card">
              <h3>Why it exists</h3>
              <p>
                Too many gifts come from guesswork. WishNest helps friends and family choose with confidence instead.
                We believe that sharing what you love shouldn't feel greedy—it should feel helpful.
              </p>
            </article>
            <article className="landing-info-card card">
              <h3>What it solves</h3>
              <p>
                It keeps wishlists, links, ideas, and shared access in one simple flow that works for birthdays,
                weddings, festivals, and everyday occasions.
              </p>
            </article>
          </div>

          <div className="landing-section__header" style={{ marginTop: '3rem' }}>
            <h2>Our Mission</h2>
            <p>
              Our mission is to simplify the gifting experience for everyone involved. By providing a platform that focus on transparency and ease of use, we help avoid duplicate gifts and ensure that every gift received is one that is truly appreciated.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
