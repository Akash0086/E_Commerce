import { Link } from "react-router-dom";

function OrderSuccess(){
  return(
    <>
      <h2>Your order has been placed successfully.</h2>
      <Link to="/">Continue Shopping</Link>
    </>

  );
}

export default OrderSuccess;