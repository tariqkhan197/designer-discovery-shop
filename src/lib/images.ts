import coat from "@/assets/p-coat.jpg";
import blouse from "@/assets/p-blouse.jpg";
import tote from "@/assets/p-tote.jpg";
import loafer from "@/assets/p-loafer.jpg";
import knit from "@/assets/p-knit.jpg";
import trouser from "@/assets/p-trouser.jpg";
import hoops from "@/assets/p-hoops.jpg";
import sunglasses from "@/assets/p-sunglasses.jpg";

const MAP: Record<string, string> = { coat, blouse, tote, loafer, knit, trouser, hoops, sunglasses };

// Sample catalog uses bundled keys; vendor uploads will store full URLs.
export function productImage(key: string) {
  if (key.startsWith("http")) return key;
  return MAP[key] ?? coat;
}
