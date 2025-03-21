"use client";
import ArcadeButton from "./ArcadeButton";

interface SignupPromptProps {
  onSignup: () => void;
}

const SignupPrompt: React.FC<SignupPromptProps> = ({ onSignup }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-2xl text-yellow-300 neon-text mb-8">
        INSERT COIN TO START
      </h2>

      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 animate-pulse"></div>
        <ArcadeButton onClick={onSignup} className="relative px-8 py-6 text-lg">
          PRESS START
        </ArcadeButton>
      </div>

      <p className="mt-6 text-gray-400 text-center max-w-md">
        Experience the L402 Lightning protocol in this retro arcade demo. Sign
        up to get started!
      </p>
    </div>
  );
};

export default SignupPrompt;
