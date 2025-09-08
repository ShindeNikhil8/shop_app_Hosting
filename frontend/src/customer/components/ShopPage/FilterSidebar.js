import React, { useState, useEffect } from "react";

const FilterSidebar = ({ onFilterChange, initialFilters }) => {
  const [selectedMains, setSelectedMains] = useState([]);
  const [selectedSubs, setSelectedSubs] = useState([]);
  const [selectedAges, setSelectedAges] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const categories = {
    Toys: ["Educational Toys", "Playsets", "Control Toys", "Stuffed Toys", "Eco-Friendly Toys"],
    Stationary: ["Pens", "Pencils", "Notebooks", "Markers"],
    Gifts: ["Gift Cards", "Plush Toys", "Accessories"],
  };

  const ageGroups = ["0-2", "3-5", "6-8", "9-12", "13+"];

  // Automatically apply initialFilters
  useEffect(() => {
    if (initialFilters?.mainCategories) setSelectedMains(initialFilters.mainCategories);
    if (initialFilters?.subCategories) setSelectedSubs(initialFilters.subCategories);

    if (initialFilters) {
      // Automatic filter apply
      onFilterChange({
        mainCategories: initialFilters.mainCategories || [],
        subCategories: initialFilters.subCategories || [],
        ageGroups: [],
        price: [0, 10000],
      });
    }
  }, [initialFilters, onFilterChange]);

  const toggleSelection = (value, setState, state) => {
    if (state.includes(value)) {
      const newState = state.filter((item) => item !== value);
      setState(newState);
      // Auto-update filters
      onFilterChange({
        mainCategories: setState === setSelectedMains ? newState : selectedMains,
        subCategories: setState === setSelectedSubs ? newState : selectedSubs,
        ageGroups: selectedAges,
        price: priceRange,
      });
    } else {
      const newState = [...state, value];
      setState(newState);
      onFilterChange({
        mainCategories: setState === setSelectedMains ? newState : selectedMains,
        subCategories: setState === setSelectedSubs ? newState : selectedSubs,
        ageGroups: selectedAges,
        price: priceRange,
      });
    }
  };

  // Auto-apply price range change
  useEffect(() => {
    onFilterChange({
      mainCategories: selectedMains,
      subCategories: selectedSubs,
      ageGroups: selectedAges,
      price: priceRange,
    });
  }, [priceRange, selectedMains, selectedSubs, selectedAges, onFilterChange]);

  return (
    <div className="w-64 p-4 border rounded-lg shadow bg-white">
      <h3 className="font-semibold mb-2">Main Category</h3>
      <div className="space-y-3">
        {Object.entries(categories).map(([main, subs]) => (
          <div key={main}>
            <label className="flex items-center font-medium">
              <input
                type="checkbox"
                checked={selectedMains.includes(main)}
                onChange={() => toggleSelection(main, setSelectedMains, selectedMains)}
                className="mr-2"
              />
              {main}
            </label>
            <div className="ml-6 mt-1 space-y-1">
              {subs.map((sub) => (
                <label key={sub} className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={selectedSubs.includes(sub)}
                    onChange={() => toggleSelection(sub, setSelectedSubs, selectedSubs)}
                    className="mr-2"
                  />
                  {sub}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Price Range */}

        <h3 className="font-semibold mt-4 mb-2">Price Range</h3>
        <div className="flex flex-col space-y-2">
        <div className="flex justify-between text-sm mb-1">
            <span>₹0</span>
            <span>₹{priceRange[1]}</span>
        </div>

        <input
            type="range"
            min="0"
            max="10000"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, +e.target.value])}
            className="w-full h-2 rounded-lg cursor-pointer"
            style={{
            background: `linear-gradient(to right, #4ade80 0%, #4ade80 ${
                (priceRange[1] / 10000) * 100
            }%, #d1d5db ${(priceRange[1] / 10000) * 100}%, #d1d5db 100%)`,
            }}
        />
        </div>




      {/* Age Group */}
      <h3 className="font-semibold mt-4 mb-2">Age Group</h3>
      <div className="space-y-2">
        {ageGroups.map((age) => (
          <label key={age} className="flex items-center">
            <input
              type="checkbox"
              checked={selectedAges.includes(age)}
              onChange={() => toggleSelection(age, setSelectedAges, selectedAges)}
              className="mr-2"
            />
            {age}
          </label>
        ))}
      </div>
    </div>
  );
};

export default FilterSidebar;
