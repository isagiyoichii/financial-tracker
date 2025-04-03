import { ChartData, ChartOptions } from 'chart.js';

declare module 'react-chartjs-2' {
  export class Pie extends React.Component<{
    data: ChartData<'pie'>;
    options?: ChartOptions<'pie'>;
    height?: number;
    width?: number;
    redraw?: boolean;
  }> {}
  
  export class Line extends React.Component<{
    data: ChartData<'line'>;
    options?: ChartOptions<'line'>;
    height?: number;
    width?: number;
    redraw?: boolean;
  }> {}
  
  export class Bar extends React.Component<{
    data: ChartData<'bar'>;
    options?: ChartOptions<'bar'>;
    height?: number;
    width?: number;
    redraw?: boolean;
  }> {}
  
  export class Doughnut extends React.Component<{
    data: ChartData<'doughnut'>;
    options?: ChartOptions<'doughnut'>;
    height?: number;
    width?: number;
    redraw?: boolean;
  }> {}
} 