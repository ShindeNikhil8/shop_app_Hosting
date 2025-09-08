import { Disclosure } from "@headlessui/react";
import { ShoppingCart, Menu, X } from "lucide-react"; // cart and menu icons
import logo from "../../../assets/Navbar/SHREE.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext.jsx";
import { useCart } from "../../../context/CartContext";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Contact", href: "/contact" },
];

const ownerNavigation = [
  { name: "Stock", href: "/owner/stock" },
  { name: "Limited Items", href: "/owner/limited" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navigation() {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Disclosure as="nav" className="bg-white shadow relative">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-20 items-center justify-between">
              {/* Mobile menu button */}
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black">
                  {open ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                </Disclosure.Button>
              </div>

              {/* Logo */}
              <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex-shrink-0 flex items-center">
                  <img className="h-16 w-auto" src={logo} alt="Logo" />
                </div>

                {/* Desktop Navigation */}
                <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={classNames(
                          isActive
                            ? "bg-black text-white"
                            : "text-gray-700 hover:bg-gray-100 hover:text-black",
                          "px-3 py-2 rounded-md text-sm font-medium"
                        )}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                  {user?.isOwner &&
                    ownerNavigation.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={classNames(
                            isActive
                              ? "bg-black text-white "
                              : "text-gray-700 hover:bg-gray-100 hover:text-black",
                            "px-3 py-2 rounded-md text-sm font-medium"
                          )}
                        >
                          {item.name}
                        </Link>
                      );
                    })}
                </div>
              </div>

              {/* Desktop Auth + Cart */}
              <div className="hidden sm:flex items-center space-x-3">
                {!user?.isOwner && (
                  <Link to="/cart" className="relative">
                    <ShoppingCart className="h-5 w-5 text-gray-700 hover:text-black" />
                    {cart.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                        {cart.length}
                      </span>
                    )}
                  </Link>
                )}
                {user ? (
                  <>
                    <span className="text-gray-700 font-medium text-sm">
                      Hi, {user.username}
                    </span>
                    <button
                      onClick={() => {
                        logout();
                        navigate("/");
                      }}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <Disclosure.Panel className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {[...navigation, ...(user?.isOwner ? ownerNavigation : [])].map(
                (item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        isActive
                          ? "bg-black text-white"
                          : "text-gray-700 hover:bg-gray-200 hover:text-black",
                        "block px-3 py-2 rounded-md text-base font-medium"
                      )}
                    >
                      {item.name}
                    </Link>
                  );
                }
              )}

              {/* Mobile Auth Buttons */}
              <div className="mt-2 space-y-1">
                {user ? (
                  <>
                    <span className="text-gray-700 text-sm block">
                      Hi, {user.username}
                    </span>
                    <button
                      onClick={() => {
                        logout();
                        navigate("/");
                      }}
                      className="bg-red-500 text-white px-3 py-2 rounded w-full text-sm block"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="bg-blue-500 text-white px-3 py-2 rounded w-full text-sm block"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="bg-green-500 text-white px-3 py-2 rounded w-full text-sm block"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
