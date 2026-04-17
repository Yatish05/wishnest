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
              <h3>1. Acceptance of Terms</h3>
              <p>
                By accessing or using WishNest, you agree to be bound by these Terms and Conditions and all applicable laws and regulations.
              </p>
            </article>
            <article className="landing-info-card card">
              <h3>2. User Accounts</h3>
              <p>
                Users are responsible for maintaining the confidentiality of their account credentials. You agree to provide accurate, current, and complete information when creating an account on WishNest.
              </p>
            </article>
          </div>

          <div className="landing-section__header" style={{ marginTop: '3rem' }}>
            <h2>3. Prohibited Activities</h2>
            <p>
              Users may not use WishNest for any unlawful purposes, spam, fraud, or the distribution of harmful content. This includes, but is not limited to, the transmission of malicious code, harassment of other users, or attempting to gain unauthorized access to our systems.
            </p>
            <p style={{ marginTop: '1rem' }}>
              We reserve the right to suspend or terminate accounts that violate these rules without prior notice.
            </p>

            <h2 style={{ marginTop: '2rem' }}>4. Intellectual Property</h2>
            <p>
              All content, branding, design elements, and functionality on WishNest (including but not limited to the logo, wordmark, and UI design) are owned by WishNest or its licensors and are protected by intellectual property laws.
            </p>

            <h2 style={{ marginTop: '2rem' }}>5. Limitation of Liability</h2>
            <p>
              WishNest is provided on an "as is" and "as available" basis without any warranties of any kind. We are not responsible for any damages resulting from the use of the platform, including but not limited to direct, indirect, incidental, or consequential damages.
            </p>

            <h2 style={{ marginTop: '2rem' }}>6. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to WishNest at any time, with or without cause, especially if you violate these Terms and Conditions.
            </p>

            <h2 style={{ marginTop: '2rem' }}>7. Governing Law</h2>
            <p>
              These Terms and Conditions are governed by and construed in accordance with the laws of India. Any disputes relating to these terms will be subject to the exclusive jurisdiction of the courts of India.
            </p>

            <h2 style={{ marginTop: '2rem' }}>8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Your continued use of the platform after changes are posted constitutes your acceptance of the new terms.
            </p>

            <div style={{ marginTop: '4rem', padding: '2rem', background: '#f8fafc', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Contact Information</h3>
              <p>
                If you have any questions about these Terms and Conditions, please contact us at: <br />
                <a href="mailto:getwishnest@gmail.com" style={{ color: 'var(--color-brand)', fontWeight: '600' }}>
                  getwishnest@gmail.com
                </a>
              </p>
            </div>

            <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              Last updated: April 17, 2026
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
