import { Link } from 'react-router-dom';
import { Sparkles, Clock3, ArrowRight, ShieldCheck, Wand2, Gift } from 'lucide-react';
import './AIAssistantPage.css';

export default function AIAssistantPage() {
  return (
    <div className="ai-assistant-page animate-fade-in">
      <div className="ai-page-hero">
        <div className="ai-page-hero-copy">
          <div className="ai-page-kicker">
            <Sparkles size={14} />
            <span>Coming Soon</span>
          </div>
          <h1 className="ai-page-title">AI Gift Assistant</h1>
          <p className="ai-page-subtitle">
            Smart gift suggestions are being prepared for launch. We are keeping this page polished and simple until the feature is fully ready.
          </p>
        </div>

        <div className="ai-page-mini-grid">
          <div className="ai-page-mini-card">
            <Wand2 size={18} />
            <span>Smarter recommendations</span>
          </div>
          <div className="ai-page-mini-card">
            <Gift size={18} />
            <span>Occasion-aware ideas</span>
          </div>
          <div className="ai-page-mini-card">
            <ShieldCheck size={18} />
            <span>Production-safe rollout</span>
          </div>
        </div>
      </div>

      <div className="ai-coming-soon-shell card">
        <div className="ai-coming-soon">
          <div className="ai-coming-soon-icon">
            <Clock3 size={30} />
          </div>
          <div className="ai-coming-soon-copy">
            <span className="ai-coming-soon-kicker">Feature Coming Soon</span>
            <h2>AI-powered gift suggestions are being polished.</h2>
            <p>
              Soon, our AI will help you find the perfect gifts from top retailers like 
              <strong> Amazon</strong>, <strong>Target</strong>, <strong>Walmart</strong>, 
              <strong> Etsy</strong>, and <strong>Best Buy</strong>.
            </p>
            <p className="mt-2">
              We are refining the assistant to ensure it works perfectly across all 
              regions before rollout.
            </p>
          </div>
          <div className="ai-coming-soon-actions">
            <Link to="/discover" className="btn btn-primary">
              Explore Discover Gifts <ArrowRight size={18} />
            </Link>
            <Link to="/wishlists" className="btn btn-secondary">
              Back to Wishlists
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
