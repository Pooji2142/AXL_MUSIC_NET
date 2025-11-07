// color-thief-browser.d.ts
declare module "color-thief-browser" {
    export default class ColorThief {
      getColor(image: HTMLImageElement, quality?: number): [number, number, number];
      getPalette(image: HTMLImageElement, colorCount?: number, quality?: number): [number, number, number][];
    }
  }
  