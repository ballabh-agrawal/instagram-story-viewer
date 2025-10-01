import React, { useEffect, useState, useRef } from "react";

const VIEW_DURATION = 3000;
const EXPIRY_DURATION = 24 * 60 * 60 * 1000;

export default function StoryViewer({ stories, startIndex = 0, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const [timeLeftText, setTimeLeftText] = useState("");
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const progressRefs = useRef([]);

  // 🟢 Setup progress bar and auto-next logic
  useEffect(() => {
    if (current >= stories.length) {
      onClose();
      return;
    }

    clearTimeout(timeoutRef.current);

    // Reset and animate progress bars
    stories.forEach((_, index) => {
      const bar = progressRefs.current[index];
      if (!bar) return;

      bar.style.transition = "none";

      if (index < current) {
        bar.style.width = "100%";
      } else if (index === current) {
        bar.style.width = "0%";
        void bar.offsetWidth;
        bar.style.transition = `width ${VIEW_DURATION}ms linear`;
        bar.style.width = "100%";
      } else {
        bar.style.width = "0%";
      }
    });

    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => prev + 1);
    }, VIEW_DURATION);

    return () => clearTimeout(timeoutRef.current);
  }, [current]);

  // ⏳ Time left updater
  useEffect(() => {
    updateTimeLeft();
    intervalRef.current = setInterval(updateTimeLeft, 1000 * 30); // update every 30s

    return () => clearInterval(intervalRef.current);
  }, [current]);

  const updateTimeLeft = () => {
    const currentStory = stories[current];
    if (!currentStory) return;

    const timePassed = Date.now() - currentStory.timestamp;
    const timeLeft = EXPIRY_DURATION - timePassed;

    if (timeLeft <= 0) {
      setTimeLeftText("Expired");
    } else {
      const hours = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      setTimeLeftText(`Expires in ${hours}h ${minutes}m`);
    }
  };

  const handleClick = (e) => {
    const x = e.clientX;
    const middle = window.innerWidth / 2;
    clearTimeout(timeoutRef.current);

    if (x < middle && current > 0) {
      setCurrent((prev) => prev - 1);
    } else if (x >= middle && current < stories.length - 1) {
      // ✅ Force fill current bar if jumping forward
      const bar = progressRefs.current[current];
      if (bar) {
        bar.style.transition = "none";
        bar.style.width = "100%";
      }
      setCurrent((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const currentStory = stories[current];
  if (!currentStory) return null;

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center"
      onClick={handleClick}
    >
      {/* Progress Bars */}
      <div className="absolute top-2 left-2 right-2 flex gap-1 z-50">
        {stories.map((_, index) => (
          <div
            key={index}
            className="flex-1 bg-gray-600 h-1 rounded overflow-hidden"
          >
            <div
              ref={(el) => (progressRefs.current[index] = el)}
              className="bg-white h-full w-0"
            ></div>
          </div>
        ))}
      </div>

      {/* Story Image */}
      <img
        src={currentStory.image}
        alt="story"
        className="max-w-full max-h-[85%] object-contain rounded-lg shadow-lg transition duration-500"
      />

      {/* Time Left Display */}
      <div className="text-white text-sm mt-2 mb-6">{timeLeftText}</div>

      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 text-white text-3xl z-50"
      >
        &times;
      </button>
    </div>
  );
}
