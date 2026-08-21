import { Shield, Star, CheckCircle2 } from 'lucide-react';
import Logo from '../../assets/Logo.png';
import './PremiumCertificate.css';

export default function PremiumCertificate() {
  return (
    <div className="premium-certificate-wrapper">
      <div className="premium-certificate">
        {/* Top gradient border */}
        <div className="premium-certificate__top-border" />

        {/* Corner accents */}
        <div className="premium-certificate__corner premium-certificate__corner--tl" />
        <div className="premium-certificate__corner premium-certificate__corner--tr" />
        <div className="premium-certificate__corner premium-certificate__corner--bl" />
        <div className="premium-certificate__corner premium-certificate__corner--br" />

        {/* Inner content */}
        <div className="premium-certificate__inner">
          {/* Logo */}
          <div className="premium-certificate__logo">
            <img src={Logo} alt="NexoraMind" className="premium-certificate__logo-img" />
          </div>

          {/* Badge */}
          <div className="premium-certificate__badge">
            <CheckCircle2 className="premium-certificate__badge-icon" />
            <span>CERTIFICATE OF INTERNSHIP</span>
          </div>

          {/* Title */}
          <h2 className="premium-certificate__title">Internship Certificate</h2>
          <p className="premium-certificate__subtitle">NexoraMind Certification Platform</p>

          {/* Divider with star */}
          <div className="premium-certificate__divider">
            <div className="premium-certificate__divider-line" />
            <div className="premium-certificate__divider-star">
              <Star className="premium-certificate__star-icon" />
            </div>
            <div className="premium-certificate__divider-line" />
          </div>

          {/* Presented to */}
          <p className="premium-certificate__label">PRESENTED TO</p>
          <h3 className="premium-certificate__name">Priya Sharma</h3>

          {/* Dashed separator */}
          <div className="premium-certificate__dashed-sep" />

          {/* Description */}
          <p className="premium-certificate__description">
            For successfully completing the internship program in
          </p>
          <p className="premium-certificate__description premium-certificate__description--accent">
            Full-Stack Web Development
          </p>

          {/* Module card */}
          <div className="premium-certificate__module">
            <div className="premium-certificate__module-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <div className="premium-certificate__module-text">
              <span className="premium-certificate__module-label">DOMAIN</span>
              <span className="premium-certificate__module-name">
                React.js, Node.js & Cloud Deployment
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="premium-certificate__footer">
            <div className="premium-certificate__footer-col">
              <span className="premium-certificate__footer-label">DATE ISSUED</span>
              <span className="premium-certificate__footer-value">21 August 2026</span>
            </div>
            <div className="premium-certificate__footer-col">
              <span className="premium-certificate__footer-label">CERTIFICATE ID</span>
              <span className="premium-certificate__footer-value">NM-INT-2026-0184</span>
            </div>
          </div>

          {/* Verified badge */}
          <div className="premium-certificate__verified">
            <Shield className="premium-certificate__verified-icon" />
            <span>Cryptographically Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
