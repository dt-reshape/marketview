import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatVolume'
})
export class FormatVolumePipe implements PipeTransform {
  transform(value: string): string {
    const num = parseFloat(value);
    if (num === null || num === undefined || isNaN(num)) {
      return '';
    }
    if (num >= 1e12) {
      return (num / 1e12).toFixed(1) + 'T'; // Триллионы
    } else if (num >= 1e9) {
      return (num / 1e9).toFixed(1) + 'B'; // Миллиарды
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(1) + 'M'; // Миллионы
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(1) + 'K'; // Тысячи
    }
    return num.toString();
  }
}
