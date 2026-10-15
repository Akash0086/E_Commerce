export function validateShippingAddress(shippingAddress) {
  if (!shippingAddress) {
    return "Shipping address is required";
  }

  const requiredFields = [
    "name",
    "address",
    "city",
    "state",
    "pincode",
    "phone",
  ];

  const hasMissingField = requiredFields.some((field) => {
    return (
      !shippingAddress[field] ||
      !shippingAddress[field].toString().trim()
    );
  });

  if (hasMissingField) {
    return "All shipping address fields are required";
  }

  if (!/^\d{6}$/.test(shippingAddress.pincode.toString().trim())) {
    return "Pincode must be exactly 6 digits";
  }

  if (!/^\d{10}$/.test(shippingAddress.phone.toString().trim())) {
    return "Phone number must be exactly 10 digits";
  }

  return null;
}