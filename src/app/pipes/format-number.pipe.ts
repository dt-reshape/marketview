import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatNumber'
})
export class FormatNumberPipe implements PipeTransform {
  transform(value: string, defaultDecimals: number = 4): string {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return value;
    }

    // Если число меньше 0.01, показываем его с высокой точностью без экспоненты
    if (num > 0 && num < 0.01) {
      return num.toFixed(8).replace(/\.?0+$/, '');
    }

    // Для остальных чисел используем исходное значение и убираем конечные нули
    return num.toFixed(defaultDecimals).replace(/\.?0+$/, '');
  }
}
