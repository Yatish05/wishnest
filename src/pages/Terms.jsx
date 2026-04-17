import { useEffect } from 'react';
import { FileText } from 'lucide-react';
import './LandingPage.css';

export default function Terms() {
  useEffect(() => {
    document.title = 'Terms and Conditions | WishNest';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Read the terms and conditions for using WishNest gift registry and wishlist services. Our terms are designed to protect users and comply with standard practices.');
    }
  }, []);

  return (
    <div className="landing-page landing-page--wishnest animate-fade-in">
      <section className="landing-section">
        <div className="container">
          <div className="landing-section__header">
            <div className="landing-kicker" style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#7c3aed' }}>
              <FileText size={15} />
              <span>Legal Agreement</span>
            </div>
            <h1>Terms and Conditions</h1>
            <p style={{ fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '1rem' }}>
              Last Updated: April 2026
            </p>
            <p>
              By using WishNest, you agree to the following terms and conditions. Please read them carefully.
            </p>
          </div>

          <div className="landing-info-grid">
            <article className="landing-info-card card">
              <h3>User Accounts</h3>
              <p>
                Users are responsible for maintaining the confidentiality of their account credentials.
              </p>
              <p style={{ marginTop: '1rem' }}>
                You agree to provide accurate and complete information when creating an account on WishNest.
              </p>
            </article>
            <article className="landing-info-card card">
              <h3>Prohibited Activities</h3>
              <p>
                Users may not use WishNest for unlawful purposes, spam, fraud, or to distribute harmful content.
              </p>
              <p style={{ marginTop: '1rem' }}>
                We reserve the right to suspend or terminate accounts that violate these rules.
              </p>
            </article>
          </div>

          <div className="landing-section__header" style={{ marginTop: '3rem' }}>
            <h2>Intellectual Property</h2>
            <p>
              All content, branding, logos, and design elements on WishNest are the property of WishNest unless otherwise stated.
            </p>
            <p style={{ marginTop: '1rem' }}>
              Users may not copy, reproduce, or distribute content without permission.
            </p>

            <h2 style={{ marginTop: '2rem' }}>Limitation of Liability</h2>
            <p>
              WishNest is provided on an "as is" basis without warranties of any kind.
            </p>
            <p style={{ marginTop: '1rem' }}>
              We are not responsible for any damages or losses resulting from the use of the platform.
            </p>

            <h2 style={{ marginTop: '2rem' }}>Termination</h2>
            <p>
              We reserve the right to suspend or terminate user access if these Terms are violated.
            </p>

            <h2 style={{ marginTop: '2rem' }}>Governing Law</h2>
            <p>
              These Terms shall be governed by and interpreted in accordance with the laws of India.
            </p>

            <h2 style={{ marginTop: '2rem' }}>Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at: <br />
              <a href="mailto:getwishnest@gmail.com" style={{ color: 'var(--color-brand)', fontWeight: '600' }}>
                getwishnest@gmail.com
              </a>
            </p>

            <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              Last updated: April 17, 2026
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
