import { IBtcEntity } from "@metaid/metaid";
import { atom } from "jotai";
// import { Pin } from '../components/BuzzList';

export const buzzEntityAtom = atom<IBtcEntity | null>(null);
// export const buzzPinsAtom = atom<Pin[] | []>([]);
