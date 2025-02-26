import React from 'react'

const NotFound = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-6xl font-bold text-red-500">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-4">
          Oops! The page you're looking for doesn't exist. <br />
          It may have been moved, deleted, or the URL might be incorrect.
        </p>
        <a
          href="/"
          className="mt-6 inline-block px-6 py-3 text-white bg-blue-500 hover:bg-blue-600 font-medium rounded-lg shadow transition duration-200"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  )
}

export default NotFound
