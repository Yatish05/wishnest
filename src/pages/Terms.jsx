import { useEffect } from 'react';
import { FileText } from 'lucide-react';
import './LandingPage.css';

export default function Terms() {
  useEffect(() => {
    document.title = 'Terms and Conditions | WishNest';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Read the terms and conditions for using WishNest gift registry and wishlist services.');
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
            <p>
              By using WishNest, you agree to the following terms and conditions. Please read them carefully.
            </p>
          </div>

          <div className="landing-info-grid">
            <article className="landing-info-card card">
              <h3>1. Acceptance of Terms</h3>
              <p>
                By accessing or using WishNest, you agree to be bound by these Terms and Conditions and all applicable laws and regulations.
              </p>
            </article>
            <article className="landing-info-card card">
              <h3>2. Use License</h3>
              <p>
                WishNest grants you a personal, non-exclusive, non-transferable license to use the platform for personal, non-commercial gifting purposes.
              </p>
            </article>
          </div>

          <div className="landing-section__header" style={{ marginTop: '3rem' }}>
            <h2>3. User Account</h2>
            <p>
              To use certain features, you may be required to register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>

            <h2 style={{ marginTop: '2rem' }}>4. Content Ownership</h2>
            <p>
              You retain ownership of any content you post to WishNest. However, by posting content, you grant WishNest a worldwide, non-exclusive, royalty-free license to use, reproduce, and display that content in connection with providing our services.
            </p>

            <h2 style={{ marginTop: '2rem' }}>5. Prohibited Conduct</h2>
            <p>
              Users are prohibited from using WishNest for any unlawful purpose, to transmit malicious code, or to harass others. We reserve the right to terminate accounts that violate these terms.
            </p>

            <h2 style={{ marginTop: '2rem' }}>6. Limitation of Liability</h2>
            <p>
              WishNest is provided "as is" without any warranties. In no event shall WishNest be liable for any damages arising out of the use or inability to use the platform.
            </p>

            <h2 style={{ marginTop: '2rem' }}>7. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Your continued use of the platform after changes are posted constitutes your acceptance of the new terms.
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
