import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { cn } from '../../lib/utils';
import { 
  useTopologyNodes, 
  useNetworkConnections, 
  useVLANConfigurations,
  useUpdateTopologyNode,
  useCreateTopologyNode,
  useDeleteTopologyNode
} from '../../hooks/api/useTopology';
import { TopologyNode, NetworkConnection, VLANConfiguration, TopologyFilter } from '../../types/topology';

interface NodePosition {
  x: number;
  y: number;
}

interface NodeIconProps {
  nodeType: TopologyNode['node_type'];
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const NodeIcon: React.FC<NodeIconProps> = ({ nodeType, isOnline, size = 'md' }) => {
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  const iconClass = cn(iconSize, isOnline ? 'text-emerald-400' : 'text-red-400');

  const iconMap = {
    'wan_gateway': Icons.Globe,
    'router': Icons.Router,
    'switch': Icons.Network,
    'access_point': Icons.Wifi,
    'server': Icons.Server,
    'client': Icons.Monitor,
    'iot_device': Icons.Home,
    'gaming_device': Icons.Gamepad2
  };

  const IconComponent = iconMap[nodeType] || Icons.HelpCircle;
  
  return <IconComponent className={iconClass} />;
};

interface TopologyNodeComponentProps {
  node: TopologyNode;
  connections: NetworkConnection[];
  isSelected: boolean;
  onNodeClick: (node: TopologyNode) => void;
  onNodeDrag: (nodeId: string, position: NodePosition) => void;
  vlanColors: Record<number, string>;
}

const TopologyNodeComponent: React.FC<TopologyNodeComponentProps> = ({
  node,
  connections,
  isSelected,
  onNodeClick,
  onNodeDrag,
  vlanColors
}) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    onNodeDrag(node.id, {
      x: node.position_x + info.offset.x,
      y: node.position_y + info.offset.y
    });
  };

  const vlanColor = node.vlan_id ? vlanColors[node.vlan_id] || '#48CAE4' : '#48CAE4';
  
  // Count connections
  const connectionCount = connections.filter(c => 
    c.source_node_id === node.id || c.target_node_id === node.id
  ).length;

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: 'absolute',
        left: node.position_x,
        top: node.position_y,
        transform: 'translate(-50%, -50%)'
      }}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "z-50"
      )}
    >
      <div
        onClick={() => onNodeClick(node)}
        className={cn(
          "relative p-4 rounded-2xl border backdrop-blur-md transition-all duration-300",
          "flex flex-col items-center gap-2 min-w-[100px]",
          isSelected 
            ? "bg-emerald-500/20 border-emerald-500/40 shadow-lg shadow-emerald-500/25" 
            : "bg-black/20 border-white/10 hover:border-white/20 hover:bg-black/30"
        )}
        style={{
          borderColor: isSelected ? vlanColor : undefined,
          boxShadow: isSelected ? `0 0 20px ${vlanColor}40` : undefined
        }}
      >
        {/* Status Indicator */}
        <div className={cn(
          "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900",
          node.is_online ? "bg-emerald-400" : "bg-red-400"
        )} />

        {/* VLAN Badge */}
        {node.vlan_id && (
          <div 
            className="absolute -top-2 -left-2 px-2 py-1 rounded-full text-xs font-bold border"
            style={{
              backgroundColor: `${vlanColor}20`,
              borderColor: `${vlanColor}60`,
              color: vlanColor
            }}
          >
            {node.vlan_id}
          </div>
        )}

        {/* Device Icon */}
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center border",
          node.is_online 
            ? "bg-emerald-500/20 border-emerald-500/30" 
            : "bg-red-500/20 border-red-500/30"
        )}>
          <NodeIcon nodeType={node.node_type} isOnline={node.is_online} size="lg" />
        </div>

        {/* Node Info */}
        <div className="text-center">
          <h4 className="text-white font-medium text-sm truncate max-w-[90px]">
            {node.node_name}
          </h4>
          <p className="text-white/60 text-xs">
            {node.ip_address || 'No IP'}
          </p>
        </div>

        {/* Connection Count */}
        {connectionCount > 0 && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
            <span className="text-blue-400 text-xs font-bold">{connectionCount}</span>
          </div>
        )}

        {/* Performance Indicators */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1">
          {node.ping_latency_ms > 100 && (
            <div className="w-2 h-2 bg-orange-400 rounded-full" title={`Ping: ${node.ping_latency_ms}ms`} />
          )}
          {node.bandwidth_usage_mbps > 100 && (
            <div className="w-2 h-2 bg-purple-400 rounded-full" title={`Bandwidth: ${node.bandwidth_usage_mbps} Mbps`} />
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface ConnectionLineProps {
  connection: NetworkConnection;
  sourceNode: TopologyNode;
  targetNode: TopologyNode;
  onConnectionClick: (connection: NetworkConnection) => void;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({
  connection,
  sourceNode,
  targetNode,
  onConnectionClick
}) => {
  const x1 = sourceNode.position_x;
  const y1 = sourceNode.position_y;
  const x2 = targetNode.position_x;
  const y2 = targetNode.position_y;

  const connectionTypeColors = {
    'ethernet': '#4ECDC4',
    'wifi': '#96CEB4',
    'fiber': '#FECA57',
    'vpn': '#FF6B6B',
    'logical': '#A8E6CF'
  };

  const color = connectionTypeColors[connection.connection_type] || '#48CAE4';
  const strokeWidth = connection.is_active ? (connection.trunk_mode ? 3 : 2) : 1;
  const opacity = connection.is_active ? 1 : 0.3;

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={opacity}
        strokeDasharray={connection.link_status === 'down' ? '5,5' : 'none'}
        className="cursor-pointer hover:stroke-white transition-colors"
        onClick={() => onConnectionClick(connection)}
      />
      
      {/* Connection label */}
      <text
        x={(x1 + x2) / 2}
        y={(y1 + y2) / 2 - 10}
        fill="white"
        fontSize="10"
        textAnchor="middle"
        className="pointer-events-none"
      >
        {connection.bandwidth_mbps >= 1000 ? `${connection.bandwidth_mbps / 1000}G` : `${connection.bandwidth_mbps}M`}
      </text>
    </g>
  );
};

export const NetworkTopologyMap: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<NetworkConnection | null>(null);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [filter, setFilter] = useState<TopologyFilter>({});
  const [mapSize, setMapSize] = useState({ width: 1000, height: 700 });
  
  const { data: nodes = [], isLoading: nodesLoading } = useTopologyNodes(filter);
  const { data: connections = [] } = useNetworkConnections();
  const { data: vlans = [] } = useVLANConfigurations();
  const updateNodeMutation = useUpdateTopologyNode();

  // Create VLAN color mapping
  const vlanColors: Record<number, string> = {
    10: '#4A90E2', // Admin - Blue
    20: '#7ED321', // Trusted - Green
    30: '#F5A623', // IoT - Orange
    40: '#D0021B', // Guest - Red
    50: '#9013FE', // Gaming - Purple
    60: '#50E3C2', // VoIP - Teal
    70: '#B71C1C', // Security - Dark Red
    80: '#FF9800', // Kids - Orange
    90: '#673AB7', // Media - Deep Purple
    100: '#607D8B'  // Lab - Blue Grey
  };

  const handleNodeClick = (node: TopologyNode) => {
    setSelectedNode(node);
    setShowNodeModal(true);
  };

  const handleConnectionClick = (connection: NetworkConnection) => {
    setSelectedConnection(connection);
    setShowConnectionModal(true);
  };

  const handleNodeDrag = (nodeId: string, position: NodePosition) => {
    updateNodeMutation.mutate({
      id: nodeId,
      updates: {
        position_x: Math.max(50, Math.min(mapSize.width - 50, position.x)),
        position_y: Math.max(50, Math.min(mapSize.height - 50, position.y))
      }
    });
  };

  const getNodeTypeLabel = (nodeType: TopologyNode['node_type']): string => {
    const labels = {
      'wan_gateway': 'WAN Gateway',
      'router': 'Router',
      'switch': 'Switch',
      'access_point': 'Access Point',
      'server': 'Server',
      'client': 'İstemci',
      'iot_device': 'IoT Cihazı',
      'gaming_device': 'Oyun Cihazı'
    };
    return labels[nodeType] || nodeType;
  };

  const getVLANName = (vlanId?: number): string => {
    if (!vlanId) return 'VLAN yok';
    const vlan = vlans.find(v => v.vlan_id === vlanId);
    return vlan ? `VLAN ${vlanId} - ${vlan.vlan_name}` : `VLAN ${vlanId}`;
  };

  if (nodesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-white/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Topology Controls */}
      <Card title="Topoloji Kontrolleri">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filter.node_types?.[0] || ''}
            onChange={(e) => setFilter({ ...filter, node_types: e.target.value ? [e.target.value as TopologyNode['node_type']] : undefined })}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
          >
            <option value="">Tüm Cihaz Türleri</option>
            <option value="wan_gateway">WAN Gateway</option>
            <option value="router">Router</option>
            <option value="switch">Switch</option>
            <option value="access_point">Access Point</option>
            <option value="server">Server</option>
            <option value="client">İstemci</option>
            <option value="iot_device">IoT Cihazı</option>
            <option value="gaming_device">Oyun Cihazı</option>
          </select>

          <select
            value={filter.vlans?.[0] || ''}
            onChange={(e) => setFilter({ ...filter, vlans: e.target.value ? [parseInt(e.target.value)] : undefined })}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none"
          >
            <option value="">Tüm VLAN'lar</option>
            {vlans.map(vlan => (
              <option key={vlan.vlan_id} value={vlan.vlan_id}>
                VLAN {vlan.vlan_id} - {vlan.vlan_name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="online-only"
              checked={filter.online_only || false}
              onChange={(e) => setFilter({ ...filter, online_only: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 bg-white/10"
            />
            <label htmlFor="online-only" className="text-white text-sm">Sadece çevrimiçi</label>
          </div>

          <Button variant="outline" size="sm">
            <Icons.RotateCcw className="w-4 h-4 mr-2" />
            Otomatik Düzen
          </Button>

          <Button size="sm">
            <Icons.Search className="w-4 h-4 mr-2" />
            Topoloji Tara
          </Button>
        </div>
      </Card>

      {/* Topology Map */}
      <Card title="Ağ Topoloji Haritası" className="overflow-hidden">
        <div className="relative bg-gray-900/50 rounded-xl border border-white/10" style={{ height: mapSize.height }}>
          {/* Background Grid */}
          <svg
            width="100%"
            height="100%"
            className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          >
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Connection Lines */}
            {connections.map((connection) => {
              const sourceNode = nodes.find(n => n.id === connection.source_node_id);
              const targetNode = nodes.find(n => n.id === connection.target_node_id);
              
              if (!sourceNode || !targetNode) return null;
              
              return (
                <ConnectionLine
                  key={connection.id}
                  connection={connection}
                  sourceNode={sourceNode}
                  targetNode={targetNode}
                  onConnectionClick={handleConnectionClick}
                />
              );
            })}
          </svg>

          {/* Topology Nodes */}
          {nodes.map((node) => (
            <TopologyNodeComponent
              key={node.id}
              node={node}
              connections={connections}
              isSelected={selectedNode?.id === node.id}
              onNodeClick={handleNodeClick}
              onNodeDrag={handleNodeDrag}
              vlanColors={vlanColors}
            />
          ))}

          {/* Empty State */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Icons.Network className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Henüz ağ topolojisi bulunmuyor</h3>
                <p className="text-white/60 mb-4">Ağ keşfi başlatın veya manuel olarak cihaz ekleyin</p>
                <div className="flex gap-2 justify-center">
                  <Button size="sm">
                    <Icons.Search className="w-4 h-4 mr-2" />
                    Ağ Keşfi
                  </Button>
                  <Button variant="outline" size="sm">
                    <Icons.Plus className="w-4 h-4 mr-2" />
                    Cihaz Ekle
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* VLAN Legend */}
      <Card title="VLAN Renk Kodu">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {vlans.filter(v => v.is_active).map((vlan) => (
            <div key={vlan.vlan_id} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded border border-white/20"
                style={{ backgroundColor: vlanColors[vlan.vlan_id] || '#48CAE4' }}
              />
              <span className="text-white text-sm">
                VLAN {vlan.vlan_id} - {vlan.vlan_name}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Node Details Modal */}
      <Modal
        isOpen={showNodeModal}
        onClose={() => {
          setShowNodeModal(false);
          setSelectedNode(null);
        }}
        title={selectedNode ? `${selectedNode.node_name} Detayları` : 'Cihaz Detayları'}
      >
        {selectedNode && (
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/60">Tür:</span>
                  <span className="text-white">{getNodeTypeLabel(selectedNode.node_type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">IP Adresi:</span>
                  <span className="text-white font-mono">{selectedNode.ip_address || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">MAC Adresi:</span>
                  <span className="text-white font-mono text-xs">{selectedNode.mac_address || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">VLAN:</span>
                  <span className="text-white">{getVLANName(selectedNode.vlan_id)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/60">Durum:</span>
                  <span className={selectedNode.is_online ? 'text-emerald-400' : 'text-red-400'}>
                    {selectedNode.is_online ? 'Çevrimiçi' : 'Çevrimdışı'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Ping:</span>
                  <span className="text-white">{selectedNode.ping_latency_ms}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Bant Genişliği:</span>
                  <span className="text-white">{selectedNode.bandwidth_usage_mbps} Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Vendor:</span>
                  <span className="text-white">{selectedNode.vendor || 'Unknown'}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedNode.description && (
              <div>
                <span className="text-white/60 text-sm">Açıklama:</span>
                <p className="text-white text-sm mt-1">{selectedNode.description}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <Button variant="outline" className="flex-1">
                <Icons.Edit className="w-4 h-4 mr-2" />
                Düzenle
              </Button>
              <Button variant="outline" className="flex-1">
                <Icons.Activity className="w-4 h-4 mr-2" />
                Ping Test
              </Button>
              <Button variant="destructive" className="flex-1">
                <Icons.Trash2 className="w-4 h-4 mr-2" />
                Kaldır
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Connection Details Modal */}
      <Modal
        isOpen={showConnectionModal}
        onClose={() => {
          setShowConnectionModal(false);
          setSelectedConnection(null);
        }}
        title="Bağlantı Detayları"
      >
        {selectedConnection && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/60">Tür:</span>
                  <span className="text-white capitalize">{selectedConnection.connection_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Bant Genişliği:</span>
                  <span className="text-white">{selectedConnection.bandwidth_mbps} Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Gecikme:</span>
                  <span className="text-white">{selectedConnection.latency_ms}ms</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/60">Durum:</span>
                  <span className={selectedConnection.link_status === 'up' ? 'text-emerald-400' : 'text-red-400'}>
                    {selectedConnection.link_status === 'up' ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Kullanım:</span>
                  <span className="text-white">{selectedConnection.utilization_percent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Paket Kaybı:</span>
                  <span className="text-white">{selectedConnection.packet_loss_percent}%</span>
                </div>
              </div>
            </div>

            {/* VLAN Tags */}
            {selectedConnection.vlan_tags.length > 0 && (
              <div>
                <span className="text-white/60 text-sm">VLAN Etiketleri:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedConnection.vlan_tags.map(vlanId => (
                    <span 
                      key={vlanId}
                      className="px-2 py-1 rounded text-xs border"
                      style={{
                        backgroundColor: `${vlanColors[vlanId] || '#48CAE4'}20`,
                        borderColor: `${vlanColors[vlanId] || '#48CAE4'}60`,
                        color: vlanColors[vlanId] || '#48CAE4'
                      }}
                    >
                      VLAN {vlanId}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};