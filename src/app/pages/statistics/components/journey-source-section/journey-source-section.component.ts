import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  DagreNodesOnlySettings,
  GraphComponent,
  LayoutService,
  Orientation,
} from '@swimlane/ngx-graph';
import { curveLinear } from 'd3-shape';
import { JourneySource } from '../../../../services/statistics.service';
import { JourneyFaceEdgeLayout } from '../../utils/journey-face-edge.layout';
import {
  buildJourneyGraph,
  buildTooltip,
  isLabelTruncated,
  isOnSelectedPath,
  JourneyGraphLink,
  JourneyGraphNode,
  normalizeJourneyRoots,
  sourceToLabel,
} from '../../utils/journey-graph.util';

@Component({
  selector: 'app-journey-source-section',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTooltipModule, GraphComponent],
  templateUrl: './journey-source-section.component.html',
  styleUrls: ['./journey-source-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LayoutService],
})
export class JourneySourceSectionComponent implements OnChanges {
  @Input({ required: true }) sourceData!: JourneySource;

  graphNodes: JourneyGraphNode[] = [];
  graphLinks: JourneyGraphLink[] = [];
  collapsedIds = new Set<string>();
  selectedPathKey: string | null = null;
  hasHighlight = false;

  readonly curve = curveLinear;
  /** Face-anchored orthogonal edges (source right → target left in LR layout). */
  readonly journeyLayout = new JourneyFaceEdgeLayout();
  readonly layoutSettings: DagreNodesOnlySettings = {
    orientation: Orientation.LEFT_TO_RIGHT,
    marginX: 80,
    marginY: 40,
    rankPadding: 100,
    ranker: 'tight-tree',
    nodePadding: 56,
    curveDistance: 24,
    edgePadding: 10,
    /** Journey trees have at most one edge per source→target pair. */
    multigraph: false,
  };
  graphView: [number, number] = [900, 320];

  constructor(private cdr: ChangeDetectorRef) {
    this.journeyLayout.settings = this.layoutSettings;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sourceData']) {
      this.collapsedIds.clear();
      this.selectedPathKey = null;
      this.hasHighlight = false;
      this.rebuildGraph();
    }
  }

  get sourceLabel(): string {
    return sourceToLabel(this.sourceData?.source ?? '');
  }

  get conversionRateLabel(): string {
    return `${(this.sourceData.conversionRate * 100).toFixed(1)}%`;
  }

  rebuildGraph(): void {
    if (normalizeJourneyRoots(this.sourceData?.tree).length === 0) {
      this.graphNodes = [];
      this.graphLinks = [];
      return;
    }

    const { nodes, links } = buildJourneyGraph(
      this.sourceData.source,
      this.sourceData.tree,
      this.collapsedIds,
    );
    this.graphNodes = nodes;
    this.graphLinks = links;
    this.updateGraphView();
    this.cdr.markForCheck();
  }

  updateGraphView(): void {
    const width = Math.max(900, this.graphNodes.length * 160);
    const depthEstimate = Math.ceil(Math.log2(this.graphNodes.length + 1)) + 1;
    const height = Math.max(280, depthEstimate * 120);
    this.graphView = [width, height];
  }

  toggleCollapse(node: JourneyGraphNode, event: MouseEvent): void {
    event.stopPropagation();
    if (!node.data.hasChildren) {
      return;
    }
    if (this.collapsedIds.has(node.id)) {
      this.collapsedIds.delete(node.id);
    } else {
      this.collapsedIds.add(node.id);
    }
    this.rebuildGraph();
  }

  onNodeClick(node: JourneyGraphNode, event: MouseEvent): void {
    event.stopPropagation();
    if (this.selectedPathKey === node.data.pathKey) {
      this.selectedPathKey = null;
      this.hasHighlight = false;
    } else {
      this.selectedPathKey = node.data.pathKey;
      this.hasHighlight = true;
    }
    this.cdr.markForCheck();
  }

  nodeOpacity(node: JourneyGraphNode): number {
    if (!this.hasHighlight) {
      return 1;
    }
    return isOnSelectedPath(node.data.pathKey, this.selectedPathKey) ? 1 : 0.2;
  }

  linkOpacity(link: JourneyGraphLink): number {
    if (!this.hasHighlight || !this.selectedPathKey) {
      return 1;
    }
    const targetPath = link.data?.pathKey ?? '';
    return isOnSelectedPath(targetPath, this.selectedPathKey) ? 1 : 0.2;
  }

  linkHighlighted(link: JourneyGraphLink): boolean {
    if (!this.hasHighlight || !this.selectedPathKey) {
      return false;
    }
    const targetPath = link.data?.pathKey ?? '';
    return isOnSelectedPath(targetPath, this.selectedPathKey);
  }

  nodeHighlighted(node: JourneyGraphNode): boolean {
    if (!this.hasHighlight || !this.selectedPathKey) {
      return false;
    }
    return isOnSelectedPath(node.data.pathKey, this.selectedPathKey);
  }

  tooltipFor(node: JourneyGraphNode): string {
    return buildTooltip(node.data);
  }

  labelTitle(node: JourneyGraphNode): string | null {
    return isLabelTruncated(node.data.label) ? node.data.label : null;
  }

  collapseIcon(node: JourneyGraphNode): string {
    return node.data.collapsed ? '▶' : '▼';
  }
}
