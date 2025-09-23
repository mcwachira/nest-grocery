import Plant from "@/src/assets/plant 1.jpg"
import Image from "next/image"
const Logo = () => {


    return (
        <div className="flex items-center space-x-2  my-10">

            <Image src={Plant} width={50} height={50} />
            <span className="  text-3xl font-bold ">
                Nest Grocery
            </span>
        </div>
    )
}

export default Logo