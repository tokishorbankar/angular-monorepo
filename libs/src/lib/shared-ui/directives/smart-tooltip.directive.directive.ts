import { Directive, ElementRef, HostListener, AfterViewInit, Renderer2, OnDestroy } from '@angular/core';
import { debounceTime, Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[libTooltip]',
})
export class SmartTooltipDirective implements AfterViewInit, OnDestroy {
  tooltipContainer: HTMLElement | null = null;
  resizeObserver: ResizeObserver;
  private resize$: Subject<Array<ResizeObserverEntry>> = new Subject<Array<ResizeObserverEntry>>();
  private unsubscribe$: Subject<boolean> = new Subject<boolean>();

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {
    this.resizeObserver = new ResizeObserver(entries => this.resize$.next(entries));
  }

  ngAfterViewInit(): void {
    this.resizeObserver.observe(this.elementRef.nativeElement);
    this.resize$
      .pipe(
        debounceTime(300),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => this.createTooltip());
    this.applyEllipsisStyle();
  }

  ngOnDestroy(): void {
    this.resizeObserver.disconnect();
    this.unsubscribe$.complete();
    this.destroyTooltip();
  }

  @HostListener('mouseover')
  onMouseOver(): void {
    if (this.tooltipContainer) {
      this.renderer.setStyle(this.tooltipContainer, 'display', 'block');
      this.updateTooltipPosition();
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
    const tooltipText = element.innerText.trim() || '';

    if (this.isOverflowing(element)) {
      if (!this.tooltipContainer) {
        this.tooltipContainer = this.renderer.createElement('div');
        if (this.tooltipContainer) {
          this.tooltipContainer.innerHTML = tooltipText;
          this.applyStyle();
          this.renderer.appendChild(document.body, this.tooltipContainer);
        }
      }
      this.updateTooltipPosition();
    } else {
      this.destroyTooltip();
    }
  }

  private applyStyle() {
    if (!this.tooltipContainer) return;
    this.renderer.setStyle(this.tooltipContainer, 'position', 'absolute');
    this.renderer.setStyle(this.tooltipContainer, 'z-index', '1000');
    this.renderer.setStyle(this.tooltipContainer, 'background-color', '#333');
    this.renderer.setStyle(this.tooltipContainer, 'color', '#fff');
    this.renderer.setStyle(this.tooltipContainer, 'padding', '5px');
    this.renderer.setStyle(this.tooltipContainer, 'border-radius', '5px');
    this.renderer.setStyle(this.tooltipContainer, 'box-shadow', '0 2px 4px rgba(0,0,0,0.2)');
    this.renderer.setStyle(this.tooltipContainer, 'display', 'none');
  }

  private updateTooltipPosition() {
    if (this.tooltipContainer) {
      const elementRect = this.elementRef.nativeElement.getBoundingClientRect();
      const tooltipRect = this.tooltipContainer.getBoundingClientRect();
      const offsetTop = elementRect.top + window.scrollY;
      const offsetLeft = elementRect.left + window.scrollX;
      const top = offsetTop - tooltipRect.height - 1;
      const left = offsetLeft + (elementRect.width / 2) - (tooltipRect.width / 2);
      this.renderer.setStyle(this.tooltipContainer, 'top', `${top}px`);
      this.renderer.setStyle(this.tooltipContainer, 'left', `${left}px`);
    }
  }

  private destroyTooltip(): void {
    if (this.tooltipContainer) {
      this.renderer.removeChild(document.body, this.tooltipContainer);
      this.tooltipContainer = null;
    }
  }
}