import Image from "next/image";

const Dashboard = () => {
  return (
    <div>
      <div className="flex flex-col items-center mb-4">
        <Image
          src="/images/cup.png"
          alt="Leaderboard"
          width={80}
          height={80}
          className="rounded-full"
        />
        <p className="text-black font-bold text-lg pt-2 ">Leaderboard</p>
      </div>

      <div className="w-full  border rounded-xl p-4 flex justify-between items-center mb-10">
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col items-start">
            <p className="  text-black font-['Raleway'] ">Total participants</p>
          </div>
        </div>

        <p className=" text-black font-['Raleway']">20,465,485 players</p>
      </div>

      <div className="w-full border-t-1 border-b-1 p-4 flex justify-between my-10 border rounded-xl  items-center bg-white">
        <div className="flex items-center justify-center gap-4">
          <div className="bg-[#F5F5F5] p-2 rounded-lg">
            <Image src="/images/badge.svg" alt="Logo" width={30} height={30} />
          </div>

          <div className="flex flex-col items-start">
            <p className="  text-black font-['Raleway'] ">Duchekelvin</p>
            <p className="text-[#000000B2] font-['Raleway']">#20,035</p>
          </div>
        </div>

       
        <p className=" text-black font-['Raleway']">2,564,466 xps</p>
      </div>

      <div className="border rounded-xl">
        <div className="w-full border-t-1 border-b-1 p-4 flex justify-between items-center">
          <div className="flex items-center justify-center gap-4">
            <div className="bg-white p-2 rounded-lg">
              <Image
                src="/images/badge.svg"
                alt="Logo"
                width={30}
                height={30}
              />
            </div>

            <div className="flex flex-col items-start">
              <p className="  text-black  font-['Raleway']">Duchekelvin</p>
              <Image
                src="/images/gold.png"
                alt="gold Logo"
                width={15}
                height={15}
                className=""
              />
            </div>
          </div>

      
          <p className=" text-black font-['Raleway']">2,564,466 xps</p>
        </div>

        <div className="w-full border-t-2 border-b-1 p-4 flex justify-between items-center">
          <div className="flex items-center justify-center gap-4">
            <div className="bg-white p-2 rounded-lg">
              <Image
                src="/images/badge.svg"
                alt="Logo"
                width={30}
                height={30}
              />
            </div>

            <div className="flex flex-col items-start">
              <p className=" text-black font-['Raleway']">Duchekelvin</p>
              <Image
                src="/images/silver.png"
                alt="gold Logo"
                width={15}
                height={15}
                className=""
              />
            </div>
          </div>

          <p className=" text-black font-['Raleway']">2,564,466 xps</p>
        </div>

        <div className="w-full border-t-2 border-b-1 p-4 flex justify-between items-center">
          <div className="flex items-center justify-center gap-4">
            <div className="bg-white p-2 rounded-lg">
              <Image
                src="/images/badge.svg"
                alt="Logo"
                width={30}
                height={30}
              />
            </div>

            <div className="flex flex-col items-start">
              <p className=" text-black font-['Raleway'] ">
                Duchekelvin
              </p>
              <Image
                src="/images/bronze.png"
                alt="gold Logo"
                width={15}
                height={15}
                className=""
              />
            </div>
          </div>

        
          <p className="text-lg text-black font-['Raleway']">2,564,466 xps</p>
        </div>

        <div className="w-full border-t-2 border-b-1 p-4 flex justify-between items-center">
          <div className="flex items-center justify-center gap-4">
            <div className="bg-white p-2 rounded-lg">
              <Image
                src="/images/badge.svg"
                alt="Logo"
                width={30}
                height={30}
              />
            </div>

            <div className="flex flex-col items-start">
              <p className=" text-black font-['Raleway'] ">Duchekelvin</p>
              <p className="text-black font-['Raleway']">#4</p>
            </div>
          </div>

        
          <p className=" text-black font-['Raleway']">2,564,466 xps</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
