
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TopologyData, DeviceType } from '../types';

interface TopologyMapProps {
  data: TopologyData;
}

const TopologyMap: React.FC<TopologyMapProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    }
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || data.nodes.length === 0 || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => g.attr("transform", event.transform));

    svg.call(zoom as any);

    const simulation = d3.forceSimulation(data.nodes as any)
      .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2));

    // Links
    const link = g.append("g")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke", (d: any) => d.isConfiguring ? "#60a5fa" : "#334155")
      .attr("stroke-width", (d: any) => d.isConfiguring ? 3 : 1)
      .attr("stroke-dasharray", (d: any) => d.isConfiguring ? "5,5" : "none")
      .attr("class", (d: any) => d.isConfiguring ? "animate-pulse" : "");

    // Link Labels
    const linkLabel = g.append("g")
      .selectAll("text")
      .data(data.links)
      .join("text")
      .attr("font-size", "8px")
      .attr("fill", "#64748b")
      .attr("text-anchor", "middle")
      .text((d: any) => d.label);

    // Nodes
    const node = g.append("g")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .call(d3.drag<SVGGElement, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    // Node Circles/Glow
    node.append("circle")
      .attr("r", 25)
      .attr("fill", "#0f172a")
      .attr("stroke", (d: any) => {
        if (d.status === 'configured') return "#60a5fa";
        if (d.status === 'active') return "#10b981";
        return "#334155";
      })
      .attr("stroke-width", 2)
      .attr("filter", (d: any) => d.status === 'configured' ? "drop-shadow(0 0 8px #3b82f6)" : "none");

    // Node Icons
    node.append("text")
      .attr("class", "fas")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-family", '"Font Awesome 6 Free"')
      .attr("font-weight", "900")
      .attr("font-size", "14px")
      .attr("fill", (d: any) => {
        if (d.status === 'configured') return "#60a5fa";
        if (d.status === 'active') return "#10b981";
        return "#94a3b8";
      })
      .text((d: any) => {
        switch(d.type) {
          case DeviceType.SWITCH: return "\uf233"; // server
          case DeviceType.FIREWALL: return "\uf3ed"; // shield
          case DeviceType.WIFI: return "\uf1eb"; // wifi
          case DeviceType.MODEM: return "\uf519"; // tower-broadcast
          default: return "\uf2db"; // microchip
        }
      });

    // Node Labels
    node.append("text")
      .attr("dy", 40)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .attr("fill", "#f8fafc")
      .text((d: any) => d.name);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      linkLabel
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.f2 = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => { simulation.stop(); };
  }, [data, dimensions]);

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl flex flex-col h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <i className="fas fa-project-diagram text-blue-400"></i> Visual Topology Map
        </h3>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
           <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Configured</span>
           <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Active</span>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 bg-slate-950/50 rounded-xl overflow-hidden relative cursor-grab active:cursor-grabbing border border-slate-800">
        <svg ref={svgRef} width="100%" height="100%" />
        {data.nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 opacity-40">
            <i className="fas fa-project-diagram text-5xl mb-4"></i>
            <p className="text-sm italic">Generate a config or scan neighbors to visualize topology.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopologyMap;
