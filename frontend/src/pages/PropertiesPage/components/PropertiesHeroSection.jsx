const PropertiesHeroSection = ({ title }) => {
  return (
    <div className="relative h-[50vh] sm:h-[60vh] lg:h-[60vh] overflow-hidden">
      {/* Background Image */}
      <img 
        src="/images/HeroProperties.png" 
        alt="Luxury properties in Spain"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-4">
        <div className="text-center text-white">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            { title }
          </h1>
        </div>
      </div>
    </div>
  );
};

export default PropertiesHeroSection;