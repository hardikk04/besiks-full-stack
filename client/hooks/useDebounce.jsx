import { useEffect, useState } from "react";

const useDebounce = (input, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(input);

  useEffect(() => {
    const interval = setTimeout(() => {
      setDebouncedValue(input);
    }, delay);

    return () => clearTimeout(interval);
  }, [input, delay]);

  return debouncedValue;
};

export default useDebounce;
