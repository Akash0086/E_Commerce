/*async function getProducts() {
  const response = await fetch('http://localhost:3000/api/products?category=appliances');
  const data = await response.json();
  console.log(data);
}

getProducts();
*/

fetch('http://localhost:3000/api/products', {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: "hoodie",
    category: "clothing",
    price: 66.66
  })
})
.then(response => {
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
})
.then(data => {
  console.log("Product created:", data);
})
.catch(error => {
  console.error("Error creating product:", error);
});
