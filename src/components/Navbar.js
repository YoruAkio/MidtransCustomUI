import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCode } from "react-icons/fa";

export default function Navbar({ scrollToSection, servicesRef, processRef, contactRef }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: "Services", ref: servicesRef },
    { label: "Process", ref: processRef },
    { label: "Contact", ref: contactRef },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <motion.header
      className="sticky top-0 z-50 backdrop-blur-md bg-white/60 border-b border-white/20 px-6 py-4"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <FaCode className="text-[#5E81F4] text-2xl" />
          <span className="font-bold text-xl tracking-tight">YoruAkio</span>
        </motion.div>

        {/* Desktop Menu */}
        <nav className="hidden md:block">
          <ul className="flex gap-8 items-center">
            {menuItems.map((item, index) => (
              <motion.li
                key={index}
                onClick={() => scrollToSection(item.ref)}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer font-medium hover:text-[#5E81F4]"
              >
                {item.label}
              </motion.li>
            ))}
            <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={() => scrollToSection(contactRef)}
                className="px-5 py-2 bg-[#5E81F4] text-white rounded-full font-medium hover:shadow-lg transition duration-300"
              >
                Get Started
              </button>
            </motion.li>
          </ul>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg bg-white/70 border border-white/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white shadow-lg z-40"
          >
            <ul className="flex flex-col gap-4 p-4">
              {menuItems.map((item, index) => (
                <li
                  key={index}
                  onClick={() => {
                    scrollToSection(item.ref);
                    setIsMobileMenuOpen(false);
                  }}
                  className="cursor-pointer font-medium text-gray-800 hover:text-[#5E81F4] transition"
                >
                  {item.label}
                </li>
              ))}
              <li>
                <button
                  onClick={() => {
                    scrollToSection(contactRef);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2 bg-[#5E81F4] text-white rounded-lg font-medium hover:shadow-lg transition duration-300"
                >
                  Get Started
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}