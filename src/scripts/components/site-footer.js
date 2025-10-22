/**
 * Site Footer Web Component
 * Reusable footer component
 */

class SiteFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const year = new Date().getFullYear();

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .footer {
          background: linear-gradient(135deg, rgba(10, 15, 10, 0.95) 0%, rgba(5, 8, 5, 0.95) 100%);
          border-top: 1px solid rgba(0, 255, 65, 0.2);
          padding: 3rem 0 1rem;
          margin-top: 4rem;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .footer-section h3,
        .footer-section h4 {
          color: #00ff41;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .footer-section h3 {
          font-size: 1.5rem;
        }

        .footer-section h4 {
          font-size: 1.125rem;
        }

        .footer-section p {
          color: #e0ffe0;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .footer-contact p {
          margin-bottom: 0.5rem;
          color: #ccffcc;
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-section ul li {
          margin-bottom: 0.5rem;
        }

        .footer-section ul li a {
          color: #e0ffe0;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .footer-section ul li a:hover {
          color: #00ff41;
          text-shadow: 0 0 10px rgba(0, 255, 65, 0.6);
          padding-left: 0.5rem;
        }

        .footer-bottom {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid rgba(0, 255, 65, 0.1);
          color: #ccffcc;
        }

        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr;
          }
        }
      </style>

      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-section">
              <h3>Aspire Impact Network</h3>
              <p>Empowering people, elevating business, creating impact in Geneva, Nebraska and beyond.</p>
              <div class="footer-contact">
                <p>📞 (402) 759-2210</p>
                <p>✉️ brandon.hinrichs@aspireimpactnetwork.com</p>
                <p>📍 Geneva, Nebraska</p>
              </div>
            </div>
            <div class="footer-section">
              <h4>Justice Support</h4>
              <ul>
                <li><a href="/justice-support.html">Family Partners</a></li>
                <li><a href="/justice-support.html">Domestic Violence Classes</a></li>
                <li><a href="/justice-support.html">Reentry Support</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h4>Digital Solutions</h4>
              <ul>
                <li><a href="/digital-solutions.html">Website Management</a></li>
                <li><a href="/digital-solutions.html">SEO Optimization</a></li>
                <li><a href="/digital-solutions.html">Social Media</a></li>
                <li><a href="/digital-solutions.html">AI Automation</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h4>Community</h4>
              <ul>
                <li><a href="/membership.html">Membership Plans</a></li>
                <li><a href="/blog.html">Blog & Resources</a></li>
                <li><a href="/contact.html">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; ${year} Aspire Impact Network. All rights reserved.</p>
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define('site-footer', SiteFooter);

export default SiteFooter;
