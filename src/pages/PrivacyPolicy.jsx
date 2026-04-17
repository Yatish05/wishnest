import { useEffect } from 'react';
import { Eye } from 'lucide-react';
import './LandingPage.css';

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = 'Privacy Policy | WishNest';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Understand how WishNest handles your data and protects your privacy.');
    }
  }, []);

  return (
    <div className="landing-page landing-page--wishnest animate-fade-in">
      <section className="landing-section">
        <div className="container">
          <div className="landing-section__header">
            <div className="landing-kicker" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8' }}>
              <Eye size={15} />
              <span>Security & Privacy</span>
            </div>
            <h1>Privacy Policy</h1>
            <p>
              WishNest is designed around controlled sharing so you decide what stays private and what can be viewed by
              others. Your privacy is our priority.
            </p>
          </div>

          <div className="landing-info-grid">
            <article className="landing-info-card card">
              <h3>Your control</h3>
              <p>
                You can keep lists private, share selectively, or make them public only when you choose. You have full control over who sees your wishlists.
              </p>
            </article>
            <article className="landing-info-card card">
              <h3>Your data</h3>
              <p>
                Account details, preferences, and wishlist content stay tied to your account and app permissions. We do not sell your personal information to third parties.
              </p>
            </article>
          </div>

          <div className="landing-section__header" style={{ marginTop: '3rem' }}>
            <h2>Information We Collect</h2>
            <p>
              We collect information you provide directly to us when you create an account, create a wishlist, or communicate with us. This may include your name, email address, and the contents of your wishlists.
            </p>
            
            <h2 style={{ marginTop: '2rem' }}>How We Use Your Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to protect WishNest and our users.
            </p>

            <h2 style={{ marginTop: '2rem' }}>Data Security</h2>
            <p>
              We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
            </p>

            <h2 style={{ marginTop: '2rem' }}>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at getwishnest@gmail.com.
            </p>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              Last updated: April 17, 2026
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
