declare module 'react-simple-maps' {
  import * as React from 'react';

  export interface ComposableMapProps extends React.SVGProps<SVGSVGElement> {
    projection?: string | ((width: number, height: number, ...args: any[]) => any);
    projectionConfig?: {
      scale?: number;
      center?: [number, number];
      rotate?: [number, number, number];
      parallels?: [number, number];
      [key: string]: any;
    };
    width?: number;
    height?: number;
  }

  export class ComposableMap extends React.Component<ComposableMapProps> {}

  export interface GeographiesProps {
    geography?: string | object | string[];
    children: (data: { geographies: any[] }) => React.ReactNode;
    [key: string]: any;
  }

  export class Geographies extends React.Component<GeographiesProps> {}

  export interface GeographyProps extends React.SVGProps<SVGPathElement> {
    geography?: any;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
    [key: string]: any;
  }

  export class Geography extends React.Component<GeographyProps> {}

  export interface MarkerProps extends React.SVGProps<SVGGElement> {
    coordinates: [number, number];
    [key: string]: any;
  }

  export class Marker extends React.Component<MarkerProps> {}
}
