import React, { useState } from "react";

const App = () => {
  const [activeSection, setActiveSection] = useState(null);

  const handleMouseEnter = (section) => {
    setActiveSection(section);
  };

  const handleMouseLeave = () => {
    setActiveSection(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white text-center py-4">
        <h1 className="text-2xl font-bold">BALANCED LIVING</h1>
      </header>

      <main className="flex flex-1 flex-col md:flex-row">
        {/* Workout Section */}
        <section
          className={`flex-1 p-8 transition-all duration-300 ${
            activeSection === "workout" ? "md:flex-[1.2]" : "flex-1"
          } bg-red-500 text-white`}
          onMouseEnter={() => handleMouseEnter("workout")}
          onMouseLeave={handleMouseLeave}
        >
          <h2 className="text-3xl font-bold mb-6 uppercase tracking-wider">
            Workout
          </h2>

          <div
            className={`transition-all duration-500 overflow-hidden ${
              activeSection === "workout" || activeSection === null
                ? "max-h-screen"
                : "max-h-0"
            }`}
          >
            <WorkoutCard
              title="Strength Training"
              description="Build muscle, increase metabolism, and improve overall fitness with our comprehensive strength training programs."
              buttonText="View Programs"
            />

            <WorkoutCard
              title="Cardio Workouts"
              description="Boost your heart health, burn calories, and increase endurance with our effective cardio routines."
              buttonText="Start Running"
            />

            <WorkoutCard
              title="Flexibility & Mobility"
              description="Improve your range of motion, prevent injuries, and enhance recovery with our stretching and mobility exercises."
              buttonText="Try Yoga"
            />

            <WorkoutCard
              title="Workout Plans"
              description="Get structured, progressive workout plans tailored to your fitness level and goals."
              buttonText="Find Your Plan"
            />
          </div>
        </section>

        {/* Lifestyle Section */}
        <section
          className={`flex-1 p-8 transition-all duration-300 ${
            activeSection === "lifestyle" ? "md:flex-[1.2]" : "flex-1"
          } bg-blue-500 text-white`}
          onMouseEnter={() => handleMouseEnter("lifestyle")}
          onMouseLeave={handleMouseLeave}
        >
          <h2 className="text-3xl font-bold mb-6 uppercase tracking-wider">
            Lifestyle
          </h2>

          <div
            className={`transition-all duration-500 overflow-hidden ${
              activeSection === "lifestyle" || activeSection === null
                ? "max-h-screen"
                : "max-h-0"
            }`}
          >
            <LifestyleCard
              title="Nutrition"
              description="Discover healthy recipes, meal plans, and nutritional advice to fuel your body and support your fitness goals."
              buttonText="Healthy Recipes"
            />

            <LifestyleCard
              title="Mindfulness"
              description="Reduce stress, improve focus, and enhance your mental well-being with mindfulness practices and meditation techniques."
              buttonText="Start Meditating"
            />

            <LifestyleCard
              title="Sleep Optimization"
              description="Learn how to improve your sleep quality for better recovery, cognition, and overall health."
              buttonText="Sleep Better"
            />

            <LifestyleCard
              title="Balance & Wellness"
              description="Find harmony between work, fitness, social life, and personal time with our holistic approach to wellness."
              buttonText="Life Balance Tips"
            />
          </div>
        </section>
      </main>
    </div>
  );
};

const WorkoutCard = ({ title, description, buttonText }) => {
  return (
    <div className="bg-white bg-opacity-20 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="mb-4">{description}</p>
      <a
        href="#"
        className="inline-block px-6 py-3 bg-white text-red-500 font-bold rounded-full transition-transform hover:scale-105"
      >
        {buttonText}
      </a>
    </div>
  );
};

const LifestyleCard = ({ title, description, buttonText }) => {
  return (
    <div className="bg-white bg-opacity-20 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="mb-4">{description}</p>
      <a
        href="#"
        className="inline-block px-6 py-3 bg-white text-blue-500 font-bold rounded-full transition-transform hover:scale-105"
      >
        {buttonText}
      </a>
    </div>
  );
};

export default App;
