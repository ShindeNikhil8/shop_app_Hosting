import { categories } from '../Categories/CategoryData';
import { useNavigate } from 'react-router-dom';

const Categories = () => {
  const navigate = useNavigate();

  const handleClick = (subCategory) => {
    // Navigate to shop page with query param
    navigate(`/shop?subCategory=${encodeURIComponent(subCategory)}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 my-12">
      <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
        Find the Perfect Toy
      </h2>
      <p className="text-xl text-gray-600 mb-8 text-center">Our Collections</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {categories.map((cat) => (
          <div
            key={cat.label}
            onClick={() => handleClick(cat.label)}
            className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-transform duration-300 hover:scale-105 cursor-pointer"
          >
            <img
              src={cat.icon}
              alt={cat.label}
              className="w-32 h-32 mb-4 object-contain"
            />
            <h3 className="text-xl font-semibold text-gray-800">{cat.label}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
