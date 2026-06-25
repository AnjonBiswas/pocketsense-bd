declare module "react-calendar-heatmap" {
  import * as React from "react";

  type HeatmapValue = {
    date?: string;
    count?: number;
    [key: string]: unknown;
  };

  type CalendarHeatmapProps = {
    startDate: Date;
    endDate: Date;
    values: HeatmapValue[];
    classForValue?: (value: HeatmapValue | null) => string;
    tooltipDataAttrs?: (value: HeatmapValue | null) => Record<string, string>;
    showWeekdayLabels?: boolean;
  };

  export default class CalendarHeatmap extends React.Component<CalendarHeatmapProps> {}
}
