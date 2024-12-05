"use client";

interface UserNameInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UserNameInput({ value, onChange }: UserNameInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
        Your Name
      </label>
      <input
        type="text"
        id="name"
        value={value}
        onChange={onChange}
        required
        placeholder="Enter your name"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}
