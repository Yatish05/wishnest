import SEO from '../components/SEO';
import { Mail } from 'lucide-react';
import './LandingPage.css';

export default function Contact() {
  return (
    <div className="landing-page landing-page--wishnest animate-fade-in">
      <SEO 
        title="Contact Us"
        description="Get in touch with the WishNest team for support, feedback, or business inquiries."
        path="/contact"
      />
      <section className="landing-section">
        <div className="container">
          <div className="landing-section__header">
            <div className="landing-kicker" style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e' }}>
              <Mail size={15} />
              <span>Get in Touch</span>
            </div>
            <h1>Contact Us</h1>
            <p>
              Need help, want to report a bug, or want to share feedback? Reach out and we&apos;ll get back to you as soon as possible.
            </p>
          </div>

          <div className="landing-contact card" style={{ padding: '3rem', marginTop: '2rem' }}>
            <div style={{ flex: '1' }}>
              <h2>Email Support</h2>
              <p>
                The best way to reach us is via email. We typically respond within 24-48 hours.
              </p>
              <div style={{ marginTop: '2rem' }}>
                <a className="btn btn-primary btn-lg" href="mailto:getwishnest@gmail.com">
                  getwishnest@gmail.com
                </a>
              </div>
            </div>
            <div style={{ flex: '0 0 100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Mail size={64} style={{ opacity: 0.1, color: 'var(--color-brand)' }} />
            </div>
          </div>

          <div className="landing-info-grid" style={{ marginTop: '4rem' }}>
            <article className="landing-info-card card">
              <h3>Support</h3>
              <p>
                For technical issues or difficulty using the app, please include details about your device and what you were doing when the issue occurred.
              </p>
            </article>
            <article className="landing-info-card card">
              <h3>Feedback</h3>
              <p>
                We love hearing from our users! If you have ideas for new features or ways we can improve, please let us know.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
