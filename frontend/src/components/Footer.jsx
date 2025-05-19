import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa"

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8 mt-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-y-4 gap-x-8">
            <div className="text-xl font-bold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
              </svg>
              SocialConnect
            </div>
            <div className="flex space-x-6">
              <a 
                href="#" 
                className="hover:text-blue-400 transform hover:scale-110 transition-all duration-300"
                aria-label="Twitter"
              >
                <FaTwitter size={22} />
              </a>
              <a 
                href="#" 
                className="hover:text-blue-400 transform hover:scale-110 transition-all duration-300"
                aria-label="GitHub"
              >
                <FaGithub size={22} />
              </a>
              <a 
                href="#" 
                className="hover:text-blue-400 transform hover:scale-110 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={22} />
              </a>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <nav className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">About</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a>
            </nav>
            <p className="text-gray-400 text-sm">© 2025 SocialConnect. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
