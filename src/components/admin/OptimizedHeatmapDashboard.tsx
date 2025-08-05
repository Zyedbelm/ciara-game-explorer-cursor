import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, TrendingUp, Clock, Users, RefreshCw } from 'lucide-react';
import { useOptimizedGeographicAnalytics } from '@/hooks/useOptimizedGeographicAnalytics';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SimpleHeatmapMap from '@/components/maps/SimpleHeatmapMap';

interface OptimizedHeatmapDashboardProps {
  cityId?: string;
  timeRange?: string;
}

/**
 * Optimized Heatmap Dashboard with stable props and minimal re-renders
 */
export const OptimizedHeatmapDashboard: React.FC<OptimizedHeatmapDashboardProps> = React.memo(({ 
  cityId: propCityId, 
  timeRange: propTimeRange 
}) => {
  const [timeRange, setTimeRange] = useState(propTimeRange || '30d');
  
  // Ultra-stable references to prevent cascade re-renders
  const stableCityId = useMemo(() => propCityId, [propCityId]);
  const stableTimeRange = useMemo(() => timeRange, [timeRange]);
  
  const { analytics, loading, error, refetch, hasData } = useOptimizedGeographicAnalytics(stableCityId, stableTimeRange);

  // Memoized computed values
  const shouldShowHeatmap = useMemo(() => 
    stableCityId && hasData, 
    [stableCityId, hasData]
  );
  
  const hasNoDataForCity = useMemo(() => 
    stableCityId && !hasData,
    [stableCityId, hasData]
  );

  const topHours = useMemo(() => {
    if (!analytics?.visitDistribution.hourly) return [];
    return Object.entries(analytics.visitDistribution.hourly)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: `${hour}h`, count }));
  }, [analytics?.visitDistribution.hourly]);

  const topDays = useMemo(() => {
    if (!analytics?.visitDistribution.daily) return [];
    return Object.entries(analytics.visitDistribution.daily)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day, count]) => ({ day, count }));
  }, [analytics?.visitDistribution.daily]);

  // Stable callbacks
  const handleTimeRangeChange = useCallback((value: string) => {
    setTimeRange(value);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Stable heatmap data
  const stableHeatmapData = useMemo(() => 
    analytics?.heatmapData || [], 
    [analytics?.heatmapData]
  );

  console.log('🗺️ OptimizedHeatmapDashboard render - City:', stableCityId, 'Range:', stableTimeRange, 'HasData:', hasData);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geographic Analysis</CardTitle>
          <CardDescription>Loading geographic data...</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geographic Analysis</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
          <Button onClick={handleRefresh} className="mt-4">Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Interactive Geographic Analysis</h2>
          <p className="text-muted-foreground">Tourist activity visualization by area</p>
        </div>
        <div className="flex gap-4">
          <Select value={stableTimeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">1 year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hotspots</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stableHeatmapData.length}</div>
            <p className="text-xs text-muted-foreground">Activity zones</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Popular Clusters</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.stepClusters.length || 0}</div>
            <p className="text-xs text-muted-foreground">Step groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Popular Routes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.popularRoutes.length || 0}</div>
            <p className="text-xs text-muted-foreground">Identified connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topHours[0]?.hour || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Activity peak</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Map */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Heatmap</CardTitle>
          <CardDescription>
            Visualization of high tourist activity areas
            {stableCityId && " - City filtered view"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!stableCityId ? (
            <div className="h-96 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-muted">
              <div className="text-center max-w-md">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a City</h3>
                <p className="text-muted-foreground">
                  To display the interactive heatmap, please select a specific city in the geographic filters above.
                </p>
              </div>
            </div>
          ) : hasNoDataForCity ? (
            <div className="h-96 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-muted">
              <div className="text-center max-w-md">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                <p className="text-muted-foreground">
                  No tourist activity has been recorded for this city in the selected time period.
                </p>
                <Button onClick={handleRefresh} className="mt-4" variant="outline">
                  Refresh Data
                </Button>
              </div>
            </div>
          ) : (
            <SimpleHeatmapMap 
              heatmapData={stableHeatmapData}
              center={{ lat: 46.2276, lng: 7.3594 }}
              zoom={13}
              className="w-full h-[400px]"
            />
          )}
        </CardContent>
      </Card>

      {/* Distribution Analysis */}
      {shouldShowHeatmap && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Distribution</CardTitle>
              <CardDescription>Visit distribution by hour of day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topHours.map((item, index) => (
                  <div key={item.hour} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{item.hour}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(item.count / Math.max(...topHours.map(h => h.count))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Distribution</CardTitle>
              <CardDescription>Visit distribution by day of week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topDays.map((item, index) => (
                  <div key={item.day} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <span className="font-medium capitalize">{item.day}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(item.count / Math.max(...topDays.map(d => d.count))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Popular Locations */}
      {shouldShowHeatmap && (
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Steps</CardTitle>
            <CardDescription>Steps ranked by completion count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stableHeatmapData
                .sort((a, b) => b.completions - a.completions)
                .slice(0, 5)
                .map((point, index) => (
                  <div key={point.stepId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={index < 3 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{point.stepName}</p>
                        <p className="text-sm text-muted-foreground">
                          {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{point.completions}</p>
                      <p className="text-sm text-muted-foreground">completions</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.cityId === nextProps.cityId &&
    prevProps.timeRange === nextProps.timeRange
  );
});

OptimizedHeatmapDashboard.displayName = 'OptimizedHeatmapDashboard';