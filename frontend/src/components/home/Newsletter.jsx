import { useState } from "react";
import "../../styles/Newsletter.css";

function Newsletter() {
const [email, setEmail] = useState("");
const [message, setMessage] = useState("");

function handleSubmit(event) {
event.preventDefault();

if (!email.trim()) {
  setMessage("Please enter your email address.");
  return;
}

setMessage(
  "Demo only: newsletter subscriptions are not saved yet."
);
setEmail("");


}

return ( <section className="newsletter"> <div className="newsletter-content"> <span className="newsletter-eyebrow">
THE NEXORA NEWSLETTER </span>

    <h2>Stay Ahead of What's Next.</h2>

    <p className="newsletter-description">
      Get updates about new products, latest arrivals, and special offers.
      Stay connected with everything happening at Nexora.
    </p>

    <form className="newsletter-form" onSubmit={handleSubmit}>
      <label className="newsletter-sr-only" htmlFor="newsletter-email">
        Email address
      </label>

      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          setMessage("");
        }}
        placeholder="Enter your email address"
        autoComplete="email"
        required
      />

      <button type="submit">Subscribe <span aria-hidden="true">→</span></button>
    </form>

    {message && (
      <p className="newsletter-message" role="status">
        {message}
      </p>
    )}

    <p className="newsletter-note">
      Stay informed. No unnecessary clutter.
    </p>
  </div>

  <div className="newsletter-decoration" aria-hidden="true">
    <div className="newsletter-circle newsletter-circle-one" />
    <div className="newsletter-circle newsletter-circle-two" />
    <div className="newsletter-circle newsletter-circle-three" />
  </div>
</section>

);
}

export default Newsletter;
