import { useEffect } from 'react';
import { Eye } from 'lucide-react';
import './LandingPage.css';

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = 'Privacy Policy | WishNest';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Understand how WishNest handles your data and protects your privacy. Our policy is compliant with standard practices and Google AdSense requirements.');
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
            <p style={{ fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '1rem' }}>
              Last Updated: April 2026
            </p>
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
            
            <h2 style={{ marginTop: '2rem' }}>How We Use Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to protect WishNest and our users.
            </p>

            <h2 style={{ marginTop: '2rem' }}>Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar technologies to improve user experience, analyze website traffic, and personalize content. Cookies help us understand how users interact with our platform.
            </p>
            <p style={{ marginTop: '1rem' }}>
              You can choose to disable cookies through your browser settings. However, disabling cookies may affect certain features of the website.
            </p>

            <h2 style={{ marginTop: '2rem' }}>Third-Party Advertising (Google AdSense)</h2>
            <p>
              We may display advertisements from third-party vendors, including Google AdSense. These vendors may use cookies to serve ads based on a user's prior visits to this website or other websites.
            </p>
            <p style={{ marginTop: '1rem' }}>
              Google's use of advertising cookies enables it and its partners to serve ads based on users' visits to this site and/or other sites on the Internet.
            </p>
            <p style={{ marginTop: '1rem' }}>
              Users may opt out of personalized advertising by visiting: <br />
              <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-brand)', fontWeight: '600' }}>
                https://adssettings.google.com
              </a>
            </p>

            <h2 style={{ marginTop: '2rem' }}>Data Security</h2>
            <p>
              We take reasonable measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
            </p>
            <p style={{ marginTop: '1rem' }}>
              However, no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security.
            </p>

            <h2 style={{ marginTop: '2rem' }}>Children's Information</h2>
            <p>
              WishNest does not knowingly collect any Personal Identifiable Information from children under the age of 13.
            </p>
            <p style={{ marginTop: '1rem' }}>
              If you believe that your child has provided this kind of information on our website, please contact us immediately, and we will promptly remove such information from our records.
            </p>

            <h2 style={{ marginTop: '2rem' }}>Changes to This Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top.
            </p>

            <h2 style={{ marginTop: '2rem' }}>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at: <br />
              <a href="mailto:getwishnest@gmail.com" style={{ color: 'var(--color-brand)', fontWeight: '600' }}>
                getwishnest@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
