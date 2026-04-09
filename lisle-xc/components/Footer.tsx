export const Footer = () => {
    return (
        <footer className="bg-lisle-blue text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
          
          <div className="text-center md:text-left">
            <div className="flex flex-col mb-2">
              <span className="font-heading font-bold text-2xl uppercase leading-none">Lisle</span>
              <span className="font-heading font-light text-sm tracking-[0.2em] uppercase leading-none text-light-blue">Cross Country</span>
            </div>
            <p className="font-body text-xs text-light-blue-gray uppercase tracking-widest mt-4">
              © 2026 <a href="https://sportssites.us/">School Sports Sites</a>
            </p>
          </div>
        </div>
        <div className="h-2 bg-light-blue"></div>
      </footer>
    );
};