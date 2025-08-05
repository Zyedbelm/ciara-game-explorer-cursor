import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface JourneyFlowChartProps {
  cityId?: string;
  timeRange: string;
}

interface FlowNode {
  id: string;
  name: string;
  type: 'entry' | 'step' | 'exit';
  value: number;
  x: number;
  y: number;
}

interface FlowLink {
  source: string;
  target: string;
  value: number;
}

export const JourneyFlowChart: React.FC<JourneyFlowChartProps> = ({ cityId, timeRange }) => {
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [links, setLinks] = useState<FlowLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const now = new Date();
        const daysBack = timeRange === '1y' ? 365 : timeRange === '90d' ? 90 : 30;
        const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

        // Fetch journey progress with steps
        let progressQuery = supabase
          .from('user_journey_progress')
          .select(`
            *,
            journey:journeys!inner(
              id,
              name,
              city_id,
              journey_steps:journey_steps(
                step_order,
                step:steps(id, name)
              )
            )
          `)
          .gte('started_at', startDate.toISOString());

        if (cityId) {
          progressQuery = progressQuery.eq('journey.city_id', cityId);
        }

        const { data: progress } = await progressQuery;

        // Fetch step completions to understand flow
        let completionsQuery = supabase
          .from('step_completions')
          .select(`
            *,
            step:steps!inner(id, name, city_id)
          `)
          .gte('completed_at', startDate.toISOString());

        if (cityId) {
          completionsQuery = completionsQuery.eq('step.city_id', cityId);
        }

        const { data: completions } = await completionsQuery;

        // Process data to create flow
        const stepCounts = new Map<string, number>();
        const transitions = new Map<string, number>();
        const entryPoints = new Map<string, number>();
        const exitPoints = new Map<string, number>();

        // Count step completions
        completions?.forEach(completion => {
          const stepId = completion.step.id;
          const stepName = completion.step.name;
          stepCounts.set(`${stepId}|${stepName}`, (stepCounts.get(`${stepId}|${stepName}`) || 0) + 1);
        });

        // Analyze journey flows
        progress?.forEach(prog => {
          const journeySteps = prog.journey?.journey_steps || [];
          journeySteps.sort((a, b) => a.step_order - b.step_order);

          if (journeySteps.length > 0) {
            // Entry point
            const firstStep = journeySteps[0];
            if (firstStep?.step) {
              const entryKey = `entry|Début de parcours`;
              const firstStepKey = `${firstStep.step.id}|${firstStep.step.name}`;
              entryPoints.set(entryKey, (entryPoints.get(entryKey) || 0) + 1);
              transitions.set(`${entryKey}->${firstStepKey}`, (transitions.get(`${entryKey}->${firstStepKey}`) || 0) + 1);
            }

            // Step-to-step transitions
            for (let i = 0; i < journeySteps.length - 1; i++) {
              const currentStep = journeySteps[i];
              const nextStep = journeySteps[i + 1];
              
              if (currentStep?.step && nextStep?.step) {
                const currentKey = `${currentStep.step.id}|${currentStep.step.name}`;
                const nextKey = `${nextStep.step.id}|${nextStep.step.name}`;
                const transitionKey = `${currentKey}->${nextKey}`;
                transitions.set(transitionKey, (transitions.get(transitionKey) || 0) + 1);
              }
            }

            // Exit point
            if (prog.is_completed && journeySteps.length > 0) {
              const lastStep = journeySteps[journeySteps.length - 1];
              if (lastStep?.step) {
                const lastStepKey = `${lastStep.step.id}|${lastStep.step.name}`;
                const exitKey = `exit|Parcours terminé`;
                exitPoints.set(exitKey, (exitPoints.get(exitKey) || 0) + 1);
                transitions.set(`${lastStepKey}->${exitKey}`, (transitions.get(`${lastStepKey}->${exitKey}`) || 0) + 1);
              }
            }
          }
        });

        // Create nodes
        const flowNodes: FlowNode[] = [];
        let yPosition = 50;

        // Entry nodes
        entryPoints.forEach((count, key) => {
          const [id, name] = key.split('|');
          flowNodes.push({
            id: key,
            name,
            type: 'entry',
            value: count,
            x: 50,
            y: yPosition
          });
          yPosition += 80;
        });

        // Step nodes
        const stepArray = Array.from(stepCounts.entries())
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10); // Top 10 steps

        yPosition = 50;
        stepArray.forEach(([key, count]) => {
          const [id, name] = key.split('|');
          flowNodes.push({
            id: key,
            name,
            type: 'step',
            value: count,
            x: 250,
            y: yPosition
          });
          yPosition += 80;
        });

        // Exit nodes
        yPosition = 50;
        exitPoints.forEach((count, key) => {
          const [id, name] = key.split('|');
          flowNodes.push({
            id: key,
            name,
            type: 'exit',
            value: count,
            x: 450,
            y: yPosition
          });
          yPosition += 80;
        });

        // Create links
        const flowLinks: FlowLink[] = [];
        transitions.forEach((count, transitionKey) => {
          const [source, target] = transitionKey.split('->');
          if (flowNodes.find(n => n.id === source) && flowNodes.find(n => n.id === target)) {
            flowLinks.push({
              source,
              target,
              value: count
            });
          }
        });

        setNodes(flowNodes);
        setLinks(flowLinks);
      } catch (error) {
        console.error('Error fetching flow data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cityId, timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const maxValue = Math.max(...nodes.map(n => n.value));
  const getNodeSize = (value: number) => Math.max(20, (value / maxValue) * 100);
  const getLinkWidth = (value: number) => Math.max(2, (value / maxValue) * 20);

  return (
    <div className="w-full space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Diagramme de Flux des Parcours Utilisateurs</h3>
        <p className="text-sm text-muted-foreground">
          Visualisation style Sankey des chemins suivis par les utilisateurs dans leurs parcours.
          Plus les liens sont épais, plus le flux est important.
        </p>
      </div>

      {/* SVG Flow Diagram */}
      <div className="border rounded-lg p-4 bg-background">
        <svg width="600" height="400" className="w-full">
          {/* Links */}
          {links.map((link, index) => {
            const sourceNode = nodes.find(n => n.id === link.source);
            const targetNode = nodes.find(n => n.id === link.target);
            
            if (!sourceNode || !targetNode) return null;

            const strokeWidth = getLinkWidth(link.value);
            
            return (
              <g key={index}>
                <path
                  d={`M ${sourceNode.x + getNodeSize(sourceNode.value)/2} ${sourceNode.y + getNodeSize(sourceNode.value)/2}
                      C ${(sourceNode.x + targetNode.x) / 2} ${sourceNode.y + getNodeSize(sourceNode.value)/2}
                        ${(sourceNode.x + targetNode.x) / 2} ${targetNode.y + getNodeSize(targetNode.value)/2}
                        ${targetNode.x - getNodeSize(targetNode.value)/2} ${targetNode.y + getNodeSize(targetNode.value)/2}`}
                  stroke="hsl(var(--primary))"
                  strokeWidth={strokeWidth}
                  fill="none"
                  opacity={0.6}
                />
                <text
                  x={(sourceNode.x + targetNode.x) / 2}
                  y={(sourceNode.y + targetNode.y) / 2 - 10}
                  textAnchor="middle"
                  fontSize="10"
                  fill="hsl(var(--foreground))"
                >
                  {link.value}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node, index) => {
            const size = getNodeSize(node.value);
            const color = node.type === 'entry' ? 'hsl(var(--primary))' :
                         node.type === 'exit' ? 'hsl(var(--destructive))' :
                         'hsl(var(--secondary))';
            
            return (
              <g key={index}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={size / 2}
                  fill={color}
                  opacity={0.8}
                  stroke="white"
                  strokeWidth={2}
                />
                <text
                  x={node.x}
                  y={node.y + size / 2 + 15}
                  textAnchor="middle"
                  fontSize="10"
                  fill="hsl(var(--foreground))"
                  className="font-medium"
                >
                  {node.name.length > 20 ? node.name.substring(0, 20) + '...' : node.name}
                </text>
                <text
                  x={node.x}
                  y={node.y + size / 2 + 28}
                  textAnchor="middle"
                  fontSize="8"
                  fill="hsl(var(--muted-foreground))"
                >
                  {node.value} passages
                </text>
              </g>
            );
          })}

          {/* Column Labels */}
          <text x="50" y="30" textAnchor="middle" fontSize="12" fontWeight="bold" fill="hsl(var(--foreground))">
            Points d'Entrée
          </text>
          <text x="250" y="30" textAnchor="middle" fontSize="12" fontWeight="bold" fill="hsl(var(--foreground))">
            Étapes Populaires
          </text>
          <text x="450" y="30" textAnchor="middle" fontSize="12" fontWeight="bold" fill="hsl(var(--foreground))">
            Points de Sortie
          </text>
        </svg>
      </div>

      {/* Flow Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold mb-2">Entrées Principales</h4>
          <div className="space-y-2">
            {nodes
              .filter(n => n.type === 'entry')
              .sort((a, b) => b.value - a.value)
              .slice(0, 3)
              .map((node, index) => (
                <div key={node.id} className="flex justify-between text-sm">
                  <span>{node.name}</span>
                  <span className="font-medium">{node.value}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold mb-2">Étapes Populaires</h4>
          <div className="space-y-2">
            {nodes
              .filter(n => n.type === 'step')
              .sort((a, b) => b.value - a.value)
              .slice(0, 3)
              .map((node, index) => (
                <div key={node.id} className="flex justify-between text-sm">
                  <span className="truncate">{node.name}</span>
                  <span className="font-medium">{node.value}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold mb-2">Taux de Conversion</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Taux de complétion</span>
              <span className="font-medium">
                {nodes.find(n => n.type === 'exit') && nodes.find(n => n.type === 'entry') ?
                  Math.round((nodes.find(n => n.type === 'exit')!.value / nodes.find(n => n.type === 'entry')!.value) * 100) :
                  0}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Abandon moyen</span>
              <span className="font-medium">
                {100 - (nodes.find(n => n.type === 'exit') && nodes.find(n => n.type === 'entry') ?
                  Math.round((nodes.find(n => n.type === 'exit')!.value / nodes.find(n => n.type === 'entry')!.value) * 100) :
                  0)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Flux principal</span>
              <span className="font-medium">
                {links.length > 0 ? Math.max(...links.map(l => l.value)) : 0} utilisateurs
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};