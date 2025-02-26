const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#f6f3ff] border-t border-gray-200">
      <div className="px-6 py-4 text-center">
        <p className="text-gray-600 font-semibold">&copy; Copyright {currentYear}. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
