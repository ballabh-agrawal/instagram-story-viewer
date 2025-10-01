// App.jsx
import { useRef, useState } from "react";
import useStories from "./adding/useStories";
import StoryViewer from "./components/StoryViewer";

export default function App() {
  const { stories, addStory, deleteStory } = useStories();
  const [showPopup, setShowPopup] = useState(false);
  const [viewIndex, setViewIndex] = useState(null);
  const inputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1080;
        const maxHeight = 1920;
        let { width, height } = img;

        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const resizedBase64 = canvas.toDataURL("image/jpeg", 0.9);
        addStory(resizedBase64);
        setShowPopup(false);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteStory = (id) => {
    const confirm = window.confirm("Are you sure you want to delete this story?");
    if (confirm) {
      deleteStory(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1c2c] via-[#928dab] to-[#1f1c2c] text-white font-sans relative">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 shadow-sm bg-opacity-30 backdrop-blur border-b border-white/10">
        <h1 className="text-xl font-semibold tracking-tight">MyStories</h1>
        <button
          onClick={() => setShowPopup(true)}
          className="bg-gradient-to-r from-pink-500 to-yellow-400 text-black px-4 py-1 rounded-full text-sm font-medium hover:scale-105 transition"
        >
          + Add
        </button>
      </header>

      {/* Story Bar */}
      <section className="flex gap-4 overflow-x-auto px-4 py-5 no-scrollbar">
        {stories.length === 0 ? (
          <p className="text-sm text-gray-300">No stories yet</p>
        ) : (
          stories.map((story, index) => (
            <div
              key={story.id}
              className="flex flex-col items-center relative group"
            >
              <div
                className="cursor-pointer"
                onClick={() => setViewIndex(index)}
              >
                <div className="relative w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 via-yellow-400 to-orange-500 animate-pulse">
                  <div className="bg-gray-900 rounded-full p-[2px] w-full h-full">
                    <img
                      src={story.image}
                      alt="story"
                      className="rounded-full object-cover w-full h-full"
                    />
                  </div>
                </div>
                <p className="text-xs mt-1 text-gray-100">Story</p>
              </div>
              <button
                onClick={() => handleDeleteStory(story.id)}
                className="absolute top-0 right-0 -mt-2 -mr-2 text-xs bg-red-600 text-white px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </section>

      {/* Upload Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-xl p-6 w-72 text-center shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Upload a Story</h2>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mb-4 w-full"
            />
            <div className="flex justify-between">
              <button
                className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Viewer */}
      {viewIndex !== null && (
        <StoryViewer
          stories={stories}
          startIndex={viewIndex}
          onClose={() => setViewIndex(null)}
        />
      )}

      {/* Bottom Nav */}
      <footer className="fixed bottom-0 left-0 w-full bg-black/60 backdrop-blur-md border-t border-white/10 flex justify-around items-center h-14 text-gray-300">
        <button className="hover:text-white transition">
          <i className="fas fa-home"></i>
        </button>
        <button className="hover:text-white transition">
          <i className="fas fa-search"></i>
        </button>
        <button
          onClick={() => setShowPopup(true)}
          className="hover:text-white transition"
        >
          <i className="fas fa-plus-circle text-2xl"></i>
        </button>
        <button className="hover:text-white transition">
          <i className="fas fa-user-circle"></i>
        </button>
      </footer>
    </div>
  );
}

