import { useState } from "react";
import { useCardStore } from "@/store/cardStore";

export default function Onboarding() {
  const completeOnboarding = useCardStore((s) => s.completeOnboarding);

  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (name || image) {
      completeOnboarding(name || "Me", image || undefined);
    } else {
      // If user submits nothing, still mark onboarding complete
      completeOnboarding("Me", undefined);
    }
  };

  const handleSkip = () => {
    completeOnboarding("Me", undefined);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center flex-col gap-6 bg-gray-50 p-4">
      <h1 className="text-3xl font-bold">Welcome!</h1>
      <p className="text-gray-600">Tell us your name and upload a picture (optional).</p>

      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border rounded px-3 py-2 w-64"
      />

      <input type="file" accept="image/*" onChange={handleImageUpload} />

      {image && (
        <img
          src={image}
          alt="preview"
          className="w-32 h-32 object-cover rounded-full border mt-2"
        />
      )}

      <div className="flex gap-4 mt-4">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Continue
        </button>
        <button
          onClick={handleSkip}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
