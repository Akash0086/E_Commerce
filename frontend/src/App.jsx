import AppRoutes from "./routes/AppRoutes";
import {AuthProvider} from "./context/AuthContext";
import {CartProvider} from "./context/CartContext";
function App() {

  return (
    <>
    <AuthProvider>
      <CartProvider>
        <AppRoutes/>
      </CartProvider>     
    </AuthProvider>
      
    </>
  );
}

export default App
