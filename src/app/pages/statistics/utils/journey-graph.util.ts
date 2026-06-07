import { JourneyTreeNode } from '../../../services/statistics.service';

export interface JourneyGraphNode {
  id: string;
  label: string;
  data: {
    page: string;
    label: string;
    displayLabel: string;
    count: number;
    leads: number;
    conversionRate: number;
    isLead: boolean;
    leadType?: string;
    leadSubject?: string;
    hasChildren: boolean;
    collapsed: boolean;
    pathKey: string;
  };
}

export interface JourneyGraphLink {
  id: string;
  source: string;
  target: string;
  data?: {
    pathKey: string;
  };
}

export interface ParsedLeadPage {
  type: string;
  subject: string;
}

/** Must stay in sync with kleo-backend/utils/customerJourneys.js */
export const LEAD_PAGE_RE = /^__KLEO_JOURNEY_LEAD__\|([^|]*)\|([^|]*)$/;

export function isLeadPage(page: string): boolean {
  if (!page) {
    return false;
  }
  if (page === 'LEAD') {
    return true;
  }
  return LEAD_PAGE_RE.test(page);
}

export function parseLeadPage(page: string): ParsedLeadPage | null {
  if (!page) {
    return null;
  }
  if (page === 'LEAD') {
    return { type: 'lead', subject: '' };
  }
  const match = LEAD_PAGE_RE.exec(page);
  if (!match) {
    return null;
  }
  try {
    return {
      type: decodeURIComponent(match[1]),
      subject: decodeURIComponent(match[2]),
    };
  } catch {
    return null;
  }
}

export const MAX_NODE_LABEL_LENGTH = 25;

export function pageToLabel(page: string): string {
  const lead = parseLeadPage(page);
  if (lead) {
    return lead.type || 'Lead';
  }
  return page ?? '';
}

export function truncateLabel(
  label: string,
  maxLength = MAX_NODE_LABEL_LENGTH,
): string {
  const text = (label ?? '').trim();
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}…`;
}

export function isLabelTruncated(
  label: string,
  maxLength = MAX_NODE_LABEL_LENGTH,
): boolean {
  return (label ?? '').trim().length > maxLength;
}

export function sourceToLabel(source: string): string {
  if (!source) {
    return 'Direct';
  }
  return source.charAt(0).toUpperCase() + source.slice(1);
}

export function normalizeJourneyRoots(
  tree: JourneyTreeNode | JourneyTreeNode[] | null | undefined,
): JourneyTreeNode[] {
  if (tree == null) {
    return [];
  }
  return Array.isArray(tree) ? tree : [tree];
}

export function buildJourneyGraph(
  source: string,
  tree: JourneyTreeNode | JourneyTreeNode[],
  collapsedIds: Set<string>,
): { nodes: JourneyGraphNode[]; links: JourneyGraphLink[] } {
  const nodes: JourneyGraphNode[] = [];
  const links: JourneyGraphLink[] = [];
  const roots = normalizeJourneyRoots(tree);

  function walk(
    node: JourneyTreeNode,
    parentId: string | null,
    pathSegments: string[],
  ) {
    const page = node.page || '/';
    const pathSegmentsNext = [...pathSegments, page];
    const pathKey = `${source}>${pathSegmentsNext.join('>')}`;
    const id = pathKey;
    const hasChildren = (node.children?.length ?? 0) > 0;
    const collapsed = collapsedIds.has(id);
    const count = node.count ?? 0;
    const leads = node.leads ?? 0;
    const leadDetails = parseLeadPage(page);
    const isLead = isLeadPage(page);
    const label = pageToLabel(page);
    const displayLabel = truncateLabel(label);

    nodes.push({
      id,
      label: displayLabel,
      data: {
        page,
        label,
        displayLabel,
        count,
        leads,
        conversionRate: count > 0 ? leads / count : 0,
        isLead,
        leadType: leadDetails?.type,
        leadSubject: leadDetails?.subject,
        hasChildren,
        collapsed,
        pathKey,
      },
    });

    if (parentId) {
      links.push({
        id: `${parentId}__${id}`,
        source: parentId,
        target: id,
        data: { pathKey },
      });
    }

    if (hasChildren && !collapsed) {
      node.children.forEach((child: JourneyTreeNode) =>
        walk(child, id, pathSegmentsNext),
      );
    }
  }

  roots.forEach((root) => walk(root, null, []));
  return { nodes, links };
}

export function isOnSelectedPath(
  pathKey: string,
  selectedPathKey: string | null,
): boolean {
  if (!selectedPathKey) {
    return true;
  }
  return (
    selectedPathKey === pathKey || selectedPathKey.startsWith(`${pathKey}>`)
  );
}

export function buildTooltip(node: JourneyGraphNode['data']): string {
  if (node.isLead) {
    const lines = ['Lead'];
    if (node.leadType) {
      lines.push(`Type: ${node.leadType}`);
    }
    lines.push(
      `Visitors: ${node.count}`,
      `Conversions: ${node.leads}`,
      `Conversion Rate: ${(node.conversionRate * 100).toFixed(1)}%`,
    );
    return lines.join('\n');
  }

  return [
    `Page: ${node.label}`,
    `Visitors: ${node.count}`,
    `Conversions: ${node.leads}`,
    `Conversion Rate: ${(node.conversionRate * 100).toFixed(1)}%`,
  ].join('\n');
}
