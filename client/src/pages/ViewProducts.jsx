import { useEffect, useState } from "react";
import axios from "axios";

function ViewProducts() {
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    };
    fetch();
  }, []);

  // Open the modal with the selected image
  const openModal = (image) => {
    setSelectedImage(image);
    setModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedImage("");
  };

  return (
    <div className="p-6 min-h-screen font-sans bg-cinnamon-bg">
      <h1 className="text-2xl font-bold mb-6 text-cinnamon border-b-2 border-cinnamon-light pb-2">
        Available Spices
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div
            key={p._id}
            className="p-4 rounded-xl border border-cinnamon-light bg-cinnamon-glass shadow-md hover:shadow-lg transition duration-300"
          >
            <img
              src={`http://localhost:5000/uploads/${p.image}`}
              alt={p.name}
              className="w-full h-40 object-cover rounded-lg mb-3 border border-cinnamon-light cursor-pointer"
              onClick={() => openModal(`http://localhost:5000/uploads/${p.image}`)}
            />

            <h2 className="text-lg font-semibold text-cinnamon">{p.name}</h2>
            <p className="text-sm text-cinnamon">{p.description}</p>
            <p className="text-sm italic text-cinnamon-hover">{p.category}</p>

            <p className="text-sm text-cinnamon mt-2">Price: ${p.price}</p>
            <p className="text-sm text-cinnamon">Qty: {p.quantity}</p>
          </div>
        ))}
      </div>

      {/* Modal for full image */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-xl p-4">
            <button
              className="absolute top-2 right-2 text-white bg-cinnamon hover:bg-cinnamon-hover rounded-full p-2"
              onClick={closeModal}
            >
              X
            </button>
            <img
              src={selectedImage}
              alt="Full view"
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewProducts;
