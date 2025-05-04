import { motion } from "framer-motion";
import { FaCode, FaTelegramPlane, FaTwitter, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="py-8 md:py-10 px-4 md:px-6 border-t border-white/20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <FaCode className="text-[#5E81F4] text-xl" />
          <span className="font-bold text-lg">YoruAkio</span>
        </div>

        <p className="text-[#666] text-center md:text-left text-sm md:text-base">
          &copy; {new Date().getFullYear()} YoruAkio. All rights reserved.
        </p>

        <div className="flex gap-4 mt-4 md:mt-0">
          <motion.a
            href="https://t.me/ethermite"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-[#5E81F4] border border-white/20"
            whileHover={{ y: -5 }}
          >
            <FaTelegramPlane />
          </motion.a>
          <motion.a
            href="https://twitter.com/yoruakio"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-[#5E81F4] border border-white/20"
            whileHover={{ y: -5 }}
          >
            <FaTwitter />
          </motion.a>
          <motion.a
            href="mailto:yoruakio@proton.me"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-[#5E81F4] border border-white/20"
            whileHover={{ y: -5 }}
          >
            <FaEnvelope />
          </motion.a>
        </div>
      </div>
    </footer>
  );
}