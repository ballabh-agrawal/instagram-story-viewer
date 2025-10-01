import { useState, useEffect } from "react";

const EXPIRY_DURATION = 24 * 60 * 60 * 1000;

export default function useStories() {
  const [stories, setStories] = useState([]);

  // Load and clean expired stories
  const cleanExpiredStories = (allStories) => {
    const now = Date.now();
    const valid = allStories.filter(
      (story) => now - story.timestamp < EXPIRY_DURATION
    );
    if (valid.length !== allStories.length) {
      localStorage.setItem("stories", JSON.stringify(valid));
    }
    return valid;
  };

  // On mount, load stories
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("stories")) || [];
    setStories(cleanExpiredStories(stored));
  }, []);

  // Periodically clean expired stories (every 1 min)
  useEffect(() => {
    const interval = setInterval(() => {
      setStories((prev) => cleanExpiredStories(prev));
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Add new story
  const addStory = (base64) => {
    const newStory = {
      id: Date.now().toString(),
      image: base64,
      timestamp: Date.now(),
    };
    const updated = [newStory, ...stories];
    setStories(updated);
    localStorage.setItem("stories", JSON.stringify(updated));
  };

  // Delete specific story
  const deleteStory = (id) => {
    const updated = stories.filter((story) => story.id !== id);
    setStories(updated);
    localStorage.setItem("stories", JSON.stringify(updated));
  };

  return { stories, addStory, deleteStory };
}
