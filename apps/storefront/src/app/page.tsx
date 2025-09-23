import { log } from "@repo/logger";


export const metadata = {
  title: "Store | Kitchen Sink",
};

export default function Store() {
  log("Hey! This is the Store page.");

  return (
   <div className="text-center">
       <h1 className="text-5xl text-blue-800">
           Hello
       </h1>
   </div>
  );
}
