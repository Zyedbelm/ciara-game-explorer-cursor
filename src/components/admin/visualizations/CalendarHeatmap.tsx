import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface CalendarHeatmapProps {
  cityId?: string;
  timeRange: string;
}

interface DayData {
  date: Date;
  count: number;
  level: number;
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ cityId, timeRange }) => {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const now = new Date();
        const daysBack = timeRange === '2y' ? 730 : timeRange === '1y' ? 365 : 90;
        const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

        let query = supabase
          .from('step_completions')
          .select('completed_at, step:steps!inner(city_id)')
          .gte('completed_at', startDate.toISOString());

        if (cityId) {
          query = query.eq('step.city_id', cityId);
        }

        const { data: completions, error } = await query;
        if (error) throw error;

        // Group completions by date
        const dailyCounts = new Map<string, number>();
        completions?.forEach(completion => {
          const date = new Date(completion.completed_at).toDateString();
          dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
        });

        // Generate complete date range
        const maxCount = Math.max(...Array.from(dailyCounts.values()));
        const calendarData: DayData[] = [];
        
        for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toDateString();
          const count = dailyCounts.get(dateStr) || 0;
          const level = maxCount > 0 ? Math.ceil((count / maxCount) * 4) : 0;
          
          calendarData.push({
            date: new Date(d),
            count,
            level
          });
        }

        setData(calendarData);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cityId, timeRange]);

  useEffect(() => {
    if (data.length === 0) return;

    // Clear previous chart
    d3.select('#calendar-heatmap').selectAll('*').remove();

    const svg = d3.select('#calendar-heatmap');
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const cellSize = 12;
    const yearHeight = cellSize * 7 + 50;

    // Group data by year
    const years = d3.group(data, d => d.date.getFullYear());
    
    const container = svg
      .attr('width', 53 * cellSize + margin.left + margin.right)
      .attr('height', years.size * yearHeight + margin.top + margin.bottom);

    const g = container
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Color scale
    const colorScale = d3.scaleSequential(d3.interpolateGreens)
      .domain([0, 4]);

    years.forEach((yearData, year) => {
      const yearIndex = Array.from(years.keys()).indexOf(year);
      const yearGroup = g.append('g')
        .attr('transform', `translate(0, ${yearIndex * yearHeight})`);

      // Year label
      yearGroup.append('text')
        .attr('x', -10)
        .attr('y', -5)
        .attr('text-anchor', 'end')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(year);

      // Day rectangles
      yearGroup.selectAll('rect')
        .data(yearData)
        .enter()
        .append('rect')
        .attr('x', d => d3.timeWeek.count(d3.timeYear(d.date), d.date) * cellSize)
        .attr('y', d => d.date.getDay() * cellSize)
        .attr('width', cellSize - 1)
        .attr('height', cellSize - 1)
        .attr('fill', d => d.level === 0 ? '#ebedf0' : colorScale(d.level))
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .append('title')
        .text(d => `${d.date.toLocaleDateString('fr-FR')}: ${d.count} visites`);

      // Month labels
      const months = d3.timeMonths(d3.timeYear(yearData[0].date), d3.timeYear.offset(d3.timeYear(yearData[0].date), 1));
      yearGroup.selectAll('.month-label')
        .data(months)
        .enter()
        .append('text')
        .attr('class', 'month-label')
        .attr('x', d => d3.timeWeek.count(d3.timeYear(d), d) * cellSize + cellSize / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .text(d => d3.timeFormat('%b')(d));

      // Day labels
      const dayLabels = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
      yearGroup.selectAll('.day-label')
        .data(dayLabels)
        .enter()
        .append('text')
        .attr('class', 'day-label')
        .attr('x', -5)
        .attr('y', (d, i) => i * cellSize + cellSize / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '10px')
        .text(d => d);
    });

    // Legend
    const legend = g.append('g')
      .attr('transform', `translate(0, ${years.size * yearHeight + 20})`);

    legend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('font-size', '12px')
      .text('Moins');

    const legendScale = [0, 1, 2, 3, 4];
    legend.selectAll('.legend-cell')
      .data(legendScale)
      .enter()
      .append('rect')
      .attr('class', 'legend-cell')
      .attr('x', (d, i) => 40 + i * (cellSize + 2))
      .attr('y', -10)
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('fill', d => d === 0 ? '#ebedf0' : colorScale(d))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);

    legend.append('text')
      .attr('x', 40 + 5 * (cellSize + 2) + 10)
      .attr('y', 0)
      .attr('font-size', '12px')
      .text('Plus');

  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Activité Quotidienne</h3>
        <p className="text-sm text-muted-foreground">
          Chaque carré représente une journée. Plus la couleur est foncée, plus l'activité a été importante.
        </p>
      </div>
      <div className="overflow-x-auto">
        <svg id="calendar-heatmap"></svg>
      </div>
    </div>
  );
};