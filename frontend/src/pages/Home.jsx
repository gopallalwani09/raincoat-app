import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 md:py-20 px-4">
      <h1 className="text-4xl md:text-6xl font-black text-dark mb-4 md:mb-6 tracking-tight leading-tight">
        Stay Dry, Look <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Stunning</span>
      </h1>
      <p className="text-lg md:text-xl text-gray-500 mb-8 md:mb-12 max-w-2xl font-light px-2">
        Discover our premium collection of raincoats for Men, Women, and Kids. 
        Engineered for protection, designed for style.
      </p>
      
      <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
        <Link to="/shop/Men" className="px-6 py-3 md:px-8 md:py-4 bg-dark text-white rounded-full font-semibold hover:bg-gray-800 transition-all hover:-translate-y-1 shadow-lg">
          Shop Men
        </Link>
        <Link to="/shop/Women" className="px-6 py-3 md:px-8 md:py-4 bg-primary text-white rounded-full font-semibold hover:bg-blue-600 transition-all hover:-translate-y-1 shadow-lg shadow-blue-200">
          Shop Women
        </Link>
        <Link to="/shop/Kids" className="px-6 py-3 md:px-8 md:py-4 bg-secondary text-white rounded-full font-semibold hover:bg-emerald-600 transition-all hover:-translate-y-1 shadow-lg shadow-emerald-200">
          Shop Kids
        </Link>
      </div>

      <div className="mt-16 md:mt-32 w-full max-w-5xl bg-white rounded-3xl md:rounded-[3rem] p-6 md:p-12 shadow-2xl border border-gray-100 flex flex-col md:flex-row items-center gap-8 md:gap-12 text-left">
         <div className="flex-1 w-full">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">Why choose Jai Maa Ambe V.B.?</h2>
            <p className="text-gray-500 mb-6 text-sm md:text-base">Our fabrics are 100% waterproof yet breathable, ensuring you stay comfortable in any downpour.</p>
            <ul className="space-y-3 md:space-y-4">
              <li className="flex items-center gap-3 text-dark font-medium text-sm md:text-base"><span className="text-primary text-xl">✓</span> Advanced Waterproofing</li>
              <li className="flex items-center gap-3 text-dark font-medium text-sm md:text-base"><span className="text-primary text-xl">✓</span> Breathable Materials</li>
              <li className="flex items-center gap-3 text-dark font-medium text-sm md:text-base"><span className="text-primary text-xl">✓</span> Sustainable Fashion</li>
            </ul>
         </div>
         <div className="flex-1 bg-blue-50 rounded-3xl h-48 md:h-64 w-full flex items-center justify-center">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-primary/20 rounded-full flex items-center justify-center relative">
               <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/40 rounded-full absolute"></div>
               <svg className="w-8 h-8 md:w-12 md:h-12 text-primary relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
            </div>
         </div>
      </div>
    </div>
  );
};
export default Home;
