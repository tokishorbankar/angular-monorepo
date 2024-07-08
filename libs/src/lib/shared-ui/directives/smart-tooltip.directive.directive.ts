import { Directive, ElementRef, HostListener, AfterViewInit, Renderer2, OnDestroy } from '@angular/core';

@Directive({
  selector: '[libTooltip]',
})
export class SmartTooltipDirective implements AfterViewInit, OnDestroy {
  tooltipContainer: HTMLElement | null = null;
  resizeObserver: ResizeObserver;


  constructor(private elementRef: ElementRef, private renderer: Renderer2) {
    this.resizeObserver = new ResizeObserver(() => {
      this.createTooltip();
    });
  }
  

  ngAfterViewInit(): void {
    this.applyEllipsisStyle();
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver.disconnect();
    this.destroyTooltip();
  }


  @HostListener('mouseover')
  onMouseOver(): void {
    if (this.tooltipContainer) {
      this.renderer.setStyle(this.tooltipContainer, 'display', 'inherit');
      this.updateTooltipPositionAndArrow();
    }
  }


  @HostListener('mouseout')
  onMouseOut(): void {
    if (this.tooltipContainer) {
      this.renderer.setStyle(this.tooltipContainer, 'display', 'none');
    }
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
    const element = this.elementRef.nativeElement;
    const tooltipHTML = element.innerHTML.trim() || '';
  
    if (this.isOverflowing(element)) {
      if (!this.tooltipContainer) {
        this.tooltipContainer = this.renderer.createElement('div');
        if(this.tooltipContainer){
        this.tooltipContainer.innerHTML = tooltipHTML;
        this.applyStyle();
        this.renderer.appendChild(this.elementRef.nativeElement, this.tooltipContainer);
        }
      }
      this.updateTooltipPositionAndArrow();
    } else {
      this.destroyTooltip();
    }
  }
  

  private applyStyle() {
    if (!this.tooltipContainer) return;
    this.renderer.setStyle(this.tooltipContainer, 'display', 'none');
    this.renderer.setStyle(this.tooltipContainer, 'background-color', '#333');
    this.renderer.setStyle(this.tooltipContainer, 'color', '#fff');
    this.renderer.setStyle(this.tooltipContainer, 'padding', '5px');
    this.renderer.setStyle(this.tooltipContainer, 'border-radius', '5px');
    this.renderer.setStyle(this.tooltipContainer, 'box-shadow', '0 0 10px rgba(0, 0, 0, 0.3)');
    this.renderer.setStyle(this.tooltipContainer, 'position', 'absolute');
    this.renderer.setStyle(this.tooltipContainer, 'z-index', '1000');
  }

  private calculateTooltipPosition() {
    const elementRect = this.elementRef.nativeElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
  
    // Default position
    let position = 'top';
  
    // Check available space and update position accordingly
    if (elementRect.top < 100) {
      position = 'bottom';
    } else if (viewportHeight - elementRect.bottom < 100) {
      position = 'top';
    } else if (elementRect.left < 100) {
      position = 'right';
    } else if (viewportWidth - elementRect.right < 100) {
      position = 'left';
    }
  
    return position;
  }

  private updateTooltipPositionAndArrow() {
    if (this.tooltipContainer) {
      const position = this.calculateTooltipPosition();
  
      this.renderer.removeClass(this.tooltipContainer, 'tooltip-top');
      this.renderer.removeClass(this.tooltipContainer, 'tooltip-bottom');
      this.renderer.removeClass(this.tooltipContainer, 'tooltip-left');
      this.renderer.removeClass(this.tooltipContainer, 'tooltip-right');
  
      this.renderer.addClass(this.tooltipContainer, `tooltip-${position}`);
  
      switch (position) {
        case 'top':
          this.renderer.setStyle(this.tooltipContainer, 'top', `${this.elementRef.nativeElement.offsetTop - this.tooltipContainer.offsetHeight}px`);
          break;
        case 'bottom':
          this.renderer.setStyle(this.tooltipContainer, 'top', `${this.elementRef.nativeElement.offsetTop + this.elementRef.nativeElement.offsetHeight}px`);
          break;
        case 'left':
          this.renderer.setStyle(this.tooltipContainer, 'left', `${this.elementRef.nativeElement.offsetLeft - this.tooltipContainer.offsetWidth}px`);
          break;
        case 'right':
          this.renderer.setStyle(this.tooltipContainer, 'left', `${this.elementRef.nativeElement.offsetLeft + this.elementRef.nativeElement.offsetWidth}px`);
          break;
      }
    }
  }
  
  private destroyTooltip(): void {
    if (this.tooltipContainer) {
      this.renderer.removeChild(this.elementRef.nativeElement, this.tooltipContainer);
      this.tooltipContainer = null;
    }
  }

}