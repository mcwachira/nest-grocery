import {Heart, MapPin, Search, ShoppingCart, User} from "lucide-react";
import Image from "next/image";
import Plant from "@/src/assets/plant 1.jpg";

const Header = () => {

    return (
   <header>
   {/*    Top Bar*/}
       <div className="bg-gray-100 text-sm py-2">
           <div  className="container mx-auto px-4 flex justify-between items-center">
               <div className="flex items-center  space-x-6">
                   <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />Store Location: Nairobi Kenya</span>
               </div>

               <div className="flex items-center  space-x-6">
                   <span>Eng</span>
                   <span>USD</span>
                   <span>Sign In / Sign Up</span>
               </div>
           </div>
       </div>

   {/*    Main Header */}
       <div className="bg-white shadow-sm">
           <div className="container mx-auto px-4 py-4">
<div className="flex items-center justify-between">
    <div className="flex items-center ">
    <div className="text-2xl font-bold text-green-600 mr-2">
        <Image src={Plant} alt="logo" width={50} height={50} />
    </div>
    <span className="text-2xl text-green-600 font-bold">Nest Groceries</span>
</div>

               <div className="flex-1 max-w-2xl mx-8">
                   <div className="relative">
                       <Search className="absolute left-3 top-1/2 transforom -translate-y-1/2 text-gray-400 w-5 h-5 "/>
                       <input
                           type="text"
                           placeholder="Search"
                           className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                       />
                       <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">
                           Search
                       </button>

                   </div>
               </div>

    <div className="flex items-center space-x-6">

        <Heart className="w-6 h-6 cursor-pointer hover:text-green-600"/>
        <div className="relative">
            <ShoppingCart className="w-6 h-6 cursor-pointer hover:text-green-600"/>
            <span className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
        </div>

        <div className="flex items-center space-x-2">
            <User className="w-6 h-6" />
            <span className="text-sm">$57.00</span>
        </div>
        </div>
    </div>
               </div>
           </div>

   </header>
    )
}
export default Header