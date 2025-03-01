import { useState, useEffect } from 'react';

const useCounter = (endValue, duration = 1) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    // Adjust stepTime to make it faster (smaller interval between each increment)
    const stepTime = Math.max(Math.floor(duration / endValue), 0.1); // Minimum stepTime of 10ms
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= endValue) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [endValue, duration]);

  return count;
};

export default useCounter;
