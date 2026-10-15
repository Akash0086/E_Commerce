import { Link } from "react-router-dom";
import "../../styles/CategoryBar.css";

const categories = [
{ label: "Mobiles", value: "Mobile" },
{ label: "Wearables", value: "Wearables" },
{ label: "Laptops", value: "Laptops" },
{ label: "Electronics", value: "Electronics" },
];

function CategoryBar() {
return ( <nav className="category-bar" aria-label="Product categories"> <ul>
{categories.map((category) => ( <li key={category.value}>
<Link
to={`/products?category=${encodeURIComponent(category.value)}`}
>
{category.label} </Link> </li>
))} </ul> </nav>
);
}

export default CategoryBar;
