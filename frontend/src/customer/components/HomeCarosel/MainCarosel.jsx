import React from "react";
import AliceCarousel from "react-alice-carousel";
import "react-alice-carousel/lib/alice-carousel.css";
import { MainCaroselData } from "./MainCaroselData";

const MainCarosel = () => {
  const items = MainCaroselData.map((item, i) => {
    let overlayContent = null;

    if (item.image.includes("front3")) {
      overlayContent = (
        <div className="flex flex-col items-center text-center px-4 md:px-0 md:ml-[50%]">
          <h1
            className="font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wide mb-4 md:mb-6"
            style={{
              textShadow:
                "4px 4px 12px rgba(0,0,0,0.6), 0 0 25px rgba(255,255,255,0.3)",
            }}
          >
            Shree Sai Collection
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl max-w-sm md:max-w-2xl">
            <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold block">
              Play, learn and grow
            </span>
            <br />
            Crafting smiles with every toy, made for learning, fun, and growth.
          </p>
        </div>
      );
    } else if (item.image.includes("Rectangle")) {
      overlayContent = (
        <div className="flex flex-col items-center text-center px-4 md:px-0 md:ml-[50%]">
          <h1
            className="font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wide"
            style={{
              textShadow:
                "4px 4px 12px rgba(0,0,0,0.6), 0 0 25px rgba(255,255,255,0.3)",
            }}
          >
            श्री साई कलेक्शन
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl max-w-sm md:max-w-2xl mt-2 md:mt-4">
            <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold block">
              खेळा, शिका आणि वाढा
            </span>
            <br />
            प्रत्येक खेळण्यामधून हसू, आनंद आणि ज्ञानाची निर्मिती
          </p>
        </div>
      );
    }

    return (
      <div key={i} className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] w-full">
        <img
          src={item.image}
          alt=""
          className="h-full w-full md:object-fit"
        />

        {overlayContent && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 text-white text-center px-4">
            {overlayContent}
          </div>
        )}
      </div>
    );
  });

  return (
    <AliceCarousel
      autoPlay
      autoPlayInterval={3000}
      animationDuration={1000}
      infinite
      disableDotsControls
      disableButtonsControls
      items={items}
    />
  );
};

export default MainCarosel;
