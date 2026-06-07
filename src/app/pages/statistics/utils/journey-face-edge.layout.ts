import {
  DagreNodesOnlyLayout,
  dagreDragPolyline,
  Edge,
  Graph,
  rankOrderAxesFromDagreRankdir,
} from '@swimlane/ngx-graph';
import type { DagreNodesOnlySettings } from '@swimlane/ngx-graph';

/** graphlib edge label name when not using multigraph (matches ngx-graph internals). */
const DEFAULT_EDGE_NAME = '\x00';
const EDGE_KEY_DELIM = '\x01';

function mergedSettings(
  layout: JourneyFaceEdgeLayout,
): DagreNodesOnlySettings {
  return Object.assign(
    {},
    layout.defaultSettings,
    layout.settings,
  ) as DagreNodesOnlySettings;
}

/** graphlib `_edgeLabels` key — must match dagre `setEdge` name for ngx-graph tick to read points. */
function dagreEdgeLabelId(
  edge: Edge,
  multigraph: boolean,
): string {
  const source =
    typeof edge.source === 'string' ? edge.source : String(edge.source);
  const target =
    typeof edge.target === 'string' ? edge.target : String(edge.target);
  const name =
    multigraph && edge.id ? String(edge.id) : DEFAULT_EDGE_NAME;
  return `${source}${EDGE_KEY_DELIM}${target}${EDGE_KEY_DELIM}${name}`;
}

/**
 * Dagre layout for journey trees with edges anchored on node faces (LR: exit right,
 * enter left) via orthogonal segments — never center-to-center fallback routing.
 */
export class JourneyFaceEdgeLayout extends DagreNodesOnlyLayout {
  override updateEdge(graph: Graph, edge: Edge): Graph {
    const sourceNode = graph.nodes.find((n) => n.id === edge.source);
    const targetNode = graph.nodes.find((n) => n.id === edge.target);
    if (!sourceNode?.position || !targetNode?.position) {
      return graph;
    }

    const settings = mergedSettings(this);
    const axes = rankOrderAxesFromDagreRankdir(settings.orientation);
    const curveDistance =
      settings.curveDistance ?? this.defaultSettings.curveDistance ?? 20;

    edge.points = dagreDragPolyline(
      sourceNode,
      targetNode,
      axes,
      curveDistance,
      'orthogonal',
    );

    this.syncEdgeLabelPoints(graph, edge);

    return graph;
  }

  private syncEdgeLabelPoints(graph: Graph, edge: Edge): void {
    if (!graph.edgeLabels || edge.points == null) {
      return;
    }

    const settings = mergedSettings(this);
    const multigraph = !!settings.multigraph;
    const edgeLabelId = dagreEdgeLabelId(edge, multigraph);
    const matchingEdgeLabel = graph.edgeLabels[edgeLabelId];

    if (matchingEdgeLabel) {
      matchingEdgeLabel.points = edge.points;
      return;
    }

    // Fallback: scan labels when graphlib key shape differs (defensive).
    if (typeof graph.edgeLabels === 'object') {
      const labels = Array.isArray(graph.edgeLabels)
        ? graph.edgeLabels
        : Object.values(graph.edgeLabels);
      for (const label of labels) {
        const labelSource =
          typeof label?.source === 'string'
            ? label.source
            : label?.source?.id;
        const labelTarget =
          typeof label?.target === 'string'
            ? label.target
            : label?.target?.id;
        if (labelSource === edge.source && labelTarget === edge.target) {
          label.points = edge.points;
        }
      }
    }
  }
}
