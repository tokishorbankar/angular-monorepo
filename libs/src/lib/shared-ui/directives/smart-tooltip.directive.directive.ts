import {
  Directive,
  ElementRef,
  HostListener,
  AfterViewInit,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[libTooltip]',
})
export class SmartTooltipDirective implements AfterViewInit {
  tooltipContainer: HTMLElement | null = null;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.applyEllipsisStyle();
    this.createTooltip();
  }

  @HostListener('mouseover')
  onMouseOver(): void {
    if (this.tooltipContainer) {
      this.renderer.setStyle(this.tooltipContainer, 'display', 'inherit');
    }
  }

  @HostListener('mouseout')
  onMouseOut(): void {
    if (this.tooltipContainer) {
      this.renderer.setStyle(this.tooltipContainer, 'display', 'none');
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.createTooltip();
  }

  private applyEllipsisStyle(): void {
    const element = this.elementRef.nativeElement;
    this.renderer.setStyle(element, 'white-space', 'nowrap');
    this.renderer.setStyle(element, 'overflow', 'hidden');
    this.renderer.setStyle(element, 'text-overflow', 'ellipsis');
  }

  private isOverflowing(element: HTMLElement): boolean {
    return element.scrollWidth > element.clientWidth;
  }

  private createTooltip(): void {
    if (!this.tooltipContainer) {
      const element = this.elementRef.nativeElement;
      const tooltipText = element.textContent?.trim() || '';

      if (this.isOverflowing(element)) {
        this.tooltipContainer = this.renderer.createElement('div');
        const text = this.renderer.createText(tooltipText);
        this.applyStyle();
        this.renderer.appendChild(this.tooltipContainer, text);
        this.renderer.appendChild(
          this.elementRef.nativeElement,
          this.tooltipContainer
        );
      }
    }
  }

  private applyStyle() {
    this.renderer.setStyle(this.tooltipContainer, 'display', 'none');
    this.renderer.setStyle(this.tooltipContainer, 'background-color', '#333');
    this.renderer.setStyle(this.tooltipContainer, 'color', '#fff');
    this.renderer.setStyle(this.tooltipContainer, 'padding', '5px');
    this.renderer.setStyle(this.tooltipContainer, 'border-radius', '5px');
    this.renderer.setStyle(this.tooltipContainer, 'box-shadow', '0 0 10px rgba(0, 0, 0, 0.3)');
    this.renderer.setStyle(this.tooltipContainer, 'margin-left', '5px');
    this.renderer.setStyle(this.tooltipContainer, 'margin-top', '5px');
    this.renderer.setStyle(this.tooltipContainer, 'position', 'absolute');
    this.renderer.setStyle(this.tooltipContainer, 'z-index', '1000');
  }
}
