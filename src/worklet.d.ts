export class SpoilerPainterWorklet {
  static get contextOptions(): { alpha: boolean };
  static get inputProperties(): string[];
  paint(
    ctx: CanvasRenderingContext2D,
    size: { width: number; height: number },
    props: { get(name: string): string | undefined },
  ): void;
}
