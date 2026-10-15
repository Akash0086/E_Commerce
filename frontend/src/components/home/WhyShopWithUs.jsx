import "../../styles/WhyShopWithUs.css";

const benefits = [
{
icon: "shield-check",
title: "Secure Payments",
description:
"A secure checkout experience for your online purchases.",
},
{
icon: "layers",
title: "Wide Product Selection",
description:
"Explore mobiles, laptops, wearables, and electronics in one place.",
},
{
icon: "package-check",
title: "Easy Order Tracking",
description:
"View your order history and track your purchases from your account.",
},
{
icon: "shopping-bag",
title: "Simple Shopping",
description:
"Browse products, manage your cart, and complete your orders with ease.",
},
];

const icons = {
"shield-check": ( <svg viewBox="0 0 24 24" aria-hidden="true"> <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /> <path d="m9 12 2 2 4-4" /> </svg>
),
layers: ( <svg viewBox="0 0 24 24" aria-hidden="true"> <path d="m12 2 9 5-9 5-9-5 9-5Z" /> <path d="m3 12 9 5 9-5" /> <path d="m3 17 9 5 9-5" /> </svg>
),
"package-check": ( <svg viewBox="0 0 24 24" aria-hidden="true"> <path d="m12 3 9 5-9 5-9-5 9-5Z" /> <path d="M3 8v9l9 5 9-5V8" /> <path d="M12 13v9" /> <path d="m9 8 6 3" /> </svg>
),
"shopping-bag": ( <svg viewBox="0 0 24 24" aria-hidden="true"> <path d="M5 8h14l1 13H4L5 8Z" /> <path d="M9 8V6a3 3 0 0 1 6 0v2" /> <path d="m9 14 2 2 4-4" /> </svg>
),
};

function WhyShopWithUs() {
return ( <section className="why-shop"> <div className="why-shop-heading"> <span className="why-shop-eyebrow">THE NEXORA ADVANTAGE</span> <h2>Why Shop With Us?</h2> <p>
Everything you need for a simple and convenient shopping experience. </p> </div>


  <div className="why-shop-grid">
    {benefits.map((benefit) => (
      <article className="why-shop-card" key={benefit.title}>
        <div className="why-shop-icon">
          {icons[benefit.icon]}
        </div>

        <h3>{benefit.title}</h3>
        <p>{benefit.description}</p>
      </article>
    ))}
  </div>
</section>

);
}

export default WhyShopWithUs;
